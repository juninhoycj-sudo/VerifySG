"use client";
import { useState, useEffect } from "react";
import { ShieldIcon } from "@/components/ui";
import ScannerScreen from "@/components/ScannerScreen";
import CommunityScreen from "@/components/CommunityScreen";
import CirclesScreen from "@/components/CirclesScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { COMMUNITY_ALERTS } from "@/lib/data";
import { CommunityAlert, ScanResult } from "@/lib/types";

const TABS = [
  { id: "scan",      icon: "🔍", label: "Scanner" },
  { id: "community", icon: "📢", label: "Community" },
  { id: "circles",   icon: "🛡️", label: "Circles" },
  { id: "profile",   icon: "👤", label: "Profile" },
];

const STORAGE_KEY = "safesg_user_reports";

function loadUserReports(): CommunityAlert[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveUserReports(reports: CommunityAlert[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {}
}

export default function Home() {
  const [tab, setTab] = useState("scan");
  const [userReports, setUserReports] = useState<CommunityAlert[]>([]);
  const [newReportId, setNewReportId] = useState<number | null>(null);

  // Load persisted reports on mount
  useEffect(() => {
    setUserReports(loadUserReports());
  }, []);

  const alerts = [...userReports, ...COMMUNITY_ALERTS];

  const handleReport = (input: string, result: ScanResult) => {
    const id = Date.now();
    const newAlert: CommunityAlert = {
      id,
      type: result.scamType,
      title: result.scamType + " Reported by User",
      summary: input.length > 120 ? input.slice(0, 120) + "…" : input,
      risk: result.riskLevel,
      reports: 1,
      time: "Just now",
      tags: ["User Report"],
    };
    const updated = [newAlert, ...userReports];
    setUserReports(updated);
    saveUserReports(updated);
    setNewReportId(id);
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", height: "100vh", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        padding: "16px 20px 12px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <ShieldIcon size={26} />
        <span style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>VerifySG</span>
        <span style={{ marginLeft: "auto", background: "rgba(255,71,87,0.15)", border: "1px solid rgba(255,71,87,0.27)", borderRadius: 6, padding: "3px 10px", color: "#ff4757", fontSize: 12, fontWeight: 600 }}>
          🔴 Live
        </span>
      </header>

      {/* Screen */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        {tab === "scan"      && <ScannerScreen onReport={handleReport} onGoToCommunity={() => setTab("community")} />}
        {tab === "community" && <CommunityScreen alerts={alerts} newReportId={newReportId} />}
        {tab === "circles"   && <CirclesScreen />}
        {tab === "profile"   && <ProfileScreen />}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        flexShrink: 0,
        width: "100%",
        background: "var(--bg-card)", borderTop: "1px solid var(--border)",
        display: "flex", zIndex: 20,
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer", padding: "10px 0 8px",
              color: tab === t.id ? "var(--accent)" : "var(--text-muted)",
              transition: "color 0.2s",
            }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} />}
          </button>
        ))}
      </nav>
    </div>
  );
}