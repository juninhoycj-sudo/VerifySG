"use client";

import { useState } from "react";
import { ShieldIcon } from "@/components/ui";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const QUICK_ACTIONS = [
  "What should I do after a scam SMS?",
  "How do I report cyberbullying?",
  "How can I verify a link safely?",
  "Help me respond calmly online.",
];

function buildReply(message: string) {
  const prompt = message.toLowerCase();

  if (prompt.includes("sms") || prompt.includes("scam") || prompt.includes("fraud")) {
    return "Treat the message as suspicious until verified. Do not click links, do not share OTPs or banking details, block the sender, and verify through the official app, hotline, or website of the organization mentioned.";
  }

  if (prompt.includes("bully") || prompt.includes("harass") || prompt.includes("hurtful")) {
    return "Pause before responding. Save screenshots, timestamps, and usernames, then report the account or post through the platform. If the situation feels unsafe or targeted, tell a trusted adult, teacher, school staff member, or relevant authority immediately.";
  }

  if (prompt.includes("link") || prompt.includes("url") || prompt.includes("website")) {
    return "Check whether the domain name is spelled correctly, whether the page is asking for urgent action, and whether it matches the official source. If you are unsure, open the official site manually instead of tapping the link you received.";
  }

  if (prompt.includes("angry") || prompt.includes("reply") || prompt.includes("calm")) {
    return "A professional response is to pause, breathe, and avoid reacting in the moment. Draft a short factual reply, remove emotionally charged language, and only send it if it helps de-escalate the situation.";
  }

  return "I can help with scam messages, unsafe links, cyberbullying, fact-checking, and safer online responses. Tell me what happened, and I’ll suggest the next safest step.";
}

export default function SafetyCoachCard() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "I’m your Safety Coach. Ask me what to do after a suspicious message, unsafe link, harmful post, or online conflict.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const launcherBottom = 124;
  const panelBottom = 160;
  const showLauncher = !isOpen;

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    const assistantMessage: ChatMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: buildReply(trimmed),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft("");
    setIsOpen(true);
  };

  return (
    <>
      {isOpen && (
        <div
          className="card"
          style={{
            position: "fixed",
            right: 16,
            bottom: panelBottom,
            width: "min(360px, calc(100vw - 24px))",
            height: "min(560px, calc(100vh - 180px))",
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.42)",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: "rgba(0,212,255,0.12)",
                border: "1px solid rgba(0,212,255,0.18)",
                flexShrink: 0,
              }}
            >
              <ShieldIcon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e8f0fe", fontSize: 16, fontWeight: 700 }}>Safety Coach</div>
              <p style={{ color: "#7b8fad", fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
                Quick guidance for scams, unsafe links, bullying, and safe replies.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#7ce3ff",
                fontSize: 18,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingRight: 4,
              marginBottom: 12,
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => sendMessage(action)}
                  style={{
                    border: "1px solid #1e2d45",
                    borderRadius: 999,
                    padding: "8px 12px",
                    background: "#0a0e1a",
                    color: "#a9bbd3",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {action}
                </button>
              ))}
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  alignSelf: message.role === "user" ? "end" : "start",
                  maxWidth: "88%",
                  padding: "10px 12px",
                  borderRadius: 14,
                  background: message.role === "user" ? "rgba(0,212,255,0.12)" : "#111827",
                  border: message.role === "user" ? "1px solid rgba(0,212,255,0.18)" : "1px solid #1e2d45",
                  color: message.role === "user" ? "#dff7ff" : "#d8e6f7",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginTop: "auto" }}>
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask what to do next..."
              style={{ resize: "none", lineHeight: 1.5, flex: 1 }}
            />
            <button
              type="button"
              onClick={() => sendMessage(draft)}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "12px 14px",
                background: "#00d4ff",
                color: "#08101c",
                fontWeight: 800,
                cursor: "pointer",
                minWidth: 74,
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {showLauncher && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Safety Coach"
          style={{
            position: "fixed",
            right: 16,
            bottom: launcherBottom,
            zIndex: 61,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.32)",
            background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)",
            color: "#07101f",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 16px 36px rgba(0,153,255,0.28)",
            cursor: "pointer",
          }}
        >
          <ShieldIcon size={24} color="#07101f" />
        </button>
      )}
    </>
  );
}
