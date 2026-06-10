"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldIcon } from "@/components/ui";
import ScannerScreen from "@/components/ScannerScreen";
import CommunityScreen from "@/components/CommunityScreen";
import CirclesScreen from "@/components/CirclesScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { COMMUNITY_ALERTS } from "@/lib/data";
import { CommunityAlert, ScanResult } from "@/lib/types";

const TABS = [
  { id: "scan", icon: "🔍", label: "Scanner" },
  { id: "community", icon: "📢", label: "Community" },
  { id: "circles", icon: "🛡️", label: "Circles" },
  { id: "profile", icon: "👤", label: "Profile" },
];

const STORAGE_KEY = "safesg_user_reports";
const AUTH_STORAGE_KEY = "verifysg_local_auth";
const AUTH_SESSION_KEY = "verifysg_is_authenticated";
const AUTH_USER_KEY = "verifysg_current_user";
const DEMO_PASSWORD = "123";
const DEMO_USERS = ["Ben", "Harris", "Ariq", "Jun"];

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

function ensureLocalAuth() {
  const defaults = {
    users: DEMO_USERS,
    password: DEMO_PASSWORD,
  };

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaults));
  } catch {}

  return defaults;
}

function normalizeName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const savedAuth = ensureLocalAuth();
    const normalizedUsername = normalizeName(username);
    const isAllowedUser = savedAuth.users.includes(normalizedUsername);

    if (isAllowedUser && password === savedAuth.password) {
      localStorage.setItem(AUTH_USER_KEY, normalizedUsername);
      localStorage.setItem(AUTH_SESSION_KEY, "true");
      setError("");
      onSuccess();
      return;
    }

    setError("Use Ben, Harris, Ariq, or Jun with password 123.");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
        background:
          "radial-gradient(circle at top, rgba(0,212,255,0.14), transparent 28%), linear-gradient(180deg, #07101f 0%, #0a0e1a 48%, #070b15 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <section
          className="card"
          style={{
            padding: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg, rgba(17,24,39,0.92) 0%, rgba(10,14,26,0.98) 100%)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.34)",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(0,212,255,0.18)",
                background: "rgba(0,212,255,0.08)",
                color: "#8eeaff",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <ShieldIcon size={18} />
              VerifySG Access Gate
            </div>

            <h1
              style={{
                marginTop: 24,
                fontSize: 46,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                color: "#f8fbff",
                maxWidth: 460,
              }}
            >
              Authenticate before entering Digital Shield.
            </h1>

            <p
              style={{
                marginTop: 16,
                color: "#9db2ce",
                fontSize: 17,
                lineHeight: 1.65,
                maxWidth: 470,
              }}
            >
              This demo login appears immediately when the app loads, so you can
              present VerifySG as a protected platform for scam detection,
              community alerts, and safer online participation.
            </p>
          </div>

          <div style={{ display: "grid", gap: 14, marginTop: 28 }}>
            {[
              "Scan suspicious messages and claims before they spread.",
              "Warn trusted circles about scams, misinformation, or impersonation.",
              "Show a cleaner product flow during demos and judging.",
            ].map((text) => (
              <div
                key={text}
                className="card"
                style={{
                  padding: 16,
                  background: "rgba(8, 17, 32, 0.74)",
                  borderColor: "rgba(30,45,69,0.9)",
                  color: "#dbeaff",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </section>

        <section
          className="card"
          style={{
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.34)",
          }}
        >
          <div>
            <p style={{ color: "#7ce3ff", fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}>
              Local demo credentials
            </p>
            <h2 style={{ marginTop: 8, fontSize: 30, color: "#f8fbff", letterSpacing: -0.8 }}>
              Sign in to continue
            </h2>
            <p style={{ marginTop: 10, color: "#8ea4c4", fontSize: 14, lineHeight: 1.6 }}>
              Use any demo name with the shared password to enter the app.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 14, marginTop: 24 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: "#c8d7ea", fontSize: 13, fontWeight: 600 }}>Username</span>
              <input
                placeholder="Ben, Harris, Ariq, or Jun"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: "#c8d7ea", fontSize: 13, fontWeight: 600 }}>Password</span>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,71,87,0.28)",
                  background: "rgba(255,71,87,0.12)",
                  color: "#ff8090",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: 6,
                border: "none",
                borderRadius: 14,
                padding: "14px 16px",
                background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)",
                color: "#031321",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(0, 153, 255, 0.28)",
              }}
            >
              Enter VerifySG
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowHint((value) => !value)}
            style={{
              marginTop: 16,
              alignSelf: "flex-start",
              color: "#7ce3ff",
              fontSize: 13,
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showHint ? "Hide demo credentials" : "Show demo credentials"}
          </button>

          {showHint && (
            <div
              className="card"
              style={{
                marginTop: 12,
                padding: 16,
                background: "rgba(10,14,26,0.7)",
                borderColor: "rgba(30,45,69,0.85)",
                color: "#dcecff",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              <div><strong>Names:</strong> Ben, Harris, Ariq, Jun</div>
              <div><strong>Password:</strong> 123</div>
            </div>
          )}

          <Link
            href="/auth"
            style={{
              marginTop: 18,
              color: "#8ea4c4",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Open standalone auth page →
          </Link>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const [tab, setTab] = useState("scan");
  const [userReports, setUserReports] = useState<CommunityAlert[]>([]);
  const [newReportId, setNewReportId] = useState<number | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUserReports(loadUserReports());
    ensureLocalAuth();
    localStorage.removeItem(AUTH_SESSION_KEY);
    setAuthenticated(false);
    setIsReady(true);
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

  if (!isReady) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#8ea4c4" }}>
        Loading VerifySG...
      </div>
    );
  }

  if (!authenticated) {
    return <LoginGate onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", height: "100vh", position: "relative", display: "flex", flexDirection: "column" }}>
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

      <main style={{ flex: 1, overflowY: "auto" }}>
        {tab === "scan" && <ScannerScreen onReport={handleReport} onGoToCommunity={() => setTab("community")} />}
        {tab === "community" && <CommunityScreen alerts={alerts} newReportId={newReportId} />}
        {tab === "circles" && <CirclesScreen />}
        {tab === "profile" && <ProfileScreen />}
      </main>

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
