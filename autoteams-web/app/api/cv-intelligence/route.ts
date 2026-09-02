import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 6 * 1024 * 1024;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function stripJsonFence(value: string): string {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
}

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose a CV file to analyse." },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "CV must be smaller than 6 MB." },
        { status: 400 },
      );
    }

    const supported = new Set([
      "application/pdf",
      "text/plain",
      "text/markdown",
    ]);

    if (!supported.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Please upload a PDF or plain-text CV. PDF is recommended.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model =
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash";

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini is not configured. Set GEMINI_API_KEY before using Atlas CV Intelligence.",
        },
        { status: 503 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const data = bytes.toString("base64");

    const prompt = `
You are Atlas CV Intelligence for TeamScience.ai.

Analyse the supplied CV as evidence only. Do not invent experience, skills,
qualifications, employers, dates, achievements or seniority that are not
supported by the CV.

Return JSON only with this exact shape:
{
  "headline": "short professional headline",
  "summary": "2-4 sentence factual professional summary",
  "seniority": "one concise seniority description",
  "yearsExperience": 0,
  "roles": ["role"],
  "skills": ["skill"],
  "industries": ["industry"],
  "qualifications": ["qualification"],
  "achievements": ["achievement"],
  "experience": [
    {
      "role": "role",
      "organisation": "organisation",
      "period": "dates/period exactly as supported",
      "evidence": "one concise evidence statement"
    }
  ],
  "opportunityKeywords": ["search/matching keyword"]
}

Rules:
- If years of experience cannot be supported, use null.
- Prefer explicit evidence over inference.
- Do not infer protected characteristics.
- Do not score personality or culture fit from the CV.
- Do not make hiring decisions.
- Skills should be concrete and useful for opportunity matching.
- Keep arrays concise and de-duplicated.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model,
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: file.type,
                    data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.15,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("Atlas CV Intelligence Gemini error", {
        status: response.status,
        detail: detail.slice(0, 500),
      });

      return NextResponse.json(
        {
          error:
            "Atlas could not analyse this CV. Try a text-based PDF or plain-text CV.",
        },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as GeminiResponse;
    const text =
      payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      return NextResponse.json(
        { error: "Atlas returned no CV analysis." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(stripJsonFence(text)) as Record<string, unknown>;

    const experience = Array.isArray(parsed.experience)
      ? parsed.experience
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            return {
              role: typeof row.role === "string" ? row.role.trim() : "",
              organisation:
                typeof row.organisation === "string"
                  ? row.organisation.trim()
                  : "",
              period:
                typeof row.period === "string" ? row.period.trim() : "",
              evidence:
                typeof row.evidence === "string"
                  ? row.evidence.trim()
                  : "",
            };
          })
          .filter(
            (item): item is {
              role: string;
              organisation: string;
              period: string;
              evidence: string;
            } => Boolean(item && (item.role || item.organisation)),
          )
          .slice(0, 15)
      : [];

    return NextResponse.json({
      analysis: {
        headline:
          typeof parsed.headline === "string"
            ? parsed.headline.trim()
            : "",
        summary:
          typeof parsed.summary === "string"
            ? parsed.summary.trim()
            : "",
        seniority:
          typeof parsed.seniority === "string"
            ? parsed.seniority.trim()
            : "",
        yearsExperience:
          typeof parsed.yearsExperience === "number"
            ? parsed.yearsExperience
            : null,
        roles: cleanArray(parsed.roles),
        skills: cleanArray(parsed.skills),
        industries: cleanArray(parsed.industries),
        qualifications: cleanArray(parsed.qualifications),
        achievements: cleanArray(parsed.achievements),
        experience,
        opportunityKeywords: cleanArray(parsed.opportunityKeywords),
      },
      source: "gemini",
      model,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Atlas CV Intelligence failed", error);
    return NextResponse.json(
      {
        error:
          "Atlas could not analyse this CV. Please try again.",
      },
      { status: 500 },
    );
  }
}
