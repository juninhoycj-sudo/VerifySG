export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface ScanResult {
  riskLevel: RiskLevel;
  riskScore: number;
  verdict: string;
  scamType: string;
  redFlags: string[];
  whatToDo: string[];
  explanation: string;
}

export interface CommunityAlert {
  id: number;
  type: string;
  title: string;
  summary: string;
  risk: RiskLevel;
  reports: number;
  time: string;
  tags: string[];
}

export interface Circle {
  id: number;
  name: string;
  members: number;
  avatar: string;
  alerts: number;
}

export interface ScanHistoryItem {
  id: number;
  input: string;
  scamType: string;
  riskLevel: RiskLevel;
  riskScore: number;
  verdict: string;
  scannedAt: string; // ISO date string
  reported: boolean;
}