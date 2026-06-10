"use client";
import { RiskLevel } from "@/lib/types";

export function ShieldIcon({ size = 24, color = "#00d4ff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill={color} opacity="0.2" />
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const riskMap: Record<RiskLevel, { color: string; glow: string }> = {
  HIGH:   { color: "#ff4757", glow: "rgba(255,71,87,0.15)" },
  MEDIUM: { color: "#ffa502", glow: "rgba(255,165,2,0.15)" },
  LOW:    { color: "#2ed573", glow: "rgba(46,213,115,0.15)" },
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const { color, glow } = riskMap[risk];
  return (
    <span style={{ background: glow, color, border: `1px solid ${color}33`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
      {risk}
    </span>
  );
}

export function getRiskColors(risk: RiskLevel) {
  return riskMap[risk] ?? riskMap.LOW;
}
