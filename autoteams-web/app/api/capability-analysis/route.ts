import { NextRequest, NextResponse } from "next/server";

type MemberEvidence = {
  id?: string;
  name?: string;
  jobTitle?: string;
  department?: string;
  strengths?: string[];
};

type Capability = {
  name: string;
  importance: number;
  reason: string;
};

type RequestBody = {
  teamName?: string;
  objective?: string;
  currentMembers?: MemberEvidence[];
  existingStrengths?: string[];
  existingGaps?: string[];
};

type CapabilityResult = {
  source: "gemini" | "fallback";
  model?: string;
  summary: string;
  requiredCapabilities: Capability[];
};

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-2.5-flash";

function cleanStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map(item => String(item || "").trim())
        .filter(Boolean)
    : [];
}

function clampImportance(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 70;
  return Math.min(100, Math.max(1, Math.round(number)));
}

function fallback(body: RequestBody): CapabilityResult {
  const gaps = cleanStrings(body.existingGaps);
  const strengths = cleanStrings(body.existingStrengths);

  const names = Array.from(
    new Set([
      ...gaps,
      ...strengths,
      "Delivery",
      "Collaboration",
    ]),
  ).slice(0, 7);

  return {
    source: "fallback",
    summary:
      "Atlas used the team's existing recommendation evidence because live Gemini capability analysis was unavailable.",
    requiredCapabilities: names.map((name, index) => ({
      name,
      importance:
        gaps.includes(name)
          ? Math.max(75, 92 - index * 3)
          : Math.max(55, 70 - index * 2),
      reason:
        gaps.includes(name)
          ? "Previously identified by Atlas as missing or under-covered."
          : "Retained from the team's existing evidence as a useful capability.",
    })),
  };
}

function normaliseCapabilities(
  raw: unknown,
): Capability[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();

  return raw
    .map(item => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const data =
        item as Record<string, unknown>;

      const name =
        String(data.name || "")
          .trim();

      if (!name) return null;

      const key =
        name.toLowerCase();

      if (seen.has(key)) return null;
      seen.add(key);

      return {
        name,
        importance:
          clampImportance(
            data.importance,
          ),
        reason:
          String(
            data.reason ||
              "Required to support the team objective.",
          ).trim(),
      };
    })
    .filter(
      (item): item is Capability =>
        Boolean(item),
    )
    .slice(0, 8);
}

function buildPrompt(body: RequestBody) {
  const objective =
    String(body.objective || "").trim();

  const teamName =
    String(body.teamName || "Team").trim();

  const members =
    Array.isArray(body.currentMembers)
      ? body.currentMembers
      : [];

  const memberEvidence =
    members.map(member => ({
      name: member.name || "",
      jobTitle: member.jobTitle || "",
      department: member.department || "",
      strengths:
        cleanStrings(member.strengths),
    }));

  const evidence = {
    teamName,
    objective,
    currentMembers: memberEvidence,
    existingAtlasStrengths:
      cleanStrings(
        body.existingStrengths,
      ),
    existingAtlasGaps:
      cleanStrings(
        body.existingGaps,
      ),
  };

  return [
    "You are Atlas, the TeamScience.ai team intelligence layer.",
    "",
    "Your task is capability analysis, not candidate selection.",
    "",
    "Given the team objective and current-member evidence, identify the capabilities that are genuinely required to achieve the objective.",
    "",
    "Rules:",
    "- Derive capabilities from the objective, not from stereotypes or protected characteristics.",
    "- Consider technical, domain, product, delivery, governance, operational and collaboration capabilities only where relevant.",
    "- Do not recommend people.",
    "- Do not invent qualifications or experience for current members.",
    "- Existing Atlas strengths/gaps are supporting evidence, not mandatory conclusions.",
    "- Importance must be an integer from 1 to 100.",
    "- Prefer 4 to 7 distinct capabilities.",
    "- Make each capability name concise and reusable for matching.",
    "- Explain why each capability matters to this specific objective.",
    "",
    "Return JSON only in exactly this shape:",
    JSON.stringify(
      {
        summary:
          "one concise explanation of what the objective requires",
        requiredCapabilities: [
          {
            name:
              "Capability name",
            importance: 90,
            reason:
              "Why this capability matters",
          },
        ],
      },
      null,
      2,
    ),
    "",
    "Team evidence:",
    JSON.stringify(
      evidence,
      null,
      2,
    ),
  ].join("\n");
}

async function callGemini(
  body: RequestBody,
): Promise<CapabilityResult> {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallback(body);
  }

  const model = DEFAULT_MODEL;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${encodeURIComponent(
      apiKey,
    )}`;

  const response =
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  buildPrompt(body),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType:
            "application/json",
        },
      }),
      cache: "no-store",
    });

  if (!response.ok) {
    const detail =
      await response.text();

    console.error(
      "Atlas capability Gemini call failed",
      response.status,
      detail.slice(0, 500),
    );

    return fallback(body);
  }

  const payload =
    (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

  const text =
    payload.candidates?.[0]
      ?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    return fallback(body);
  }

  let parsed: {
    summary?: unknown;
    requiredCapabilities?: unknown;
  };

  try {
    parsed =
      JSON.parse(text);
  } catch {
    console.error(
      "Atlas capability Gemini returned invalid JSON",
      text.slice(0, 500),
    );
    return fallback(body);
  }

  const requiredCapabilities =
    normaliseCapabilities(
      parsed.requiredCapabilities,
    );

  if (
    requiredCapabilities.length === 0
  ) {
    return fallback(body);
  }

  return {
    source: "gemini",
    model,
    summary:
      String(
        parsed.summary ||
          "Atlas derived the capabilities required by the team objective.",
      ).trim(),
    requiredCapabilities,
  };
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as RequestBody;

    const objective =
      String(body.objective || "").trim();

    if (!objective) {
      return NextResponse.json(
        {
          error:
            "A team objective is required for capability analysis.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await callGemini(body);

    return NextResponse.json(
      result,
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Atlas capability analysis failed",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Atlas could not analyse the team capabilities.",
      },
      {
        status: 500,
      },
    );
  }
}
