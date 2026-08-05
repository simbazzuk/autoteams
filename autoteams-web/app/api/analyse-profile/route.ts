import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

type RequestBody = {
  narrative?: string;
  teamType?: string;
};

type TeamDna = {
  leadership: number;
  collaboration: number;
  communication: number;
  planning: number;
  creativity: number;
  adaptability: number;
  socialEnergy: number;
  reliability: number;
};

type ProfileAnalysis = {
  summary: string;
  teamDna: TeamDna;
  preferredRoles: string[];
  workingStyle: string;
  strengths: string[];
  potentialChallenges: string[];
  recommendedEnvironment: string;
};

const profileAnalysisSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "A concise two-sentence summary of the user's team profile.",
    },
    teamDna: {
      type: "object",
      properties: {
        leadership: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        collaboration: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        communication: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        planning: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        creativity: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        adaptability: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        socialEnergy: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        reliability: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
      },
      required: [
        "leadership",
        "collaboration",
        "communication",
        "planning",
        "creativity",
        "adaptability",
        "socialEnergy",
        "reliability",
      ],
    },
    preferredRoles: {
      type: "array",
      items: {
        type: "string",
      },
    },
    workingStyle: {
      type: "string",
    },
    strengths: {
      type: "array",
      items: {
        type: "string",
      },
    },
    potentialChallenges: {
      type: "array",
      items: {
        type: "string",
      },
    },
    recommendedEnvironment: {
      type: "string",
    },
  },
  required: [
    "summary",
    "teamDna",
    "preferredRoles",
    "workingStyle",
    "strengths",
    "potentialChallenges",
    "recommendedEnvironment",
  ],
};

function validateScore(value: unknown, field: string): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(`Invalid Team DNA score returned for ${field}.`);
  }

  return Math.round(value);
}

function validateStringArray(
  value: unknown,
  field: string,
): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    throw new Error(`Invalid string array returned for ${field}.`);
  }

  return value;
}

function validateAnalysis(value: unknown): ProfileAnalysis {
  if (!value || typeof value !== "object") {
    throw new Error("Gemini returned an invalid analysis object.");
  }

  const analysis = value as Record<string, unknown>;

  if (!analysis.teamDna || typeof analysis.teamDna !== "object") {
    throw new Error("Gemini did not return a Team DNA object.");
  }

  const dna = analysis.teamDna as Record<string, unknown>;

  if (
    typeof analysis.summary !== "string" ||
    typeof analysis.workingStyle !== "string" ||
    typeof analysis.recommendedEnvironment !== "string"
  ) {
    throw new Error("Gemini returned incomplete profile text.");
  }

  return {
    summary: analysis.summary,
    teamDna: {
      leadership: validateScore(dna.leadership, "leadership"),
      collaboration: validateScore(
        dna.collaboration,
        "collaboration",
      ),
      communication: validateScore(
        dna.communication,
        "communication",
      ),
      planning: validateScore(dna.planning, "planning"),
      creativity: validateScore(dna.creativity, "creativity"),
      adaptability: validateScore(
        dna.adaptability,
        "adaptability",
      ),
      socialEnergy: validateScore(
        dna.socialEnergy,
        "socialEnergy",
      ),
      reliability: validateScore(dna.reliability, "reliability"),
    },
    preferredRoles: validateStringArray(
      analysis.preferredRoles,
      "preferredRoles",
    ),
    workingStyle: analysis.workingStyle,
    strengths: validateStringArray(
      analysis.strengths,
      "strengths",
    ),
    potentialChallenges: validateStringArray(
      analysis.potentialChallenges,
      "potentialChallenges",
    ),
    recommendedEnvironment: analysis.recommendedEnvironment,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const narrative = body.narrative?.trim();
    const teamType = body.teamType?.trim() || "General";

    if (!narrative || narrative.length < 40) {
      return NextResponse.json(
        {
          error:
            "Please provide at least 40 characters about yourself.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured in .env.local.",
        },
        { status: 500 },
      );
    }

    const model =
      process.env.GEMINI_MODEL || "gemini-3.6-flash";

    const client = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are the profile intelligence component of AutoTeams, an
explainable AI team-formation platform.

Analyse the user's description in the context of a ${teamType}
team.

Use only information clearly supported by the user's description.

Do not infer or speculate about:
- ethnicity
- religion
- medical conditions
- disability
- sexuality
- political beliefs
- other sensitive personal characteristics

Do not diagnose the user or present the results as a scientific
personality assessment.

Scores must be integers from 0 to 100.

Return:
- a concise summary
- eight Team DNA scores
- up to three preferred roles
- a working-style description
- three evidence-based strengths
- up to two constructive potential challenges
- a recommended team environment

User description:

${narrative}
`;

    const interaction = await client.interactions.create({
      model,
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: profileAnalysisSchema,
      },
    });

    const responseText = interaction.output_text?.trim();

    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(responseText);
    } catch (error) {
      console.error("Invalid Gemini JSON response:", responseText);

      throw new Error(
        error instanceof Error
          ? `Gemini returned invalid JSON: ${error.message}`
          : "Gemini returned invalid JSON.",
      );
    }

    const analysis = validateAnalysis(parsed);

    return NextResponse.json({
      analysis,
      mode: "gemini",
      model,
    });
  } catch (error) {
    console.error("Gemini profile analysis failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gemini profile analysis failed.",
        mode: "gemini-error",
      },
      { status: 500 },
    );
  }
}