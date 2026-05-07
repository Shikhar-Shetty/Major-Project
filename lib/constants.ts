/**
 * System prompts and configuration for phishing analysis
 */

export const PHISHING_ANALYSIS_SYSTEM_PROMPT = `You are a cybersecurity AI analyst specialized in phishing detection, social engineering analysis, and email threat intelligence.

Requirements:
- Analyze email content deeply.
- Detect phishing intent patterns and psychological manipulation.
- Classify attack type using MITRE ATT&CK mapping (T1566.001, T1566.002, T1566.003).
- Provide structured JSON only. Never hallucinate external facts.

Return STRICT JSON exactly as specified with keys: verdict, confidence, threat_level, mitre_attack, reasoning, url_analysis, summary.`;

export const PHISHING_ANALYSIS_USER_PROMPT = (email: string, urls: string[], urlAnalysis: any[]): string => {
  return `Analyze this email for phishing indicators:

Email Content:
${email}

Detected URLs: ${urls.length > 0 ? urls.join(", ") : "None"}

URL Threat Intelligence: ${JSON.stringify(urlAnalysis)}

Return a JSON object with:
- verdict: "Phishing" or "Legitimate"
- confidence: 0-100
- threat_level: "Low", "Medium", "High", or "Critical"
- mitre_attack: One of T1566.001, T1566.002, T1566.003
- reasoning: Array of strings explaining the analysis
- url_analysis: Array of URL analysis results
- summary: Brief explanation of the verdict`;
};

export const MITRE_ATTACK_TYPES = {
  T1566_001: "T1566.001", // Spearphishing Attachment
  T1566_002: "T1566.002", // Spearphishing Link
  T1566_003: "T1566.003", // Spearphishing via Service
} as const;

export const GROQ_CONFIG = {
  endpoint: "https://api.groq.com/openai/v1/chat/completions",
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  maxTokens: 1024,
};

export const VIRUSTOTAL_API = {
  baseUrl: "https://www.virustotal.com/api/v3",
  urlsEndpoint: "/urls",
};
