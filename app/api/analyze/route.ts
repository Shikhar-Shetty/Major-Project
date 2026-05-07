import { NextResponse } from "next/server";
import { extractUrls } from "@/lib/urlUtils";
import type { AnalysisResponse, VirusTotalResponse } from "@/lib/types";
import {
  PHISHING_ANALYSIS_SYSTEM_PROMPT,
  PHISHING_ANALYSIS_USER_PROMPT,
  GROQ_CONFIG,
  VIRUSTOTAL_API,
} from "@/lib/constants";

async function callVirusTotal(url: string, apiKey: string): Promise<VirusTotalResponse> {
  if (!apiKey) return { error: "Missing VirusTotal API key" };
  try {
    const form = new URLSearchParams();
    form.append("url", url);

    const postRes = await fetch(`${VIRUSTOTAL_API.baseUrl}${VIRUSTOTAL_API.urlsEndpoint}`, {
      method: "POST",
      headers: {
        "x-apikey": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    if (!postRes.ok) {
      const text = await postRes.text().catch(() => "");
      return { error: `VirusTotal POST failed: ${postRes.status} ${postRes.statusText} ${text}` };
    }
    const postJson = await postRes.json();
    const analysisId = postJson?.data?.id;
    if (!analysisId) return { error: "VirusTotal returned no analysis id" };

    // GET url analysis
    const getRes = await fetch(`https://www.virustotal.com/api/v3/urls/${analysisId}`, {
      headers: { "x-apikey": apiKey },
    });
    if (!getRes.ok) {
      const text = await getRes.text().catch(() => "");
      return { error: `VirusTotal GET failed: ${getRes.status} ${getRes.statusText} ${text}` };
    }
    const getJson = await getRes.json();
    const stats = getJson?.data?.attributes?.last_analysis_stats || {};
    const total = Object.values(stats).reduce((a: any, b: any) => a + b, 0);
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const detectionRatio = `${malicious + suspicious}/${total}`;

    return {
      raw: getJson,
      stats,
      detectionRatio,
      is_malicious: malicious > 0 || suspicious > 0,
    };
  } catch (err) {
    return { error: `VirusTotal fetch error: ${String(err)}` };
  }
}

async function callGroq(prompt: string, apiKey?: string) {
  if (!apiKey) {
    return { error: "Missing GROQ_API_KEY" };
  }

  try {
    const endpoint = GROQ_CONFIG.endpoint;
    console.debug(`Calling Groq endpoint: ${endpoint} (hasKey=${!!apiKey})`);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: [
          {
            role: "system",
            content: PHISHING_ANALYSIS_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: GROQ_CONFIG.temperature,
        max_tokens: GROQ_CONFIG.maxTokens,
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error(`Groq non-ok response: ${res.status} ${res.statusText} - ${t}`);
      return { error: `Groq API returned ${res.status} ${res.statusText}: ${t}` };
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content || "";
    
    if (!content) {
      return { error: "Groq returned empty content" };
    }

    // Extract JSON from content
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = content.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        return { raw: content };
      }
    }

    // fallback: try parse as json
    try {
      return JSON.parse(content);
    } catch (e) {
      return { raw: content };
    }
  } catch (err: any) {
    console.error("Groq fetch error:", err);
    return { error: `Groq fetch error: ${String(err)}`, stack: err?.stack || null };
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email text" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || "";
    const vtKey = process.env.VIRUS_TOTAL_API_KEY || process.env.VIRUSTOTAL_API_KEY || "";

    const urls = await extractUrls(email);

    const url_analysis: any[] = [];
    for (const u of urls) {
      const vt = await callVirusTotal(u, vtKey);
      if (vt?.error) {
        url_analysis.push({ url: u, error: vt.error });
      } else {
        url_analysis.push({ url: u, is_malicious: !!vt?.is_malicious, virus_total_score: vt?.detectionRatio || null, raw: vt?.raw || null });
      }
    }

    // Build analysis prompt
    const analysisPrompt = PHISHING_ANALYSIS_USER_PROMPT(email, urls, url_analysis);

    const groqResp = await callGroq(analysisPrompt, groqKey);

    // Diagnostic flags about keys
    const diagnostics = { hasGroqKey: !!groqKey, hasVirusTotalKey: !!vtKey };

    // If groqResp already looks like the expected JSON, use it. Otherwise merge.
    let finalJson: any = null;
    if (groqResp && typeof groqResp === "object" && groqResp.verdict) {
      finalJson = groqResp;
    } else if (groqResp && groqResp.raw) {
      // LLM returned raw text that couldn't be parsed; include it in response
      finalJson = {
        verdict: "Unknown",
        confidence: 0,
        threat_level: "Low",
        mitre_attack: "T1566.002",
        reasoning: ["LLM output was not valid JSON; see raw response"],
        url_analysis,
        summary: "LLM did not return valid JSON; see raw field",
        raw: groqResp.raw,
        diagnostics,
      };
    } else if (groqResp && groqResp.error) {
      return NextResponse.json({ error: groqResp.error, diagnostics }, { status: 500 });
    } else {
      finalJson = {
        verdict: "Unknown",
        confidence: 0,
        threat_level: "Low",
        mitre_attack: "T1566.002",
        reasoning: ["No usable LLM response"],
        url_analysis,
        summary: "No LLM response",
        diagnostics,
      };
    }

    // Ensure url_analysis is attached
    finalJson.url_analysis = url_analysis;

    return NextResponse.json(finalJson);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
