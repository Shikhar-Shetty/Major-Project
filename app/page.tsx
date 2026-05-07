"use client";

import { useState } from "react";
import type { AnalysisResponse } from "@/lib/types";
import { sampleEmails } from "@/data/testEmails";

export default function Home() {
  const [emailText, setEmailText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analyze failed");
      setResult(data as AnalysisResponse);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const confidence = Math.max(0, Math.min(100, result?.confidence ?? 0));
  const verdictTone = result?.verdict === "Phishing" ? "danger" : result?.verdict === "Legitimate" ? "success" : "neutral";
  const verdictLabel = result?.verdict ?? "Awaiting analysis";

  return (
    <main className="relative min-h-screen overflow-hidden text-[var(--foreground)]">
      <div className="noise" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,rgba(143,247,208,0.08),transparent_25%),radial-gradient(circle_at_85%_15%,rgba(255,107,91,0.08),transparent_20%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 grid gap-4 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
          <div className="glass-panel-strong rounded-[2rem] px-6 py-6 sm:px-8 sm:py-7">
            <div className="mb-4 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.42em] text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_16px_rgba(143,247,208,0.85)]" />
              Threat Intelligence Console
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[0.95] text-[#f7fbfb] sm:text-6xl lg:text-[5rem]">
              Read email like a hostile system.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Paste a message, inspect the social engineering pattern, and let the model cross-check links through VirusTotal before it issues a verdict.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["LLM reasoning", "Groq Llama 3.3"],
                ["Link triage", "VirusTotal reputation"],
                ["Output", "Strict JSON response"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--muted)]">{label}</div>
                  <div className="mt-1 text-sm text-[#f3f7f7]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-[var(--muted)]">Operational status</div>
                <div className="mt-2 text-lg font-medium text-[#f7fbfb]">Analysis pipeline ready</div>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-[0.72rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                Live
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Verdict", verdictLabel],
                ["Confidence", `${confidence}%`],
                ["Threat", result?.threat_level ?? "--"],
                ["MITRE", result?.mitre_attack ?? "--"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-[0.62rem] uppercase tracking-[0.28em] text-[var(--muted)]">{label}</div>
                  <div className="mt-1 text-sm text-[#f8fcfc]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-[2rem] p-5 sm:p-6 scanline">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-[var(--muted)]">Case file</div>
                <h2 className="mt-2 text-2xl font-semibold text-[#f5faf9]">Email input and orchestration</h2>
              </div>
              <div className="rounded-full border border-[var(--accent)]/20 bg-[rgba(143,247,208,0.08)] px-3 py-1 text-[0.7rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                Subject + Body
              </div>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-[#05090d]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <label className="mb-2 block text-[0.68rem] uppercase tracking-[0.3em] text-[var(--muted)]">Paste full email</label>
              <textarea
                className="min-h-[340px] w-full resize-none rounded-[1.15rem] border border-white/8 bg-[#081015] px-4 py-4 font-mono-app text-sm leading-6 text-[#edf6f5] outline-none transition placeholder:text-[#6f8180] focus:border-[rgba(143,247,208,0.45)] focus:ring-2 focus:ring-[rgba(143,247,208,0.12)] sm:min-h-[380px]"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder={sampleEmails.phishing[0]}
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#ecf4f3] transition hover:border-[rgba(143,247,208,0.35)] hover:bg-[rgba(143,247,208,0.08)]"
                    onClick={() => setEmailText(sampleEmails.phishing[0])}
                  >
                    Load phishing
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#ecf4f3] transition hover:border-[rgba(143,247,208,0.35)] hover:bg-[rgba(143,247,208,0.08)]"
                    onClick={() => setEmailText(sampleEmails.legit[0])}
                  >
                    Load legitimate
                  </button>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#07110f] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-55"
                  onClick={analyze}
                  disabled={loading || !emailText.trim()}
                >
                  {loading ? (
                    <>
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#07110f]" />
                      Analyzing threat vectors...
                    </>
                  ) : (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-[#07110f]" />
                      Analyze email
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-[rgba(255,107,91,0.2)] bg-[rgba(255,107,91,0.08)] px-4 py-3 text-sm text-[#ffd6d2]">
                  {error}
                </div>
              )}
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.35em] text-[var(--muted)]">Test corpus</div>
                  <h3 className="mt-2 text-lg font-medium text-[#f7fbfb]">Seed messages</h3>
                </div>
                <div className="font-mono-app text-[0.7rem] text-[var(--muted)]">10 samples</div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/15 p-3">
                  <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--muted)]">Phishing set</div>
                  <div className="mt-1 text-sm text-[#f5faf9]">Bank alerts, delivery scams, login bait, password resets.</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/15 p-3">
                  <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--muted)]">Legit set</div>
                  <div className="mt-1 text-sm text-[#f5faf9]">Work updates, meeting invites, onboarding, maintenance notices.</div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <div className="text-[0.68rem] uppercase tracking-[0.35em] text-[var(--muted)]">Observation layer</div>
              <div className="mt-3 grid gap-3 text-sm text-[#edf6f5]">
                {[
                  "Reason about intent, not just keywords.",
                  "Flag urgency, credential theft, and deceptive links.",
                  "Cross-check URLs before final verdict.",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel-strong rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.35em] text-[var(--muted)]">Verdict deck</div>
                <h3 className="mt-2 text-2xl font-semibold text-[#f7fbfb]">Structured decision output</h3>
              </div>
              <div
                className={`rounded-full border px-3 py-1 text-[0.72rem] uppercase tracking-[0.26em] ${
                  verdictTone === "danger"
                    ? "border-[rgba(255,107,91,0.22)] bg-[rgba(255,107,91,0.12)] text-[#ffb6ad]"
                    : verdictTone === "success"
                      ? "border-[rgba(143,247,208,0.22)] bg-[rgba(143,247,208,0.12)] text-[var(--accent)]"
                      : "border-white/10 bg-white/[0.04] text-[var(--muted)]"
                }`}
              >
                {result?.verdict ?? "Awaiting input"}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/8 bg-[#060b0f] p-4">
                <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.28em] text-[var(--muted)]">
                  Confidence
                  <span className="font-mono-app text-[0.72rem] text-[#f3f7f7]">{confidence}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--danger),var(--warning),var(--accent))] transition-all duration-700"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/8 bg-[#060b0f] p-4">
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--muted)]">Threat posture</div>
                <div className="mt-2 text-lg font-medium text-[#f6fbfa]">{result?.threat_level ?? "Unknown"}</div>
                <div className="mt-1 text-sm text-[var(--muted)]">MITRE mapping: {result?.mitre_attack ?? "--"}</div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-white/8 bg-[#060b0f] p-4">
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--muted)]">Summary</div>
              <p className="mt-2 text-sm leading-6 text-[#eef5f4]">
                {result?.summary ?? "Run an analysis to generate an explainable verdict and URL validation trace."}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.35em] text-[var(--muted)]">Reasoning log</div>
                  <h3 className="mt-2 text-lg font-medium text-[#f7fbfb]">Explainable signals</h3>
                </div>
                <div className="font-mono-app text-[0.7rem] text-[var(--muted)]">{result?.reasoning?.length ?? 0} notes</div>
              </div>

              <div className="mt-4 space-y-3">
                {(result?.reasoning?.length ? result.reasoning : ["No analysis yet."]).map((item, index) => (
                  <div key={`${item}-${index}`} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full border border-[rgba(143,247,208,0.22)] bg-[rgba(143,247,208,0.08)] text-center text-[0.68rem] leading-6 text-[var(--accent)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="text-sm leading-6 text-[#eef4f3]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.35em] text-[var(--muted)]">URL analysis</div>
                  <h3 className="mt-2 text-lg font-medium text-[#f7fbfb]">VirusTotal triage</h3>
                </div>
                <div className="font-mono-app text-[0.7rem] text-[var(--muted)]">{result?.url_analysis?.length ?? 0} links</div>
              </div>

              <div className="mt-4 space-y-3">
                {result?.url_analysis?.length ? (
                  result.url_analysis.map((item) => (
                    <div key={item.url} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="break-all font-mono-app text-sm leading-6 text-[#edf5f4]">{item.url}</p>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.2em] ${
                            item.error
                              ? "border-[rgba(255,107,91,0.25)] bg-[rgba(255,107,91,0.12)] text-[#ffb6ad]"
                              : item.is_malicious
                                ? "border-[rgba(255,107,91,0.25)] bg-[rgba(255,107,91,0.12)] text-[#ffb6ad]"
                                : "border-[rgba(143,247,208,0.2)] bg-[rgba(143,247,208,0.1)] text-[var(--accent)]"
                          }`}
                        >
                          {item.error ? "Error" : item.is_malicious ? "Malicious" : "Clean"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[0.72rem] text-[var(--muted)]">
                        <span className="rounded-full border border-white/8 px-2.5 py-1">VT score: {item.virus_total_score ?? "N/A"}</span>
                        {item.error ? <span className="rounded-full border border-white/8 px-2.5 py-1">{item.error}</span> : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-[var(--muted)]">
                    No URLs detected or no scan has been run yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-5 flex flex-col gap-2 border-t border-white/8 py-4 text-[0.72rem] uppercase tracking-[0.28em] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <div>PhishAI / Phase 1 intelligence interface</div>
          <div>Groq reasoning · VirusTotal validation · MITRE mapping</div>
        </footer>
      </div>
    </main>
  );
}
