"use client";
import { useState, useEffect } from "react";
import { ScanResult, ScanHistoryItem } from "@/lib/types";
import { ShieldIcon, getRiskColors } from "@/components/ui";
import WarnCircleModal from "@/components/WarnCircleModal";

const HISTORY_KEY = "safesg_scan_history";

type ScanMode = "text" | "url" | "image";

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
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ScanMode>("text");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dots, setDots] = useState(0);
  const [reported, setReported] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warned, setWarned] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState("image/jpeg");
  const [imageName, setImageName] = useState("");

  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, [scanning]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.split(",")[1] || "";
      setImageBase64(base64);
      setImagePreview(result);
      setImageMimeType(file.type || "image/jpeg");
      setImageName(file.name);
      setMode("image");
      setResult(null);
      setReported(false);
      setWarned(false);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    setImageMimeType("image/jpeg");
    setImageName("");
    if (mode === "image") {
      setMode("text");
    }
  };

  const canScan = Boolean(input.trim() || imageBase64);

  const scan = async () => {
    if (!canScan) return;
    setScanning(true);
    setResult(null);
    setReported(false);
    setWarned(false);

    const scanSummary = imageBase64
      ? `${input.trim() ? input.trim() + " | " : ""}Image upload: ${imageName || "uploaded screenshot"}`
      : input;

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input,
          imageBase64,
          imageMimeType,
        }),
      });
      const data: ScanResult = await res.json();
      setResult(data);
      saveScanToHistory(scanSummary, data, false);
    } catch {
      const fallback: ScanResult = {
        riskLevel: "MEDIUM",
        riskScore: 50,
        verdict: "Could not analyse — treat with caution.",
        scamType: "Unknown",
        redFlags: ["Analysis failed — err on the side of caution"],
        whatToDo: ["Do not click any links", "Verify through official channels"],
        explanation: "The analysis service encountered an error. When in doubt, do not engage.",
      };
      setResult(fallback);
      saveScanToHistory(scanSummary, fallback, false);
    }

    setScanning(false);
  };

  const handleReport = () => {
    if (!result) return;
    const reportInput = imageBase64
      ? `${input.trim() ? input.trim() + " | " : ""}Image upload: ${imageName || "uploaded screenshot"}`
      : input;
    onReport(reportInput, result);
    setReported(true);
    try {
      const existing: ScanHistoryItem[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (existing.length > 0) {
        existing[0].reported = true;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(existing));
      }
    } catch {}
  };

  const { color: riskColor, glow: riskGlow } = result
    ? getRiskColors(result.riskLevel)
    : { color: "#00d4ff", glow: "rgba(0,212,255,0.1)" };

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e8f0fe" }}>Scam Scanner</h1>
        <p style={{ color: "#7b8fad", fontSize: 14, marginTop: 4 }}>
          Paste a message, URL, or upload a screenshot or photo for analysis
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {(["text", "url", "image"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              background: mode === m ? "rgba(0,212,255,0.1)" : "transparent",
              border: `1px solid ${mode === m ? "#00d4ff" : "#1e2d45"}`,
              borderRadius: 8,
              padding: "6px 16px",
              color: mode === m ? "#00d4ff" : "#4a5568",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: mode === m ? 600 : 400,
            }}
          >
            {m === "text"
              ? "📝 Text / Message"
              : m === "url"
              ? "🔗 URL / Link"
              : "🖼️ Image / Screenshot"}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={mode === "image" ? 4 : 5}
        placeholder={
          mode === "url"
            ? "Paste a suspicious URL here..."
            : mode === "image"
            ? "Optional: add context like who sent this or what the screenshot claims..."
            : "Paste the suspicious message, SMS, or email..."
        }
        style={{ resize: "none", lineHeight: 1.6 }}
      />

      <div
        className="card"
        style={{
          marginTop: 12,
          padding: 14,
          background: "rgba(10,14,26,0.68)",
          borderColor: "rgba(30,45,69,0.82)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#dcecff", fontSize: 14, fontWeight: 700 }}>Upload screenshot or photo</div>
            <p style={{ color: "#7b8fad", fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
              Add a screenshot of a scam SMS, fake payment page, suspicious profile, or message thread.
            </p>
          </div>
          <label
            style={{
              border: "1px solid rgba(0,212,255,0.24)",
              borderRadius: 10,
              padding: "10px 14px",
              background: "rgba(0,212,255,0.08)",
              color: "#7ce3ff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Choose image
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
          </label>
        </div>

        {imagePreview && (
          <div style={{ marginTop: 14 }}>
            <img
              src={imagePreview}
              alt="Uploaded screenshot preview"
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                borderRadius: 12,
                border: "1px solid #1e2d45",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ color: "#9eb2cc", fontSize: 12 }}>{imageName}</span>
              <button
                type="button"
                onClick={clearImage}
                style={{
                  border: "1px solid #1e2d45",
                  borderRadius: 10,
                  padding: "8px 12px",
                  background: "#0a0e1a",
                  color: "#d9e7f7",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Remove image
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={scan}
        disabled={scanning || !canScan}
        style={{
          width: "100%",
          marginTop: 12,
          background: scanning ? "rgba(0,212,255,0.1)" : "#00d4ff",
          border: scanning ? "1px solid #00d4ff" : "none",
          borderRadius: 10,
          padding: "14px 16px",
          color: scanning ? "#00d4ff" : "#031321",
          fontWeight: 700,
          fontSize: 15,
          cursor: scanning || !canScan ? "not-allowed" : "pointer",
          opacity: scanning || !canScan ? 0.75 : 1,
        }}
      >
        {scanning ? `Analyzing${".".repeat(dots)}` : imageBase64 ? "Scan image + text" : "Scan now"}
      </button>

      {result && (
        <div
          className="card"
          style={{
            marginTop: 18,
            padding: 18,
            borderColor: riskColor,
            boxShadow: `0 0 0 1px ${riskColor} inset, 0 0 24px ${riskGlow}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <ShieldIcon size={20} color={riskColor} />
            <div>
              <div style={{ color: riskColor, fontSize: 12, fontWeight: 700, letterSpacing: 0.6 }}>
                {result.riskLevel} RISK • {result.riskScore}/100
              </div>
              <div style={{ color: "#e8f0fe", fontSize: 18, fontWeight: 700 }}>{result.verdict}</div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#7b8fad", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Scam type</div>
            <div style={{ color: "#d8e6f7", fontSize: 15, fontWeight: 600 }}>{result.scamType}</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#7b8fad", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Red flags</div>
            <div style={{ display: "grid", gap: 8 }}>
              {result.redFlags.map((flag, i) => (
                <div key={i} className="card" style={{ padding: 12, background: "rgba(255,71,87,0.06)", borderColor: "rgba(255,71,87,0.16)" }}>
                  <span style={{ color: "#ff8c99", fontSize: 13 }}>⚠️ {flag}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#7b8fad", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>What to do</div>
            <div style={{ display: "grid", gap: 8 }}>
              {result.whatToDo.map((step, i) => (
                <div key={i} className="card" style={{ padding: 12, background: "rgba(0,212,255,0.06)", borderColor: "rgba(0,212,255,0.14)" }}>
                  <span style={{ color: "#7ce3ff", fontSize: 13 }}>{i + 1}. {step}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#7b8fad", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Explanation</div>
            <p style={{ color: "#c9d8ea", fontSize: 14, lineHeight: 1.7 }}>{result.explanation}</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!reported ? (
              <button
                onClick={handleReport}
                style={{
                  flex: 1,
                  minWidth: 160,
                  background: "rgba(255,71,87,0.1)",
                  border: "1px solid rgba(255,71,87,0.28)",
                  borderRadius: 10,
                  padding: 14,
                  color: "#ff8c99",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📢 Report to community
              </button>
            ) : (
              <div
                style={{
                  flex: 1,
                  minWidth: 160,
                  background: "rgba(46,213,115,0.1)",
                  border: "1px solid rgba(46,213,115,0.27)",
                  borderRadius: 10,
                  padding: 14,
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#2ed573", fontWeight: 600, fontSize: 14 }}>✅ Reported to community</p>
              </div>
            )}

            {result.riskLevel !== "LOW" && !warned && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  flex: 1,
                  minWidth: 160,
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.18)",
                  borderRadius: 10,
                  padding: 14,
                  color: "#7ce3ff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🛡️ Warn my circle
              </button>
            )}

            {warned && (
              <div
                style={{
                  flex: 1,
                  minWidth: 160,
                  background: "rgba(46,213,115,0.1)",
                  border: "1px solid rgba(46,213,115,0.27)",
                  borderRadius: 10,
                  padding: 14,
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#2ed573", fontWeight: 600, fontSize: 14 }}>✅ Circle warned!</p>
              </div>
            )}

            {reported && (
              <button
                onClick={onGoToCommunity}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid #1e2d45",
                  borderRadius: 10,
                  padding: 14,
                  color: "#7ce3ff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View in Community
              </button>
            )}
          </div>
        </div>
      )}

      {showModal && result && (
        <WarnCircleModal
          title={result.scamType + " Detected"}
          summary={(input || imageName || "Uploaded image").slice(0, 120)}
          risk={result.riskLevel}
          onClose={() => setShowModal(false)}
          onWarn={() => {
            setWarned(true);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
