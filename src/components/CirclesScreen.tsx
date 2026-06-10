"use client";
import { useState, useEffect } from "react";
import { Circle } from "@/lib/types";

interface Member {
  id: number;
  name: string;
  contact: string;
}

interface CircleAlert {
  id: number;
  title: string;
  summary: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
  time: string;
  sentBy: string;
}

interface CircleWithMembers extends Circle {
  memberList: Member[];
  circleAlerts: CircleAlert[];
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
    circleAlerts: [
      { id: 101, title: "OCBC Bank SMS Scam", summary: "Fake OCBC alerts asking victims to verify accounts via suspicious link", risk: "HIGH", time: "2h ago", sentBy: "You" },
      { id: 102, title: "Fake Job Offer", summary: "WhatsApp messages offering $3000/day for simple online tasks", risk: "HIGH", time: "1d ago", sentBy: "Mum" },
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
    circleAlerts: [],
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
    circleAlerts: [
      { id: 103, title: "Carousell Payment Scam", summary: "Sellers requesting PayNow before shipping then disappearing", risk: "MEDIUM", time: "6h ago", sentBy: "Aisha" },
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

const riskColor = (r: string) => r === "HIGH" ? "#ff4757" : r === "MEDIUM" ? "#ffa502" : "#2ed573";
const riskGlow  = (r: string) => r === "HIGH" ? "rgba(255,71,87,0.1)" : r === "MEDIUM" ? "rgba(255,165,2,0.1)" : "rgba(46,213,115,0.1)";

export default function CirclesScreen() {
  const [circles, setCircles] = useState<CircleWithMembers[]>([]);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [showMembers, setShowMembers] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🛡️");
  const [showAddMember, setShowAddMember] = useState<number | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberContact, setNewMemberContact] = useState("");

  useEffect(() => { setCircles(loadCircles()); }, []);

  const updateAndSave = (updated: CircleWithMembers[]) => {
    setCircles(updated);
    saveCircles(updated);
  };

  const createCircle = () => {
    if (!newName.trim()) return;
    const c: CircleWithMembers = { id: Date.now(), name: newName.trim(), members: 0, avatar: newEmoji, alerts: 0, memberList: [], circleAlerts: [] };
    updateAndSave([...circles, c]);
    setNewName(""); setNewEmoji("🛡️"); setShowCreate(false);
  };

  const addMember = (circleId: number) => {
    if (!newMemberName.trim()) return;
    const updated = circles.map((c) => {
      if (c.id !== circleId) return c;
      const member: Member = { id: Date.now(), name: newMemberName.trim(), contact: newMemberContact.trim() };
      const newList = [...c.memberList, member];
      return { ...c, memberList: newList, members: newList.length };
    });
    updateAndSave(updated);
    setNewMemberName(""); setNewMemberContact(""); setShowAddMember(null);
  };

  const removeMember = (circleId: number, memberId: number) => {
    const updated = circles.map((c) => {
      if (c.id !== circleId) return c;
      const newList = c.memberList.filter((m) => m.id !== memberId);
      return { ...c, memberList: newList, members: newList.length };
    });
    updateAndSave(updated);
  };

  const totalAlerts = circles.reduce((s, c) => s + c.circleAlerts.length, 0);

  return (
    <div style={{ padding: "24px 20px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e8f0fe" }}>Shield Circles</h1>
          <p style={{ color: "#7b8fad", fontSize: 14, marginTop: 4 }}>
            {totalAlerts > 0 ? `${totalAlerts} alert${totalAlerts !== 1 ? "s" : ""} across your circles` : "Your trusted protection groups"}
          </p>
        </div>
        <button onClick={() => setShowCreate(s => !s)} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.27)", borderRadius: 8, padding: "8px 14px", color: "#00d4ff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          + New Circle
        </button>
      </div>

      {/* Create circle */}
      {showCreate && (
        <div className="card fade-in" style={{ marginBottom: 16, border: "1px solid rgba(0,212,255,0.27)" }}>
          <p style={{ color: "#e8f0fe", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Create a Circle</p>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createCircle()} placeholder="Circle name (e.g. Family, NS Mates)" style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {["🛡️","👨‍👩‍👧‍👦","🪖","🎓","💼","🏠","❤️","⭐"].map((e) => (
              <button key={e} onClick={() => setNewEmoji(e)} style={{ fontSize: 22, background: newEmoji === e ? "rgba(0,212,255,0.2)" : "transparent", border: newEmoji === e ? "1px solid #00d4ff" : "1px solid #1e2d45", borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}>{e}</button>
            ))}
          </div>
          <button onClick={createCircle} style={{ width: "100%", background: "#00d4ff", border: "none", borderRadius: 8, padding: 12, color: "#0a0e1a", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Create Circle</button>
        </div>
      )}

      {/* Circles */}
      {circles.map((circle) => {
        const isExpanded = expanded === circle.id;
        const showingMembers = showMembers === circle.id;
        const color = circle.circleAlerts.length > 0 ? "#ff4757" : "#00d4ff";

        return (
          <div key={circle.id} className="card" style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
            {/* Circle header — click to expand */}
            <div
              onClick={() => setExpanded(isExpanded ? null : circle.id)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer" }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {circle.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#e8f0fe", fontSize: 15, fontWeight: 600 }}>{circle.name}</p>
                <p style={{ color: "#4a5568", fontSize: 12, marginTop: 2 }}>👥 {circle.memberList.length} members</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {circle.circleAlerts.length > 0 && (
                  <div style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
                    <p style={{ color: "#ff4757", fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{circle.circleAlerts.length}</p>
                    <p style={{ color: "#ff4757", fontSize: 9 }}>alerts</p>
                  </div>
                )}
                <span style={{ color: "#4a5568", fontSize: 18, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ borderTop: "1px solid #1e2d45" }}>
                {/* Alerts section */}
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ color: "#4a5568", fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>ALERTS SENT TO THIS CIRCLE</p>

                  {circle.circleAlerts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0", border: "1px dashed #1e2d45", borderRadius: 10 }}>
                      <p style={{ color: "#4a5568", fontSize: 13 }}>No alerts sent yet</p>
                      <p style={{ color: "#4a5568", fontSize: 12, marginTop: 4 }}>Warn this circle from the Scanner or Community tab</p>
                    </div>
                  ) : (
                    circle.circleAlerts.map((alert) => (
                      <div key={alert.id} style={{ background: riskGlow(alert.risk), border: `1px solid ${riskColor(alert.risk)}33`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ background: `${riskColor(alert.risk)}22`, color: riskColor(alert.risk), border: `1px solid ${riskColor(alert.risk)}33`, borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>{alert.risk}</span>
                            <span style={{ color: "#4a5568", fontSize: 11 }}>by {alert.sentBy}</span>
                          </div>
                          <span style={{ color: "#4a5568", fontSize: 11 }}>{alert.time}</span>
                        </div>
                        <p style={{ color: "#e8f0fe", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{alert.title}</p>
                        <p style={{ color: "#7b8fad", fontSize: 12, lineHeight: 1.5 }}>{alert.summary}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Members dropdown */}
                <div style={{ borderTop: "1px solid #1e2d45" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMembers(showingMembers ? null : circle.id); }}
                    style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", color: "#7b8fad", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <span>👥 Members ({circle.memberList.length})</span>
                    <span style={{ transform: showingMembers ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: 12 }}>▼</span>
                  </button>

                  {showingMembers && (
                    <div style={{ padding: "0 16px 14px", borderTop: "1px solid #1e2d45" }}>
                      {circle.memberList.map((m) => (
                        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1e2d4533" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: "#e8f0fe", fontSize: 13, fontWeight: 600 }}>{m.name}</p>
                            {m.contact && <p style={{ color: "#4a5568", fontSize: 11 }}>{m.contact}</p>}
                          </div>
                          <button onClick={() => removeMember(circle.id, m.id)} style={{ background: "none", border: "none", color: "#4a5568", fontSize: 11, cursor: "pointer", padding: "2px 6px" }}>✕</button>
                        </div>
                      ))}

                      {showAddMember === circle.id ? (
                        <div style={{ marginTop: 12 }}>
                          <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Name" style={{ marginBottom: 8 }} />
                          <input value={newMemberContact} onChange={(e) => setNewMemberContact(e.target.value)} placeholder="Phone (optional)" style={{ marginBottom: 10 }} />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => addMember(circle.id)} style={{ flex: 1, background: "#00d4ff", border: "none", borderRadius: 8, padding: 10, color: "#0a0e1a", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Add</button>
                            <button onClick={() => setShowAddMember(null)} style={{ flex: 1, background: "transparent", border: "1px solid #1e2d45", borderRadius: 8, padding: 10, color: "#7b8fad", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowAddMember(circle.id)} style={{ width: "100%", marginTop: 10, background: "rgba(0,212,255,0.05)", border: "1px dashed rgba(0,212,255,0.3)", borderRadius: 8, padding: "8px", color: "#00d4ff", fontSize: 12, cursor: "pointer" }}>
                          + Add Member
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
