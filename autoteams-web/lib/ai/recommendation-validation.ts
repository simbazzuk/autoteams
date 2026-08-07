import {
  GeminiTeamRecommendation,
  RecommendationApiRequest,
} from "./recommendation-types";

const MAX_CANDIDATES = 200;
const MAX_TEAM_SIZE = 50;

export function validateRecommendationRequest(
  value: unknown,
): RecommendationApiRequest {
  if (!value || typeof value !== "object") {
    throw new Error("Request body must be an object.");
  }

  const body = value as Partial<RecommendationApiRequest>;

  if (
    typeof body.workspaceId !== "string" ||
    !body.workspaceId.trim()
  ) {
    throw new Error("workspaceId is required.");
  }

  if (!body.requirement || typeof body.requirement !== "object") {
    throw new Error("requirement is required.");
  }

  const requirement = body.requirement;

  if (
    typeof requirement.name !== "string" ||
    typeof requirement.purpose !== "string" ||
    typeof requirement.size !== "number" ||
    !Number.isInteger(requirement.size) ||
    requirement.size < 1 ||
    requirement.size > MAX_TEAM_SIZE
  ) {
    throw new Error("Invalid team requirement.");
  }

  if (
    !Array.isArray(requirement.skills) ||
    typeof requirement.location !== "string" ||
    typeof requirement.workingStyle !== "string"
  ) {
    throw new Error("Invalid requirement fields.");
  }

  if (
    !Array.isArray(body.candidates) ||
    body.candidates.length < 1 ||
    body.candidates.length > MAX_CANDIDATES
  ) {
    throw new Error(
      `Candidates must contain between 1 and ${MAX_CANDIDATES} people.`,
    );
  }

  const seen = new Set<string>();

  for (const candidate of body.candidates) {
    if (
      !candidate ||
      typeof candidate.id !== "string" ||
      !candidate.id.trim() ||
      seen.has(candidate.id) ||
      typeof candidate.name !== "string" ||
      typeof candidate.jobTitle !== "string" ||
      typeof candidate.department !== "string" ||
      typeof candidate.location !== "string" ||
      !Array.isArray(candidate.strengths) ||
      typeof candidate.profileReady !== "boolean"
    ) {
      throw new Error("Invalid candidate data.");
    }

    seen.add(candidate.id);
  }

  return body as RecommendationApiRequest;
}

export function validateGeminiRecommendation(input: {
  value: unknown;
  request: RecommendationApiRequest;
}): GeminiTeamRecommendation {
  if (!input.value || typeof input.value !== "object") {
    throw new Error("Gemini returned an invalid response.");
  }

  const result =
    input.value as Partial<GeminiTeamRecommendation>;

  const allowedIds = new Set(
    input.request.candidates.map((candidate) => candidate.id),
  );

  if (
    !Array.isArray(result.recommendedPersonIds) ||
    !Array.isArray(result.rankedPeople) ||
    !Array.isArray(result.teamStrengths) ||
    !Array.isArray(result.skillGaps) ||
    !Array.isArray(result.risks) ||
    typeof result.confidence !== "number" ||
    typeof result.summary !== "string"
  ) {
    throw new Error("Gemini response is missing fields.");
  }

  const recommendedIds = Array.from(
    new Set(result.recommendedPersonIds),
  );

  if (
    recommendedIds.length >
      input.request.requirement.size ||
    recommendedIds.some((id) => !allowedIds.has(id))
  ) {
    throw new Error(
      "Gemini recommended an invalid candidate population.",
    );
  }

  const rankedPeople = result.rankedPeople.map((person) => {
    if (
      !person ||
      typeof person.personId !== "string" ||
      !allowedIds.has(person.personId) ||
      typeof person.score !== "number" ||
      !Array.isArray(person.reasons) ||
      !Array.isArray(person.concerns)
    ) {
      throw new Error("Gemini returned invalid ranking data.");
    }

    return {
      personId: person.personId,
      score: clamp(Math.round(person.score), 0, 100),
      reasons: person.reasons.map(String).slice(0, 6),
      concerns: person.concerns.map(String).slice(0, 6),
    };
  });

  return {
    recommendedPersonIds: recommendedIds,
    confidence: clamp(
      Math.round(result.confidence),
      0,
      100,
    ),
    summary: result.summary.trim(),
    rankedPeople,
    teamStrengths: result.teamStrengths.map(String).slice(0, 10),
    skillGaps: result.skillGaps.map(String).slice(0, 10),
    risks: result.risks.map(String).slice(0, 10),
    source: "gemini",
  };
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(Math.max(value, minimum), maximum);
}
