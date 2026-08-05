import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  ProfileAnalysis,
  defaultDna,
} from "@/lib/team-intelligence";

type RequestBody = {
  narrative?: string;
  teamType?: string;
};

const fallbackAnalysis: ProfileAnalysis = {
  summary:
    "A collaborative and thoughtful person who values purposeful teams, clear ownership and practical outcomes.",
  teamDna: defaultDna,
  preferredRoles: ["Strategic contributor", "Collaborator"],
  workingStyle:
    "Works best in a small team with clear goals, shared ownership and time for independent reflection.",
  strengths: [
    "Balances collaboration with independent thinking",
    "Values purposeful and reliable teamwork",
    "Communicates with consideration",
  ],
  potentialChallenges: [
    "May prefer more context before making rapid decisions",
    "Could become frustrated by unclear ownership",
  ],
  recommendedEnvironment:
    "A trusted team of four to six people with clear responsibilities and regular check-ins.",
};

function stripCodeFence(value: string): string {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function validScore(value: unknown, fallback: number): number {
  return typeof value === "number"
    ? Math.max(0, Math.min(100, Math.round(value)))
    : fallback;
}

function normaliseAnalysis(value: unknown): ProfileAnalysis {
  if (!value || typeof value !== "object") return fallbackAnalysis;

  const input = value as Record<string, unknown>;
  const dna =
    input.teamDna && typeof input.teamDna === "object"
      ? (input.teamDna as Record<string, unknown>)
      : {};

  return {
    summary:
      typeof input.summary === "string"
        ? input.summary
        : fallbackAnalysis.summary,
    teamDna: {
      leadership: validScore(dna.leadership, defaultDna.leadership),
      collaboration: validScore(
        dna.collaboration,
        defaultDna.collaboration
      ),
      communication: validScore(
        dna.communication,
        defaultDna.communication
      ),
      planning: validScore(dna.planning, defaultDna.planning),
      creativity: validScore(dna.creativity, defaultDna.creativity),
      adaptability: validScore(
        dna.adaptability,
        defaultDna.adaptability
      ),
      socialEnergy: validScore(
        dna.socialEnergy,
        defaultDna.socialEnergy
      ),
      reliability: validScore(
        dna.reliability,
        defaultDna.reliability
      ),
    },
    preferredRoles: Array.isArray(input.preferredRoles)
      ? input.preferredRoles.filter(
          (item): item is string => typeof item === "string"
        )
      : fallbackAnalysis.preferredRoles,
    workingStyle:
      typeof input.workingStyle === "string"
        ? input.workingStyle
        : fallbackAnalysis.workingStyle,
    strengths: Array.isArray(input.strengths)
      ? input.strengths.filter(
          (item): item is string => typeof item === "string"
        )
      : fallbackAnalysis.strengths,
    potentialChallenges: Array.isArray(input.potentialChallenges)
      ? input.potentialChallenges.filter(
          (item): item is string => typeof item === "string"
        )
      : fallbackAnalysis.potentialChallenges,
    recommendedEnvironment:
      typeof input.recommendedEnvironment === "string"
        ? input.recommendedEnvironment
        : fallbackAnalysis.recommendedEnvironment,
  };
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    );
  }

  const narrative = body.narrative?.trim();
  const teamType = body.teamType?.trim() || "General";

  if (!narrative || narrative.length < 40) {
    return NextResponse.json(
      { error: "Please provide at least 40 characters about yourself." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // The fallback lets the feature remain testable before a Gemini key is added.
  if (!apiKey) {
    return NextResponse.json({
      analysis: fallbackAnalysis,
      mode: "deterministic-demo",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the profile intelligence component of AutoTeams, an explainable AI
team-formation platform.

Analyse the user's own description for a ${teamType} team context.
Do not infer protected or highly sensitive characteristics such as ethnicity,
religion, health, sexuality, politics or disability. Do not diagnose the user.
Use only evidence in the supplied narrative. Express uncertainty conservatively.

Return JSON only, with exactly this shape:
{
  "summary": "2 concise sentences",
  "teamDna": {
    "leadership": 0-100,
    "collaboration": 0-100,
    "communication": 0-100,
    "planning": 0-100,
    "creativity": 0-100,
    "adaptability": 0-100,
    "socialEnergy": 0-100,
    "reliability": 0-100
  },
  "preferredRoles": ["up to 3 roles"],
  "workingStyle": "one concise paragraph",
  "strengths": ["3 evidence-based strengths"],
  "potentialChallenges": ["up to 2 neutral, constructive challenges"],
  "recommendedEnvironment": "one concise recommendation"
}

User narrative:
${narrative}
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(stripCodeFence(response.text || "{}"));
    return NextResponse.json({
      analysis: normaliseAnalysis(parsed),
      mode: "gemini",
    });
  } catch (error) {
    console.error("Gemini profile analysis failed", error);
    return NextResponse.json({
      analysis: fallbackAnalysis,
      mode: "fallback-after-error",
    });
  }
}
