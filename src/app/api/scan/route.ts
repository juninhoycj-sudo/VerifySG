import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are SafeSG, an AI scam detection assistant for Singapore. Analyze the provided text/URL/message for scam indicators.
You MUST respond ONLY with a valid JSON object. No markdown, no backticks, no explanation, just raw JSON.
Use this exact format:
{
  "riskLevel": "HIGH",
  "riskScore": 85,
  "verdict": "This is likely a phishing scam.",
  "scamType": "Phishing",
  "redFlags": ["Suspicious link", "Urgency tactics"],
  "whatToDo": ["Do not click any links", "Report to ScamShield"],
  "explanation": "This message contains classic phishing indicators targeting Singapore bank customers."
}

riskLevel must be exactly one of: HIGH, MEDIUM, LOW
riskScore must be an integer from 0 to 100

Now analyze this: ${content}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
          }
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini text:", text);
    
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({
      riskLevel: "MEDIUM",
      riskScore: 50,
      verdict: "Could not analyse — treat with caution.",
      scamType: "Unknown",
      redFlags: ["Analysis failed — err on the side of caution"],
      whatToDo: ["Do not click any links", "Verify through official channels"],
      explanation: "The analysis service encountered an error. When in doubt, do not engage.",
    });
  }
}
