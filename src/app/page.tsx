"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldIcon } from "@/components/ui";
import ScannerScreen from "@/components/ScannerScreen";
import CommunityScreen from "@/components/CommunityScreen";
import CirclesScreen from "@/components/CirclesScreen";
import ProfileScreen from "@/components/ProfileScreen";
import SafetyCoachCard from "@/components/SafetyCoachCard";
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

type ActionLogEntry = {
  id: number;
  time: string;
  type: "scan" | "report" | "navigation" | "guide" | "system";
  title: string;
  detail: string;
};

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

function getTimeStamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HelpOverlay({
  open,
  onClose,
  onLog,
}: {
  open: boolean;
  onClose: () => void;
  onLog: (type: ActionLogEntry["type"], title: string, detail: string) => void;
}) {
  const steps = [
    {
      title: "1. Scan suspicious content",
      text: "Paste a scam SMS, dodgy message, or suspicious claim into Scanner to get a quick risk assessment.",
    },
    {
      title: "2. Warn others fast",
      text: "If something looks risky, report it so it appears in Community and can be shared with others.",
    },
    {
      title: "3. Use Shield Circles",
      text: "Open Circles to warn trusted people such as friends, classmates, or family members.",
    },
    {
      title: "4. Use Safety Coach",
      text: "Tap the floating coach button anywhere in the app for calm next-step guidance.",
    },
  ];

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3, 8, 18, 0.72)",
        backdropFilter: "blur(6px)",
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          maxHeight: "min(84vh, 760px)",
          overflowY: "auto",
          padding: 22,
          boxShadow: "0 24px 70px rgba(0,0,0,0.42)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,212,255,0.12)",
              border: "1px solid rgba(0,212,255,0.18)",
              flexShrink: 0,
            }}
          >
            <ShieldIcon size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f5fbff", fontSize: 24, fontWeight: 800, letterSpacing: -0.6 }}>
              VerifySG quick tour
            </div>
            <p style={{ color: "#8ea4c4", fontSize: 14, lineHeight: 1.7, marginTop: 8 }}>
              A simple onboarding guide for first-time users, demos, and judging walkthroughs.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#7ce3ff", fontSize: 24, cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          {steps.map((step) => (
            <div
              key={step.title}
              className="card"
              style={{
                padding: 16,
                background: "rgba(10,14,26,0.72)",
                borderColor: "rgba(30,45,69,0.82)",
              }}
            >
              <div style={{ color: "#eaf2ff", fontSize: 16, fontWeight: 700 }}>{step.title}</div>
              <p style={{ color: "#9eb2cc", fontSize: 14, lineHeight: 1.7, marginTop: 8 }}>{step.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              onLog("guide", "Onboarding completed", "User finished the quick tour overlay.");
              onClose();
            }}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)",
              color: "#031321",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
          <button
            type="button"
            onClick={() => {
              onLog("guide", "Help tips revisited", "User reopened onboarding tips from the help overlay.");
              onClose();
            }}
            style={{
              border: "1px solid rgba(30,45,69,0.9)",
              borderRadius: 12,
              padding: "12px 16px",
              background: "rgba(10,14,26,0.85)",
              color: "#d9e7f7",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close guide
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionConsole({
  entries,
  open,
  onToggle,
  onClear,
}: {
  entries: ActionLogEntry[];
  open: boolean;
  onToggle: () => void;
  onClear: () => void;
}) {
  return (
    <>
      {!open && (
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: "fixed",
          left: 16,
          bottom: 88,
          zIndex: 62,
          border: "1px solid rgba(0,212,255,0.22)",
          borderRadius: 999,
          padding: "10px 14px",
          background: "rgba(6,14,28,0.92)",
          color: "#9fe9ff",
          fontWeight: 700,
          fontSize: 13,
          boxShadow: "0 16px 30px rgba(0,0,0,0.28)",
          cursor: "pointer",
        }}
      >
        {open ? "Hide console" : `Action console (${entries.length})`}
      </button>
      )}

      {open && (
        <div
          className="card"
          style={{
            position: "fixed",
            left: 16,
            bottom: 136,
            width: "min(360px, calc(100vw - 32px))",
            maxHeight: "min(360px, calc(100vh - 160px))",
            zIndex: 61,
            display: "flex",
            flexDirection: "column",
            padding: 16,
            boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: "#f5fbff", fontWeight: 800, fontSize: 16 }}>Action console</div>
            <div style={{ marginLeft: "auto", color: "#7b8fad", fontSize: 12 }}>{entries.length} events</div>
            <button
              type="button"
              onClick={onToggle}
              style={{
                background: "none",
                border: "none",
                color: "#7ce3ff",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
          <p style={{ color: "#8ea4c4", fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>
            Tracks scans, reports, navigation, and help usage to make demos easier to explain.
          </p>

          <div style={{ display: "grid", gap: 10, overflowY: "auto", marginTop: 14, paddingRight: 4 }}>
            {entries.length === 0 ? (
              <div
                style={{
                  borderRadius: 12,
                  padding: 14,
                  background: "rgba(10,14,26,0.8)",
                  border: "1px solid rgba(30,45,69,0.8)",
                  color: "#8ea4c4",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                No actions logged yet.
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    borderRadius: 12,
                    padding: 12,
                    background: "rgba(10,14,26,0.82)",
                    border: "1px solid rgba(30,45,69,0.82)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#7ce3ff", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{entry.type}</span>
                    <span style={{ marginLeft: "auto", color: "#6e86a7", fontSize: 11 }}>{entry.time}</span>
                  </div>
                  <div style={{ color: "#f0f6ff", fontSize: 13, fontWeight: 700, marginTop: 6 }}>{entry.title}</div>
                  <div style={{ color: "#97abc5", fontSize: 12, lineHeight: 1.6, marginTop: 4 }}>{entry.detail}</div>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={onClear}
            style={{
              marginTop: 14,
              alignSelf: "flex-start",
              border: "1px solid rgba(30,45,69,0.9)",
              borderRadius: 10,
              padding: "10px 12px",
              background: "rgba(10,14,26,0.85)",
              color: "#dcecff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear log
          </button>
        </div>
      )}
    </>
  );
}

function LoginGate({
  onSuccess,
  onOpenGuide,
  onLog,
}: {
  onSuccess: () => void;
  onOpenGuide: () => void;
  onLog: (type: ActionLogEntry["type"], title: string, detail: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 760;

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const savedAuth = ensureLocalAuth();
    const normalizedUsername = normalizeName(username);
    const isAllowedUser = savedAuth.users.includes(normalizedUsername);

    if (isAllowedUser && password === savedAuth.password) {
      localStorage.setItem(AUTH_USER_KEY, normalizedUsername);
      localStorage.setItem(AUTH_SESSION_KEY, "true");
      setError("");
      onLog("system", "Login successful", `Authenticated as ${normalizedUsername}.`);
      onSuccess();
      return;
    }

    setError("Use Ben, Harris, Ariq, or Jun with password 123.");
    onLog("system", "Login failed", `Attempted username: ${username || "empty"}.`);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: isMobile ? "20px 12px" : "24px 16px",
        background:
          "radial-gradient(circle at top, rgba(0,212,255,0.14), transparent 28%), linear-gradient(180deg, #07101f 0%, #0a0e1a 48%, #070b15 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
          gap: isMobile ? 14 : 24,
          alignItems: "stretch",
        }}
      >
        <section
          className="card"
          style={{
            padding: isMobile ? 22 : 32,
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
                padding: isMobile ? "8px 12px" : "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(0,212,255,0.18)",
                background: "rgba(0,212,255,0.08)",
                color: "#8eeaff",
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
              }}
            >
              <ShieldIcon size={18} />
              VerifySG Access Gate
            </div>

            <h1
              style={{
                marginTop: isMobile ? 18 : 24,
                fontSize: isMobile ? 34 : 46,
                lineHeight: 1.02,
                letterSpacing: isMobile ? -1 : -1.5,
                color: "#f8fbff",
                maxWidth: isMobile ? "100%" : 460,
              }}
            >
              Authenticate before entering Digital Shield.
            </h1>

            <p
              style={{
                marginTop: 16,
                color: "#9db2ce",
                fontSize: isMobile ? 15 : 17,
                lineHeight: 1.65,
                maxWidth: isMobile ? "100%" : 470,
              }}
            >
              This demo login appears immediately when the app loads, so you can present VerifySG as a protected platform for scam detection, community alerts, and safer online participation.
            </p>
          </div>

          <div style={{ display: "grid", gap: isMobile ? 10 : 14, marginTop: isMobile ? 22 : 28 }}>
            {[
              "Scan suspicious messages and claims before they spread.",
              "Warn trusted circles about scams, misinformation, or impersonation.",
              "Show a cleaner product flow during demos and judging.",
            ].map((item) => (
              <div
                key={item}
                className="card"
                style={{
                  padding: isMobile ? "12px 14px" : "14px 16px",
                  color: "#b7c8df",
                  fontSize: isMobile ? 14 : 15,
                  lineHeight: 1.6,
                  background: "rgba(10,14,26,0.64)",
                  borderColor: "rgba(30,45,69,0.72)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section
          className="card"
          style={{
            padding: isMobile ? 22 : 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background:
              "linear-gradient(180deg, rgba(10,14,26,0.96) 0%, rgba(8,12,24,1) 100%)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.34)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ color: "#7ce3ff", fontSize: isMobile ? 13 : 14, fontWeight: 700, letterSpacing: 0.2 }}>
              Local demo credentials
            </div>
            <button
              type="button"
              onClick={() => {
                onLog("guide", "Help opened from login", "User opened onboarding from the login screen.");
                onOpenGuide();
              }}
              style={{
                marginLeft: "auto",
                border: "1px solid rgba(30,45,69,0.9)",
                borderRadius: 999,
                padding: "8px 12px",
                background: "rgba(10,14,26,0.85)",
                color: "#dcecff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Help / tutorial
            </button>
          </div>
          <h2
            style={{
              marginTop: 12,
              fontSize: isMobile ? 32 : 44,
              lineHeight: 1.05,
              letterSpacing: isMobile ? -1 : -1.5,
              color: "#f8fbff",
            }}
          >
            Sign in to continue.
          </h2>
          <p
            style={{
              marginTop: 14,
              color: "#9db2ce",
              fontSize: isMobile ? 15 : 16,
              lineHeight: 1.7,
              maxWidth: 360,
            }}
          >
            Use any demo name with the shared password to enter the app.
          </p>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 14, marginTop: isMobile ? 22 : 28 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: "#cfe4ff", fontSize: 13, fontWeight: 700 }}>Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ben, Harris, Ariq, or Jun"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: "1px solid rgba(30,45,69,0.9)",
                  background: "rgba(7,11,21,0.9)",
                  color: "#f8fbff",
                  padding: isMobile ? "14px 14px" : "15px 16px",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: "#cfe4ff", fontSize: 13, fontWeight: 700 }}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: "1px solid rgba(30,45,69,0.9)",
                  background: "rgba(7,11,21,0.9)",
                  color: "#f8fbff",
                  padding: isMobile ? "14px 14px" : "15px 16px",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </label>

            {error && (
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,71,87,0.3)",
                  background: "rgba(255,71,87,0.08)",
                  color: "#ff9aa5",
                  padding: "12px 14px",
                  fontSize: 13,
                  lineHeight: 1.6,
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
                padding: isMobile ? "15px 16px" : "14px 16px",
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
            onClick={() => {
              setShowHint((value) => !value);
              onLog("guide", showHint ? "Demo credentials hidden" : "Demo credentials shown", "User toggled the login credential hint.");
            }}
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
            onClick={() => onLog("navigation", "Standalone auth opened", "User navigated to the standalone auth page.")}
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
  const [logEntries, setLogEntries] = useState<ActionLogEntry[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 760;

  const addLog = (type: ActionLogEntry["type"], title: string, detail: string) => {
    setLogEntries((current) => [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        time: getTimeStamp(),
        type,
        title,
        detail,
      },
      ...current,
    ].slice(0, 30));
  };

  useEffect(() => {
    setUserReports(loadUserReports());
    ensureLocalAuth();
    localStorage.removeItem(AUTH_SESSION_KEY);
    setAuthenticated(false);
    setIsReady(true);
    addLog("system", "Session started", "VerifySG loaded and reset demo authentication state.");
  }, []);

  const alerts = useMemo(() => [...userReports, ...COMMUNITY_ALERTS], [userReports]);

  const handleTabChange = (nextTab: string) => {
    setTab(nextTab);
    addLog("navigation", "Tab changed", `User opened the ${nextTab} tab.`);
  };

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
    addLog("report", "Community report created", `${result.scamType} was reported with ${result.riskLevel} risk.`);
  };

  if (!isReady) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#8ea4c4" }}>
        Loading VerifySG...
      </div>
    );
  }

  if (!authenticated) {
  return (
    <>
      <LoginGate
        onSuccess={() => setAuthenticated(true)}
        onOpenGuide={() => setShowHelp(true)}
        onLog={addLog}
      />

      <HelpOverlay
        open={showHelp}
        onClose={() => setShowHelp(false)}
        onLog={addLog}
      />

      <ActionConsole
        entries={logEntries}
        open={showConsole}
        onToggle={() => setShowConsole((value) => !value)}
        onClear={() => setLogEntries([])}
      />

      <SafetyCoachCard />
    </>
  );
}

  return (
    <>
      <div style={{ maxWidth: 520, margin: "0 auto", height: "100vh", position: "relative", display: "flex", flexDirection: "column" }}>
        <header style={{
          background: "var(--bg)", borderBottom: "1px solid var(--border)",
          padding: "16px 20px 12px", flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <ShieldIcon size={26} />
          <span style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>VerifySG</span>
          <button
            type="button"
            onClick={() => {
              setShowHelp(true);
              addLog("guide", "Help opened in app", `User opened the help overlay from the ${tab} tab.`);
            }}
            style={{
              marginLeft: "auto",
              border: "1px solid rgba(30,45,69,0.9)",
              borderRadius: 999,
              padding: isMobile ? "7px 10px" : "8px 12px",
              background: "rgba(10,14,26,0.85)",
              color: "#dcecff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Help
          </button>
          <span style={{ background: "rgba(255,71,87,0.15)", border: "1px solid rgba(255,71,87,0.27)", borderRadius: 6, padding: "3px 10px", color: "#ff4757", fontSize: 12, fontWeight: 600 }}>
            🔴 Live
          </span>
        </header>

        <main style={{ flex: 1, overflowY: "auto" }}>
          {tab === "scan" && <ScannerScreen onReport={handleReport} onGoToCommunity={() => handleTabChange("community")} />}
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
              onClick={() => handleTabChange(t.id)}
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
        <SafetyCoachCard />
      </div>

      <HelpOverlay open={showHelp} onClose={() => setShowHelp(false)} onLog={addLog} />
      <ActionConsole
        entries={logEntries}
        open={showConsole}
        onToggle={() => setShowConsole((value) => !value)}
        onClear={() => setLogEntries([])}
      />
    </>
  );
}
