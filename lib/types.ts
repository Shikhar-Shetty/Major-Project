/**
 * Shared types for phishing analysis
 */

export interface UrlAnalysisResult {
  url: string;
  is_malicious?: boolean;
  virus_total_score?: string | null;
  error?: string;
  raw?: unknown;
}

export interface AnalysisResponse {
  verdict: "Phishing" | "Legitimate" | "Unknown";
  confidence: number;
  threat_level: "Low" | "Medium" | "High" | "Critical";
  mitre_attack: string;
  reasoning: string[];
  url_analysis: UrlAnalysisResult[];
  summary: string;
  diagnostics?: {
    hasGroqKey: boolean;
    hasVirusTotalKey: boolean;
  };
  raw?: string;
  error?: string;
  stack?: string | null;
}

export interface VirusTotalResponse {
  error?: string;
  raw?: unknown;
  stats?: Record<string, number>;
  detectionRatio?: string | null;
  is_malicious?: boolean;
}
