import { NextRequest, NextResponse } from "next/server";

type ScanRequestBody = {
  content?: string;
  imageBase64?: string;
  imageMimeType?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { content, imageBase64, imageMimeType }: ScanRequestBody = await req.json();
    if (!content?.trim() && !imageBase64) {
      return NextResponse.json({ error: "No content or image provided" }, { status: 400 });
    }

    const promptText = `You are SafeSG, an AI scam detection assistant for Singapore. Analyze the provided ${imageBase64 ? "text and screenshot/photo" : "text/URL/message"} for scam indicators.
You MUST respond ONLY with a valid JSON object. No markdown, no backticks, no explanation, just raw JSON.
Use this exact format:
{
  "riskLevel": "HIGH",
  "riskScore": 85,
  "verdict": "This is likely a phishing scam.",
  "scamType": "Phishing",
  "redFlags": ["Suspicious link", "Urgency tactics"],
  "whatToDo": ["Do not click any links", "Report to ScamShield"],
  "explanation": "This message contains classic phishing indicators targeting Singapore users."
}

riskLevel must be exactly one of: HIGH, MEDIUM, LOW
riskScore must be an integer from 0 to 100
If an image is included, inspect visible text, logos, tone, payment requests, urgency, impersonation cues, and suspicious links shown inside the image.
If the image is blurry or incomplete, mention that briefly in the explanation while still giving the safest likely assessment.

User text or context: ${content?.trim() || "None provided"}`;

    const parts: Array<Record<string, unknown>> = [{ text: promptText }];

    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: imageMimeType || "image/jpeg",
          data: imageBase64,
        },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
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
