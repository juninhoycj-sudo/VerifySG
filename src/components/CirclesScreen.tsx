"use client";
import { useState } from "react";
import { INITIAL_CIRCLES } from "@/lib/data";
import { Circle } from "@/lib/types";

export default function CirclesScreen() {
  const [circles, setCircles] = useState<Circle[]>(INITIAL_CIRCLES);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const createCircle = () => {
    if (!newName.trim()) return;
    setCircles((c) => [...c, { id: Date.now(), name: newName.trim(), members: 1, avatar: "🛡️", alerts: 0 }]);
    setNewName("");
    setShowCreate(false);
  };

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>Shield Circles</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Protect your trusted groups</p>
        </div>
        <button
          onClick={() => setShowCreate((s) => !s)}
          style={{
            background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.27)",
            borderRadius: 8, padding: "8px 14px", color: "var(--accent)",
            cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}
        >
          + New Circle
        </button>
      </div>

      {showCreate && (
        <div className="card fade-in" style={{ marginBottom: 16, border: "1px solid rgba(0,212,255,0.27)" }}>
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Create a Circle</p>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createCircle()}
            placeholder="Circle name (e.g. Family, NS Mates)"
            style={{ marginBottom: 12 }}
          />
          <button
            onClick={createCircle}
            style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 8, padding: 12, color: "#0a0e1a", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Create Circle
          </button>
        </div>
      )}

      {circles.map((circle) => (
        <div key={circle.id} className="card card-hover" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
            {circle.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600 }}>{circle.name}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>👥 {circle.members} member{circle.members !== 1 ? "s" : ""}</p>
          </div>
          {circle.alerts > 0 && (
            <div style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.27)", borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
              <p style={{ color: "#ff4757", fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{circle.alerts}</p>
              <p style={{ color: "#ff4757", fontSize: 10 }}>alerts</p>
            </div>
          )}
        </div>
      ))}

      <div className="card" style={{ marginTop: 24, border: "1px dashed var(--border)", background: "transparent", textAlign: "center", padding: 24 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 6 }}>How Shield Circles work</p>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7 }}>
          When you or the community detects a scam, you can instantly alert everyone in your circles — family, friends, classmates, or NS mates.
        </p>
      </div>
    </div>
  );
}
