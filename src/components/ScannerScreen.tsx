"use client";
import { useState, useEffect } from "react";
import { ScanResult, ScanHistoryItem } from "@/lib/types";
import { ShieldIcon, getRiskColors } from "@/components/ui";
import WarnCircleModal from "@/components/WarnCircleModal";

const HISTORY_KEY = "safesg_scan_history";

function saveScanToHistory(input: string, result: ScanResult, reported: boolean) {
  try {
    const existing: ScanHistoryItem[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const item: ScanHistoryItem = {
      id: Date.now(),
      input: input.length > 100 ? input.slice(0, 100) + "…" : input,
      scamType: result.scamType,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      verdict: result.verdict,
      scannedAt: new Date().toISOString(),
      reported,
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...existing].slice(0, 50)));
  } catch {}
}

interface Props {
  onReport: (input: string, result: ScanResult) => void;
  onGoToCommunity: () => void;
}

export default function ScannerScreen({ onReport, onGoToCommunity }: Props) {
  const [input, setInput]         = useState("");
  const [mode, setMode]           = useState<"text" | "url">("text");
  const [scanning, setScanning]   = useState(false);
  const [result, setResult]       = useState<ScanResult | null>(null);
  const [dots, setDots]           = useState(0);
  const [reported, setReported]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warned, setWarned]       = useState(false);

  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, [scanning]);

  const scan = async () => {
    if (!input.trim()) return;
    setScanning(true);
    setResult(null);
    setReported(false);
    setWarned(false);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });
      const data: ScanResult = await res.json();
      setResult(data);
      saveScanToHistory(input, data, false);
    } catch {
      const fallback: ScanResult = {
        riskLevel: "MEDIUM", riskScore: 50,
        verdict: "Could not analyse — treat with caution.",
        scamType: "Unknown",
        redFlags: ["Analysis failed — err on the side of caution"],
        whatToDo: ["Do not click any links", "Verify through official channels"],
        explanation: "The analysis service encountered an error. When in doubt, do not engage.",
      };
      setResult(fallback);
      saveScanToHistory(input, fallback, false);
    }
    setScanning(false);
  };

  const handleReport = () => {
    if (!result) return;
    onReport(input, result);
    setReported(true);
    try {
      const existing: ScanHistoryItem[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (existing.length > 0) { existing[0].reported = true; localStorage.setItem(HISTORY_KEY, JSON.stringify(existing)); }
    } catch {}
  };

  const { color: riskColor, glow: riskGlow } = result ? getRiskColors(result.riskLevel) : { color: "#00d4ff", glow: "rgba(0,212,255,0.1)" };

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e8f0fe" }}>Scam Scanner</h1>
        <p style={{ color: "#7b8fad", fontSize: 14, marginTop: 4 }}>Paste a message, URL, or describe what you received</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {(["text", "url"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{ background: mode === m ? "rgba(0,212,255,0.1)" : "transparent", border: `1px solid ${mode === m ? "#00d4ff" : "#1e2d45"}`, borderRadius: 8, padding: "6px 16px", color: mode === m ? "#00d4ff" : "#4a5568", cursor: "pointer", fontSize: 13, fontWeight: mode === m ? 600 : 400 }}>
            {m === "text" ? "📝 Text / Message" : "🔗 URL / Link"}
          </button>
        ))}
      </div>

      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} placeholder={mode === "url" ? "Paste a suspicious URL here..." : "Paste the suspicious message, SMS, or email..."} style={{ resize: "none", lineHeight: 1.6 }} />

      <button onClick={scan} disabled={scanning || !input.trim()} style={{ width: "100%", marginTop: 12, background: scanning ? "rgba(0,212,255,0.1)" : "#00d4ff", border: scanning ? "1px solid #00d4ff" : "none", borderRadius: 10, padding: "14px", color: scanning ? "#00d4ff" : "#0a0e1a", fontWeight: 700, fontSize: 15, cursor: scanning ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: !scanning && !input.trim() ? 0.5 : 1, transition: "all 0.2s" }}>
        {scanning ? <><span className="spinner" />{`Analysing${".".repeat(dots)}`}</> : <><ShieldIcon size={18} color="#0a0e1a" /> Scan Now</>}
      </button>

      {result && (
        <div className="fade-in" style={{ marginTop: 28 }}>
          <div className="card" style={{ marginBottom: 14, border: `1px solid ${riskColor}44`, background: riskGlow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <p style={{ color: "#4a5568", fontSize: 11, letterSpacing: 1, marginBottom: 4 }}>RISK LEVEL</p>
                <p style={{ color: riskColor, fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{result.riskLevel}</p>
                <p style={{ color: "#7b8fad", fontSize: 13, marginTop: 4 }}>{result.scamType}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 44, fontWeight: 800, color: riskColor, lineHeight: 1 }}>{result.riskScore}</div>
                <div style={{ color: "#4a5568", fontSize: 12 }}>/ 100</div>
              </div>
            </div>
            <div style={{ background: "#0a0e1a", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${result.riskScore}%`, background: riskColor, borderRadius: 6, transition: "width 1.2s ease" }} />
            </div>
            <p style={{ color: "#7b8fad", fontSize: 13, marginTop: 12, fontStyle: "italic" }}>"{result.verdict}"</p>
          </div>

          {result.redFlags?.length > 0 && (
            <div className="card" style={{ marginBottom: 12 }}>
              <p style={{ color: "#ff4757", fontWeight: 600, fontSize: 14, marginBottom: 10 }}>🚩 Red Flags</p>
              {result.redFlags.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: "#ff4757" }}>•</span>
                  <span style={{ color: "#7b8fad", fontSize: 13 }}>{f}</span>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ marginBottom: 12 }}>
            <p style={{ color: "#2ed573", fontWeight: 600, fontSize: 14, marginBottom: 10 }}>✅ What To Do</p>
            {result.whatToDo?.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "#2ed573" }}>{i + 1}.</span>
                <span style={{ color: "#7b8fad", fontSize: 13 }}>{a}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ color: "#4a5568", fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>ANALYSIS</p>
            <p style={{ color: "#7b8fad", fontSize: 13, lineHeight: 1.7 }}>{result.explanation}</p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            {!warned ? (
              <button onClick={() => setShowModal(true)} style={{ flex: 1, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.27)", borderRadius: 10, padding: 14, color: "#00d4ff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                🔔 Warn My Circle
              </button>
            ) : (
              <div style={{ flex: 1, background: "rgba(46,213,115,0.1)", border: "1px solid rgba(46,213,115,0.27)", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <p style={{ color: "#2ed573", fontWeight: 600, fontSize: 14 }}>✅ Circle warned!</p>
              </div>
            )}
            {result.riskLevel !== "LOW" && !reported && (
              <button onClick={handleReport} style={{ flex: 1, background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.27)", borderRadius: 10, padding: 14, color: "#ff4757", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                ⚠️ Report
              </button>
            )}
          </div>

          {reported && (
            <div className="card" style={{ background: "rgba(46,213,115,0.1)", border: "1px solid rgba(46,213,115,0.27)", textAlign: "center" }}>
              <p style={{ color: "#2ed573", fontWeight: 600, fontSize: 15 }}>✅ Report submitted</p>
              <p style={{ color: "#4a5568", fontSize: 13, marginTop: 4 }}>Thank you for keeping Singapore safe</p>
              <button onClick={onGoToCommunity} style={{ marginTop: 10, background: "none", border: "1px solid rgba(46,213,115,0.4)", borderRadius: 8, padding: "6px 16px", color: "#2ed573", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                View in Community →
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && result && (
        <WarnCircleModal
          title={result.scamType + " Detected"}
          summary={input.slice(0, 120)}
          risk={result.riskLevel}
          onClose={() => setShowModal(false)}
          onWarn={() => { setWarned(true); setShowModal(false); }}
        />
      )}
    </div>
  );
}
