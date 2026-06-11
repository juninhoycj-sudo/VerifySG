"use client";
import { useRef, useState } from "react";
import { RiskLevel } from "@/lib/types";

interface ExportWarningCardProps {
  riskLevel: RiskLevel;
  riskScore?: number;
  verdict: string;
  scamType: string;
  redFlags: string[];
  whatToDo: string[];
  explanation?: string;
}

const RISK_STYLES: Record<RiskLevel, { color: string; glow: string; label: string; emoji: string }> = {
  HIGH:   { color: "#ff4757", glow: "rgba(255,71,87,0.18)",  label: "HIGH RISK",   emoji: "🚨" },
  MEDIUM: { color: "#ffa502", glow: "rgba(255,165,2,0.18)",  label: "MEDIUM RISK", emoji: "⚠️" },
  LOW:    { color: "#2ed573", glow: "rgba(46,213,115,0.18)", label: "LOW RISK",    emoji: "✅" },
};

/** Builds the PNG blob from the off-screen card ref */
async function buildPngBlob(cardRef: React.RefObject<HTMLDivElement>): Promise<{ blob: Blob; filename: string; scamType: string } | null> {
  const html2canvas = (await import("html2canvas")).default;
  if (!cardRef.current) return null;
  const canvas = await html2canvas(cardRef.current, {
    backgroundColor: "#0a0e1a",
    scale: 2,
    useCORS: true,
    logging: false,
  });
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(null); return; }
      resolve({ blob, filename: "", scamType: "" });
    }, "image/png");
  });
}

export default function ExportWarningCard(props: ExportWarningCardProps) {
  const { riskLevel, riskScore, verdict, scamType, redFlags, whatToDo, explanation } = props;
  const cardRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "generating" | "done" | "error">("idle");

  const risk = RISK_STYLES[riskLevel];
  const filename = `verifysg-warning-${scamType.replace(/\s+/g, "-").toLowerCase()}.png`;

  const shareText = [
    `🛡️ VerifySG SCAM ALERT — ${risk.emoji} ${risk.label}`,
    `"${verdict}"`,
    `Type: ${scamType}`,
    redFlags.length ? `\n🚩 Red flags:\n${redFlags.slice(0, 3).map(f => `• ${f}`).join("\n")}` : "",
    whatToDo.length ? `\n✅ What to do:\n${whatToDo.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join("\n")}` : "",
    `\nScanned with VerifySG — verifysg.app`,
  ].filter(Boolean).join("\n");

  const handleShare = async () => {
    setState("generating");
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0e1a",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Try Web Share API with file (mobile native sheet)
      const canShareFiles =
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator;

      if (canShareFiles) {
        const blob: Blob = await new Promise((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png")
        );
        const file = new File([blob], filename, { type: "image/png" });
        const shareData = { files: [file], text: shareText, title: `VerifySG — ${risk.label}: ${scamType}` };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setState("done");
          setTimeout(() => setState("idle"), 3000);
          return;
        }

        // canShare returned false — fall through to text-only share
        try {
          await navigator.share({ text: shareText, title: `VerifySG — ${risk.label}: ${scamType}` });
          setState("done");
          setTimeout(() => setState("idle"), 3000);
          return;
        } catch {
          // User cancelled or not supported — fall through to download
        }
      }

      // Desktop / unsupported browser — download the PNG directly
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
      setState("done");
      setTimeout(() => setState("idle"), 3000);
    } catch (err: any) {
      // AbortError = user cancelled the native sheet — treat silently as idle
      if (err?.name === "AbortError") {
        setState("idle");
      } else {
        console.error("Share/export failed:", err);
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      }
    }
  };

  const btnLabel =
    state === "generating" ? "Generating…" :
    state === "done"       ? "✅ Shared!" :
    state === "error"      ? "❌ Failed — try again" :
    "📤 Share warning card";

  const btnColor =
    state === "done"  ? "rgba(46,213,115,0.12)"  :
    state === "error" ? "rgba(255,71,87,0.1)"     :
                        "rgba(0,212,255,0.08)";

  const btnBorder =
    state === "done"  ? "1px solid rgba(46,213,115,0.32)"  :
    state === "error" ? "1px solid rgba(255,71,87,0.28)"   :
                        "1px solid rgba(0,212,255,0.22)";

  const btnTextColor =
    state === "done"  ? "#2ed573" :
    state === "error" ? "#ff8c99" :
    state === "generating" ? "#7b8fad" :
                        "#7ce3ff";

  return (
    <>
      {/* ── Share / download button ── */}
      <button
        onClick={handleShare}
        disabled={state === "generating"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: btnColor,
          border: btnBorder,
          borderRadius: 10,
          padding: "13px 16px",
          color: btnTextColor,
          fontWeight: 700,
          fontSize: 14,
          cursor: state === "generating" ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {state === "generating" && (
          <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
        )}
        {btnLabel}
      </button>

      {/* ── Off-screen poster captured by html2canvas ── */}
      <div
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: 420,
            background: "#0a0e1a",
            borderRadius: 20,
            border: `2px solid ${risk.color}`,
            boxShadow: `0 0 40px ${risk.glow}`,
            overflow: "hidden",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {/* Header band */}
          <div
            style={{
              background: `linear-gradient(135deg, ${risk.color}22 0%, ${risk.color}08 100%)`,
              borderBottom: `1px solid ${risk.color}44`,
              padding: "20px 24px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill={risk.color} opacity="0.25" />
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" stroke={risk.color} strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" stroke={risk.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: risk.color, fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>VERIFYSG</span>
              </div>
              <span style={{ color: "#4a5568", fontSize: 11 }}>
                {new Date().toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ background: `${risk.color}22`, color: risk.color, border: `1px solid ${risk.color}44`, borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 800, letterSpacing: 0.8 }}>
                {risk.emoji} {risk.label}
              </span>
              {riskScore !== undefined && (
                <span style={{ color: "#4a5568", fontSize: 12 }}>Score: {riskScore}/100</span>
              )}
            </div>

            <div style={{ color: "#e8f0fe", fontSize: 20, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>{verdict}</div>
            <div style={{ color: "#7b8fad", fontSize: 13, fontWeight: 600 }}>{scamType}</div>
          </div>

          {/* Body */}
          <div style={{ padding: "18px 24px 22px" }}>
            {redFlags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#ff8c99", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>🚩 RED FLAGS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {redFlags.slice(0, 4).map((flag, i) => (
                    <div key={i} style={{ background: "rgba(255,71,87,0.07)", border: "1px solid rgba(255,71,87,0.18)", borderRadius: 8, padding: "8px 12px", color: "#ffb3bb", fontSize: 12, lineHeight: 1.5 }}>
                      ⚠️ {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {whatToDo.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#7ce3ff", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>✅ WHAT TO DO</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {whatToDo.slice(0, 4).map((step, i) => (
                    <div key={i} style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.16)", borderRadius: 8, padding: "8px 12px", color: "#a8dfff", fontSize: 12, lineHeight: 1.5 }}>
                      {i + 1}. {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {explanation && (
              <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px 12px", marginBottom: 18, color: "#7b8fad", fontSize: 12, lineHeight: 1.6 }}>
                {explanation.length > 180 ? explanation.slice(0, 180) + "…" : explanation}
              </div>
            )}

            <div style={{ background: `${risk.color}11`, border: `1px solid ${risk.color}33`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🛡️</span>
              <div>
                <div style={{ color: "#e8f0fe", fontSize: 12, fontWeight: 700 }}>Stay protected with VerifySG</div>
                <div style={{ color: "#4a5568", fontSize: 11, marginTop: 2 }}>Scan suspicious messages at verifysg.app</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
