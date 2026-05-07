import { NextResponse } from "next/server";
import { extractUrls } from "@/lib/urlUtils";
import type { AnalysisResponse, UrlAnalysisResult, VirusTotalResponse } from "@/lib/types";
import {
  PHISHING_ANALYSIS_SYSTEM_PROMPT,
  PHISHING_ANALYSIS_USER_PROMPT,
  GROQ_CONFIG,
  VIRUSTOTAL_API,
} from "@/lib/constants";

async function callVirusTotal(url: string, apiKey: string): Promise<VirusTotalResponse> {
  if (!apiKey) return { error: "Missing VirusTotal API key" };
  try {
    const urlId = Buffer.from(url, "utf8")
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

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
    const postJson = (await postRes.json()) as { data?: { id?: string } };
    const analysisId = postJson.data?.id;
    if (!analysisId) return { error: "VirusTotal returned no analysis id" };

    const fetchUrlReport = async () => {
      const res = await fetch(`${VIRUSTOTAL_API.baseUrl}/urls/${urlId}`, {
        headers: { "x-apikey": apiKey },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { error: `VirusTotal URL report GET failed: ${res.status} ${res.statusText} ${text}` } as const;
      }

      return res.json() as Promise<{
        data?: {
          attributes?: {
            last_analysis_stats?: Record<string, number>;
            last_analysis_date?: number;
            reputation?: number;
          };
        };
      }>;
    };

    const reportJson = await fetchUrlReport();
    if ("error" in reportJson) {
      return { error: reportJson.error };
    }

    const stats = reportJson.data?.attributes?.last_analysis_stats || {};
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const detectionRatio = total > 0 ? `${malicious + suspicious}/${total}` : null;

    return {
      raw: reportJson,
      stats,
      detectionRatio,
      is_malicious: total > 0 && (malicious > 0 || suspicious > 0),
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return { error: `VirusTotal fetch error: ${error}` };
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
      } catch {
        return { raw: content };
      }
    }

    try {
      return JSON.parse(content);
    } catch {
      return { raw: content };
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Groq fetch error:", error);
    return { error: `Groq fetch error: ${error.message}`, stack: error.stack || null };
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

    const url_analysis: UrlAnalysisResult[] = [];
    for (const u of urls) {
      const vt = await callVirusTotal(u, vtKey);
      if (vt?.error) {
        url_analysis.push({ url: u, error: vt.error });
      } else {
        url_analysis.push({ url: u, is_malicious: !!vt?.is_malicious, virus_total_score: vt?.detectionRatio || null, raw: vt?.raw || null });
      }
    }

    const analysisPrompt = PHISHING_ANALYSIS_USER_PROMPT(email, urls, url_analysis);

    const groqResp = await callGroq(analysisPrompt, groqKey);

    const diagnostics = { hasGroqKey: !!groqKey, hasVirusTotalKey: !!vtKey };

    let finalJson: AnalysisResponse | null = null;
    if (groqResp && typeof groqResp === "object" && groqResp.verdict) {
      finalJson = groqResp as AnalysisResponse;
    } else if (groqResp && groqResp.raw) {
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

    finalJson.url_analysis = url_analysis;

    return NextResponse.json(finalJson);
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}
