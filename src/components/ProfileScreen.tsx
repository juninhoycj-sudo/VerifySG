"use client";
import { useState, useEffect } from "react";
import { ScanHistoryItem } from "@/lib/types";
import { RiskBadge } from "@/components/ui";

const HISTORY_KEY = "safesg_scan_history";
const REPORTS_KEY = "safesg_user_reports";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const BADGE_RULES = [
  { icon: "🛡️", name: "First Scan",     earned: (scans: number) => scans >= 1  },
  { icon: "🔍", name: "Scam Buster",    earned: (scans: number) => scans >= 5  },
  { icon: "📢", name: "Community Hero", earned: (_: number, reports: number) => reports >= 1 },
  { icon: "🌟", name: "Shield Master",  earned: (scans: number) => scans >= 20 },
  { icon: "🔒", name: "Fort Knox",      earned: (scans: number, reports: number) => scans >= 10 && reports >= 3 },
  { icon: "🏆", name: "Top Defender",   earned: (scans: number, reports: number) => scans >= 50 && reports >= 10 },
];

export default function ProfileScreen() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [reportCount, setReportCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(h);
      const r = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
      setReportCount(r.length);
    } catch {}
  }, []);

  const scansRun = history.length;
  const scamsCaught = history.filter((h) => h.riskLevel === "HIGH").length;
  const displayed = showAll ? history : history.slice(0, 5);

  const STATS = [
    { label: "Scans Run",     value: scansRun,     icon: "🔍" },
    { label: "Scams Caught",  value: scamsCaught,  icon: "🛡️" },
    { label: "Reports Filed", value: reportCount,  icon: "📋" },
    { label: "Circles",       value: 3,            icon: "👥" },
  ];

  const badges = BADGE_RULES.map((b) => ({
    ...b,
    isEarned: b.earned(scansRun, reportCount),
  }));

  return (
    <div style={{ padding: "24px 20px 40px" }}>
      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 76, height: 76, borderRadius: "50%",
          background: "rgba(0,212,255,0.1)", border: "2px solid #00d4ff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34, margin: "0 auto 12px",
        }}>
          🧑
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8f0fe" }}>Juninho</h2>
        <p style={{ color: "#7b8fad", fontSize: 13, marginTop: 4 }}>SafeSG Member · Singapore 🇸🇬</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {STATS.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "14px 12px" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ color: "#00d4ff", fontSize: 24, fontWeight: 800 }}>{s.value}</div>
            <div style={{ color: "#7b8fad", fontSize: 12, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#e8f0fe", marginBottom: 14 }}>Badges</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
        {badges.map((b) => (
          <div key={b.name} className="card" style={{ textAlign: "center", padding: "14px 8px", opacity: b.isEarned ? 1 : 0.35 }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>{b.icon}</div>
            <div style={{ color: b.isEarned ? "#e8f0fe" : "#7b8fad", fontSize: 11, fontWeight: b.isEarned ? 600 : 400 }}>{b.name}</div>
            {b.isEarned && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2ed573", margin: "8px auto 0" }} />}
          </div>
        ))}
      </div>

      {/* Scan History */}
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#e8f0fe", marginBottom: 14 }}>Scan History</h3>
      {history.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 24, border: "1px dashed #1e2d45", background: "transparent" }}>
          <p style={{ color: "#7b8fad", fontSize: 14 }}>No scans yet</p>
          <p style={{ color: "#4a5568", fontSize: 12, marginTop: 4 }}>Your past scans will appear here</p>
        </div>
      ) : (
        <>
          {displayed.map((item) => (
            <div key={item.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <RiskBadge risk={item.riskLevel} />
                  <span style={{ color: "#7b8fad", fontSize: 12 }}>{item.scamType}</span>
                </div>
                <span style={{ color: "#4a5568", fontSize: 11 }}>{timeAgo(item.scannedAt)}</span>
              </div>
              <p style={{ color: "#e8f0fe", fontSize: 13, marginBottom: 4 }}>{item.input}</p>
              <p style={{ color: "#7b8fad", fontSize: 12, fontStyle: "italic" }}>{item.verdict}</p>
              {item.reported && (
                <p style={{ color: "#2ed573", fontSize: 11, marginTop: 6 }}>✅ Reported to community</p>
              )}
            </div>
          ))}
          {history.length > 5 && (
            <button
              onClick={() => setShowAll((s) => !s)}
              style={{ width: "100%", background: "none", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px", color: "#7b8fad", fontSize: 13, cursor: "pointer", marginTop: 4 }}
            >
              {showAll ? "Show less ↑" : `Show all ${history.length} scans ↓`}
            </button>
          )}
        </>
      )}
    </div>
  );
}