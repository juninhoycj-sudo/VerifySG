"use client";
import { useState } from "react";
import { RiskBadge } from "@/components/ui";
import { CommunityAlert } from "@/lib/types";
import WarnCircleModal from "@/components/WarnCircleModal";
import ExportWarningCard from "@/components/ExportWarningCard";

interface Props {
  alerts: CommunityAlert[];
  newReportId: number | null;
}

function AlertDetail({ alert, onBack }: { alert: CommunityAlert; onBack: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [warned, setWarned] = useState(false);

  return (
    <div style={{ padding: "24px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#00d4ff", cursor: "pointer", fontSize: 14, marginBottom: 20 }}>
        ← Back
      </button>
      <RiskBadge risk={alert.risk} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8f0fe", margin: "10px 0 4px" }}>{alert.title}</h2>
      <p style={{ color: "#4a5568", fontSize: 13, marginBottom: 20 }}>{alert.type} · {alert.reports.toLocaleString()} reports · {alert.time}</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ color: "#7b8fad", fontSize: 14, lineHeight: 1.7 }}>{alert.summary}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {alert.tags.map((t) => (
          <span key={t} style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>{t}</span>
        ))}
      </div>

      {!warned ? (
        <button onClick={() => setShowModal(true)} style={{ width: "100%", background: "#00d4ff", border: "none", borderRadius: 10, padding: 14, color: "#0a0e1a", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          🔔 Warn My Circle
        </button>
      ) : (
        <div className="card" style={{ background: "rgba(46,213,115,0.1)", border: "1px solid rgba(46,213,115,0.27)", textAlign: "center" }}>
          <p style={{ color: "#2ed573", fontWeight: 600, fontSize: 15 }}>✅ Circles alerted!</p>
          <p style={{ color: "#4a5568", fontSize: 13, marginTop: 4 }}>Your trusted circles have been notified</p>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <ExportWarningCard
          riskLevel={alert.risk}
          verdict={alert.title}
          scamType={alert.type}
          redFlags={alert.tags}
          whatToDo={["Do not engage with this type of message", "Block and report the sender", "Warn your contacts if you received this"]}
          explanation={alert.summary}
        />
      </div>

      {showModal && (
        <WarnCircleModal
          title={alert.title}
          summary={alert.summary}
          risk={alert.risk}
          onClose={() => setShowModal(false)}
          onWarn={() => { setWarned(true); setShowModal(false); }}
        />
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
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e8f0fe" }}>Community Alerts</h1>
        <p style={{ color: "#7b8fad", fontSize: 14, marginTop: 4 }}>Trending scams reported by Singaporeans</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "HIGH RISK", value: highRisk, color: "#ff4757", glow: "rgba(255,71,87,0.1)" },
          { label: "TOTAL REPORTS", value: totalReports.toLocaleString(), color: "#ffa502", glow: "rgba(255,165,2,0.1)" },
          { label: "ALERTS", value: alerts.length, color: "#00d4ff", glow: "rgba(0,212,255,0.1)" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.glow, border: `1px solid ${s.color}33`, borderRadius: 10, padding: "12px 10px" }}>
            <p style={{ color: "#4a5568", fontSize: 10, letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {alerts.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32, border: "1px dashed #1e2d45", background: "transparent" }}>
          <p style={{ color: "#7b8fad", fontSize: 14 }}>No community alerts yet</p>
          <p style={{ color: "#4a5568", fontSize: 13, marginTop: 4 }}>Scan a suspicious message and report it to get started</p>
        </div>
      ) : (
        alerts.map((alert) => {
          const isNew = alert.id === newReportId;
          return (
            <div key={alert.id} className="card card-hover fade-in" style={{ marginBottom: 12, border: isNew ? "1px solid rgba(46,213,115,0.5)" : undefined, background: isNew ? "rgba(46,213,115,0.05)" : undefined }} onClick={() => setSelected(alert.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <RiskBadge risk={alert.risk} />
                <span style={{ color: "#4a5568", fontSize: 12 }}>{alert.type}</span>
                {isNew && (
                  <span style={{ marginLeft: "auto", background: "rgba(46,213,115,0.15)", color: "#2ed573", border: "1px solid rgba(46,213,115,0.3)", borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>✨ YOUR REPORT</span>
                )}
              </div>
              <p style={{ color: "#e8f0fe", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{alert.title}</p>
              <p style={{ color: "#4a5568", fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{alert.summary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {alert.tags.map((t) => (
                    <span key={t} style={{ background: "#1e2d45", color: "#4a5568", borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>{t}</span>
                  ))}
                </div>
                <span style={{ color: "#4a5568", fontSize: 12 }}>📊 {alert.reports.toLocaleString()} · {alert.time}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
