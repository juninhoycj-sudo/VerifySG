"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShieldIcon } from "@/components/ui";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthLabel = ["Weak", "Weak", "Okay", "Strong", "Very strong"][passwordScore];
  const strengthColor = ["#ff6b81", "#ff6b81", "#ffa502", "#00d4ff", "#2ed573"][passwordScore];

  const isSignup = mode === "signup";

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
          maxWidth: 980,
          display: "grid",
          gridTemplateColumns: "1.08fr 0.92fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <section
          className="card"
          style={{
            padding: 32,
            minHeight: 680,
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
                letterSpacing: 0.2,
              }}
            >
              <ShieldIcon size={18} />
              Digital Shield Access
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
              Stay protected before harm spreads.
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
              Sign in to scan suspicious messages, share verified community alerts,
              and help young Singaporeans respond to misinformation, fraud, and
              cyberbullying with confidence.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
              marginTop: 28,
            }}
          >
            {[
              {
                title: "Scan suspicious content",
                body: "Check messages, posts, and links for manipulation signals in seconds.",
              },
              {
                title: "Protect your circles",
                body: "Alert friends and family when scams or false claims start spreading.",
              },
              {
                title: "Build online trust",
                body: "Encourage reporting, fact-checking, and kinder responses across your community.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card"
                style={{
                  padding: 18,
                  background: "rgba(8, 17, 32, 0.74)",
                  borderColor: "rgba(30,45,69,0.9)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(0,212,255,0.12)",
                      border: "1px solid rgba(0,212,255,0.16)",
                      color: "#7ce3ff",
                      fontSize: 18,
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div style={{ color: "#edf6ff", fontWeight: 700, fontSize: 15 }}>
                      {item.title}
                    </div>
                    <div style={{ color: "#90a4c3", fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>
                      {item.body}
                    </div>
                  </div>
                </div>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <p style={{ color: "#7ce3ff", fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}>
                VerifySG Account
              </p>
              <h2 style={{ marginTop: 8, fontSize: 30, color: "#f8fbff", letterSpacing: -0.8 }}>
                {isSignup ? "Create your shield" : "Welcome back"}
              </h2>
            </div>
            <div
              style={{
                display: "inline-flex",
                padding: 4,
                gap: 4,
                borderRadius: 12,
                background: "#0a0e1a",
                border: "1px solid #1e2d45",
              }}
            >
              {[
                { id: "signin", label: "Sign in" },
                { id: "signup", label: "Sign up" },
              ].map((option) => {
                const active = mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMode(option.id as AuthMode)}
                    style={{
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: active ? "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)" : "transparent",
                      color: active ? "#031321" : "#8ea4c4",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form style={{ display: "grid", gap: 14, marginTop: 24 }}>
            {isSignup && (
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ color: "#c8d7ea", fontSize: 13, fontWeight: 600 }}>Full name</span>
                <input
                  placeholder="Ariq Saviz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            )}

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: "#c8d7ea", fontSize: 13, fontWeight: 600 }}>Email</span>
              <input
                type="email"
                placeholder="you@sutd.edu.sg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: "#c8d7ea", fontSize: 13, fontWeight: 600 }}>Password</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignup ? "Create a strong password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 88 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#7ce3ff",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {isSignup && (
              <>
                <div
                  className="card"
                  style={{
                    padding: 14,
                    background: "rgba(10,14,26,0.7)",
                    borderColor: "rgba(30,45,69,0.85)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "#c8d7ea", fontSize: 13, fontWeight: 600 }}>Password strength</span>
                    <span style={{ color: strengthColor, fontSize: 12, fontWeight: 700 }}>{strengthLabel}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 12 }}>
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        style={{
                          height: 6,
                          borderRadius: 999,
                          background: index < passwordScore ? strengthColor : "#1f314c",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ color: "#c8d7ea", fontSize: 13, fontWeight: 600 }}>Confirm password</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>
              </>
            )}

            {!isSignup && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#9cb0cb", fontSize: 13 }}>
                  <input type="checkbox" style={{ width: 16, height: 16 }} />
                  Keep me signed in
                </label>
                <button type="button" style={{ color: "#7ce3ff", fontSize: 13, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                  Forgot password?
                </button>
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
              {isSignup ? "Create account" : "Sign in securely"}
            </button>
          </form>

          <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ height: 1, background: "#1e2d45", flex: 1 }} />
              <span style={{ color: "#7187a6", fontSize: 12, fontWeight: 600 }}>or continue with</span>
              <div style={{ height: 1, background: "#1e2d45", flex: 1 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Google", icon: "G" },
                { label: "Singpass", icon: "S" },
              ].map((provider) => (
                <button
                  key={provider.label}
                  type="button"
                  className="card card-hover"
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    fontWeight: 700,
                    color: "#d9e7f8",
                    background: "#0a0e1a",
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(0,212,255,0.1)",
                      color: "#7ce3ff",
                      fontSize: 13,
                    }}
                  >
                    {provider.icon}
                  </span>
                  {provider.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 18, color: "#8ea4c4", fontSize: 13, lineHeight: 1.6 }}>
            By continuing, you agree to protect your community responsibly and follow VerifySG’s
            safety guidelines.
          </p>

          <Link
            href="/"
            style={{
              marginTop: 20,
              alignSelf: "flex-start",
              color: "#7ce3ff",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}
