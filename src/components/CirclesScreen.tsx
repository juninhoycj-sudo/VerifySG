"use client";
import { useState, useEffect } from "react";
import { Circle } from "@/lib/types";

// Each member has a name and optional contact
interface Member {
  id: number;
  name: string;
  contact: string;
}

// Extended circle with member list
interface CircleWithMembers extends Circle {
  memberList: Member[];
}

const STORAGE_KEY = "safesg_circles";

const INITIAL_CIRCLES: CircleWithMembers[] = [
  {
    id: 1, name: "Family", members: 3, avatar: "👨‍👩‍👧‍👦", alerts: 2,
    memberList: [
      { id: 1, name: "Mum", contact: "9123 4567" },
      { id: 2, name: "Dad", contact: "9234 5678" },
      { id: 3, name: "Sister", contact: "9345 6789" },
    ],
  },
  {
    id: 2, name: "NS Mates", members: 4, avatar: "🪖", alerts: 0,
    memberList: [
      { id: 4, name: "Jun Wei", contact: "9456 7890" },
      { id: 5, name: "Farhan", contact: "9567 8901" },
      { id: 6, name: "Bryan", contact: "9678 9012" },
      { id: 7, name: "Marcus", contact: "9789 0123" },
    ],
  },
  {
    id: 3, name: "NUS CS Classmates", members: 5, avatar: "🎓", alerts: 1,
    memberList: [
      { id: 8, name: "Aisha", contact: "9890 1234" },
      { id: 9, name: "Wei Liang", contact: "9901 2345" },
      { id: 10, name: "Priya", contact: "9012 3456" },
      { id: 11, name: "Darren", contact: "9111 2222" },
      { id: 12, name: "Siti", contact: "9222 3333" },
    ],
  },
];

function loadCircles(): CircleWithMembers[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CIRCLES;
  } catch {
    return INITIAL_CIRCLES;
  }
}

function saveCircles(circles: CircleWithMembers[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(circles));
  } catch {}
}

export default function CirclesScreen() {
  const [circles, setCircles] = useState<CircleWithMembers[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🛡️");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberContact, setNewMemberContact] = useState("");

  useEffect(() => {
    setCircles(loadCircles());
  }, []);

  const updateAndSave = (updated: CircleWithMembers[]) => {
    setCircles(updated);
    saveCircles(updated);
  };

  const createCircle = () => {
    if (!newName.trim()) return;
    const newCircle: CircleWithMembers = {
      id: Date.now(),
      name: newName.trim(),
      members: 0,
      avatar: newEmoji,
      alerts: 0,
      memberList: [],
    };
    updateAndSave([...circles, newCircle]);
    setNewName("");
    setNewEmoji("🛡️");
    setShowCreate(false);
  };

  const addMember = () => {
    if (!newMemberName.trim() || selectedId === null) return;
    const updated = circles.map((c) => {
      if (c.id !== selectedId) return c;
      const member: Member = {
        id: Date.now(),
        name: newMemberName.trim(),
        contact: newMemberContact.trim(),
      };
      const newList = [...c.memberList, member];
      return { ...c, memberList: newList, members: newList.length };
    });
    updateAndSave(updated);
    setNewMemberName("");
    setNewMemberContact("");
    setShowAddMember(false);
  };

  const removeMember = (circleId: number, memberId: number) => {
    const updated = circles.map((c) => {
      if (c.id !== circleId) return c;
      const newList = c.memberList.filter((m) => m.id !== memberId);
      return { ...c, memberList: newList, members: newList.length };
    });
    updateAndSave(updated);
  };

  const selectedCircle = circles.find((c) => c.id === selectedId) ?? null;

  // ── Detail view ──────────────────────────────────────────────
  if (selectedCircle) {
    return (
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => { setSelectedId(null); setShowAddMember(false); }}
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.27)", borderRadius: 8, padding: "6px 12px", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            ← Back
          </button>
          <span style={{ fontSize: 26 }}>{selectedCircle.avatar}</span>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{selectedCircle.name}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>👥 {selectedCircle.memberList.length} member{selectedCircle.memberList.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {selectedCircle.memberList.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 32, border: "1px dashed var(--border)", background: "transparent", marginBottom: 16 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No members yet — add someone below</p>
          </div>
        ) : (
          selectedCircle.memberList.map((m) => (
            <div key={m.id} className="card" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                👤
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 600 }}>{m.name}</p>
                {m.contact && <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{m.contact}</p>}
              </div>
              <button
                onClick={() => removeMember(selectedCircle.id, m.id)}
                style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: 6, padding: "4px 10px", color: "#ff4757", fontSize: 12, cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          ))
        )}

        {showAddMember ? (
          <div className="card fade-in" style={{ marginTop: 8, border: "1px solid rgba(0,212,255,0.27)" }}>
            <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Add Member</p>
            <input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Name (e.g. Mum, Jun Wei)"
              style={{ marginBottom: 10 }}
            />
            <input
              value={newMemberContact}
              onChange={(e) => setNewMemberContact(e.target.value)}
              placeholder="Phone or email (optional)"
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={addMember}
                style={{ flex: 1, background: "var(--accent)", border: "none", borderRadius: 8, padding: 12, color: "#0a0e1a", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Add
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: 12, color: "var(--text-muted)", fontSize: 14, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMember(true)}
            style={{ width: "100%", marginTop: 8, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.27)", borderRadius: 10, padding: 14, color: "var(--accent)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            + Add Member
          </button>
        )}
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>Shield Circles</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Protect your trusted groups</p>
        </div>
        <button
          onClick={() => setShowCreate((s) => !s)}
          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.27)", borderRadius: 8, padding: "8px 14px", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
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
            style={{ marginBottom: 10 }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 8 }}>Pick an icon</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {["🛡️","👨‍👩‍👧‍👦","🪖","🎓","💼","🏠","❤️","⭐"].map((e) => (
              <button
                key={e}
                onClick={() => setNewEmoji(e)}
                style={{ fontSize: 22, background: newEmoji === e ? "rgba(0,212,255,0.2)" : "transparent", border: newEmoji === e ? "1px solid var(--accent)" : "1px solid var(--border)", borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}
              >
                {e}
              </button>
            ))}
          </div>
          <button
            onClick={createCircle}
            style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 8, padding: 12, color: "#0a0e1a", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Create Circle
          </button>
        </div>
      )}

      {circles.map((circle) => (
        <div
          key={circle.id}
          className="card card-hover"
          onClick={() => setSelectedId(circle.id)}
          style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
            {circle.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600 }}>{circle.name}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>👥 {circle.memberList.length} member{circle.memberList.length !== 1 ? "s" : ""}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {circle.alerts > 0 && (
              <div style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.27)", borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
                <p style={{ color: "#ff4757", fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{circle.alerts}</p>
                <p style={{ color: "#ff4757", fontSize: 10 }}>alerts</p>
              </div>
            )}
            <span style={{ color: "var(--text-muted)", fontSize: 18 }}>›</span>
          </div>
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
