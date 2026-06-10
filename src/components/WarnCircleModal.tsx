"use client";
import { useState, useEffect } from "react";

interface Circle {
  id: number;
  name: string;
  avatar: string;
  memberList?: any[];
  circleAlerts?: any[];
  alerts?: number;
}

interface Props {
  title: string;
  summary: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
  onClose: () => void;
  onWarn: (circleIds: number[]) => void;
}

const STORAGE_KEY = "safesg_circles";

const INITIAL_CIRCLES_FALLBACK: Circle[] = [
  { id: 1, name: "Family", avatar: "👨‍👩‍👧‍👦", memberList: [], circleAlerts: [], alerts: 0 },
  { id: 2, name: "NS Mates", avatar: "🪖", memberList: [], circleAlerts: [], alerts: 0 },
  { id: 3, name: "NUS CS Classmates", avatar: "🎓", memberList: [], circleAlerts: [], alerts: 0 },
];

export default function WarnCircleModal({ title, summary, risk, onClose, onWarn }: Props) {
  const [circles, setCircles] = useState<Circle[]>(INITIAL_CIRCLES_FALLBACK);
  const [selected, setSelected] = useState<number[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCircles(parsed);
        }
      }
    } catch {}
  }, []);

  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const warn = () => {
    if (selected.length === 0) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: Circle[] = raw ? JSON.parse(raw) : INITIAL_CIRCLES_FALLBACK;
      const newAlert = {
        id: Date.now(),
        title,
        summary,
        risk,
        time: "Just now",
        sentBy: "You",
      };
      const updated = existing.map((c) =>
        selected.includes(c.id)
          ? {
              ...c,
              circleAlerts: [newAlert, ...(c.circleAlerts || [])],
              alerts: (c.alerts || 0) + 1,
            }
          : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    onWarn(selected);
    setSent(true);
  };

  const riskColor = risk === "HIGH" ? "#ff4757" : risk === "MEDIUM" ? "#ffa502" : "#2ed573";

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#111827", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 520, border: "1px solid #1e2d45" }}
        onClick={(e) => e.stopPropagation()}
      >
        {!sent ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#e8f0fe", fontSize: 17, fontWeight: 700 }}>🔔 Warn My Circle</h3>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "#7b8fad", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ background: "#0a0e1a", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
              <span style={{ color: riskColor, fontWeight: 700, fontSize: 12 }}>{risk} RISK</span>
              <p style={{ color: "#e8f0fe", fontSize: 13, fontWeight: 600, marginTop: 4, marginBottom: 4 }}>{title}</p>
              <p style={{ color: "#7b8fad", fontSize: 12, lineHeight: 1.5 }}>{summary.slice(0, 100)}{summary.length > 100 ? "…" : ""}</p>
            </div>

            <p style={{ color: "#4a5568", fontSize: 12, letterSpacing: 0.8, marginBottom: 12 }}>SELECT CIRCLES TO WARN</p>

            {circles.map((c) => (
              <div
                key={c.id}
                onClick={() => toggle(c.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", marginBottom: 8,
                  background: selected.includes(c.id) ? "rgba(0,212,255,0.1)" : "#0a0e1a",
                  border: `1px solid ${selected.includes(c.id) ? "#00d4ff44" : "#1e2d45"}`,
                  borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 22 }}>{c.avatar}</span>
                <span style={{ color: "#e8f0fe", fontSize: 14, fontWeight: 600, flex: 1 }}>{c.name}</span>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: `2px solid ${selected.includes(c.id) ? "#00d4ff" : "#1e2d45"}`,
                  background: selected.includes(c.id) ? "#00d4ff" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected.includes(c.id) && <span style={{ color: "#0a0e1a", fontSize: 12, fontWeight: 800 }}>✓</span>}
                </div>
              </div>
            ))}

            <button
              onClick={warn}
              disabled={selected.length === 0}
              style={{
                width: "100%", marginTop: 8,
                background: selected.length > 0 ? "#00d4ff" : "#1e2d45",
                border: "none", borderRadius: 10, padding: 14,
                color: selected.length > 0 ? "#0a0e1a" : "#4a5568",
                fontWeight: 700, fontSize: 15,
                cursor: selected.length > 0 ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              Warn {selected.length > 0 ? `${selected.length} Circle${selected.length > 1 ? "s" : ""}` : "Selected Circles"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: "#2ed573", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Circles Warned!</p>
            <p style={{ color: "#7b8fad", fontSize: 14 }}>Your circles have been alerted about this scam.</p>
            <button onClick={onClose} style={{ marginTop: 20, background: "#00d4ff", border: "none", borderRadius: 10, padding: "12px 32px", color: "#0a0e1a", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
