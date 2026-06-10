"use client";
import { useState } from "react";
import { RiskBadge } from "@/components/ui";
import { CommunityAlert } from "@/lib/types";

interface Props {
  alerts: CommunityAlert[];
  newReportId: number | null;
}

function AlertDetail({ alert, onBack }: { alert: CommunityAlert; onBack: () => void }) {
  const [warned, setWarned] = useState(false);
  return (
    <div style={{ padding: "24px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 14, marginBottom: 20 }}>
        ← Back
      </button>
      <RiskBadge risk={alert.risk} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "10px 0 4px" }}>{alert.title}</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>{alert.type} · {alert.reports.toLocaleString()} reports · {alert.time}</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{alert.summary}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {alert.tags.map((t) => (
          <span key={t} style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>{t}</span>
        ))}
      </div>

      {!warned ? (
        <button
          onClick={() => setWarned(true)}
          style={{ width: "100%", background: "#00d4ff", border: "none", borderRadius: 10, padding: 14, color: "#0a0e1a", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
        >
          🔔 Warn My Circle
        </button>
      ) : (
        <div className="card" style={{ background: "rgba(46,213,115,0.1)", border: "1px solid rgba(46,213,115,0.27)", textAlign: "center" }}>
          <p style={{ color: "#2ed573", fontWeight: 600, fontSize: 15 }}>✅ Circle alerted!</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Your trusted circles have been notified</p>
        </div>
      )}
    </div>
  );
}

export default function CommunityScreen({ alerts, newReportId }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const alert = alerts.find((a) => a.id === selected);

  if (alert) return <AlertDetail alert={alert} onBack={() => setSelected(null)} />;

  const totalReports = alerts.reduce((s, a) => s + a.reports, 0);
  const highRisk = alerts.filter((a) => a.risk === "HIGH").length;

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>Community Alerts</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Trending scams reported by Singaporeans</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "HIGH RISK", value: highRisk, color: "#ff4757", glow: "rgba(255,71,87,0.1)" },
          { label: "TOTAL REPORTS", value: totalReports.toLocaleString(), color: "#ffa502", glow: "rgba(255,165,2,0.1)" },
          { label: "ALERTS", value: alerts.length, color: "var(--accent)", glow: "rgba(0,212,255,0.1)" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.glow, border: `1px solid ${s.color}33`, borderRadius: 10, padding: "12px 10px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {alerts.map((alert) => {
        const isNew = alert.id === newReportId;
        return (
          <div
            key={alert.id}
            className="card card-hover fade-in"
            style={{
              marginBottom: 12,
              border: isNew ? "1px solid rgba(46,213,115,0.5)" : undefined,
              background: isNew ? "rgba(46,213,115,0.05)" : undefined,
            }}
            onClick={() => setSelected(alert.id)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <RiskBadge risk={alert.risk} />
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{alert.type}</span>
              {isNew && (
                <span style={{ marginLeft: "auto", background: "rgba(46,213,115,0.15)", color: "#2ed573", border: "1px solid rgba(46,213,115,0.3)", borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                  ✨ YOUR REPORT
                </span>
              )}
            </div>
            <p style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{alert.title}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{alert.summary}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {alert.tags.map((t) => (
                  <span key={t} style={{ background: "var(--border)", color: "var(--text-muted)", borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>{t}</span>
                ))}
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>📊 {alert.reports.toLocaleString()} · {alert.time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}