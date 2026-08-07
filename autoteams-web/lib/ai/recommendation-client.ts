import type {
  GeminiTeamRecommendation,
  RecommendationApiRequest,
} from "./recommendation-types";

type RecommendationErrorResponse = {
  error: string;
};

export async function requestTeamRecommendation(
  input: RecommendationApiRequest,
): Promise<GeminiTeamRecommendation> {
  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result: unknown = await response.json();

  if (!response.ok) {
    const message = isErrorResponse(result)
      ? result.error
      : "Unable to generate recommendation.";

    throw new Error(message);
  }

  if (!isGeminiTeamRecommendation(result)) {
    throw new Error(
      "The recommendation service returned an invalid response.",
    );
  }

  return result;
}

function isErrorResponse(
  value: unknown,
): value is RecommendationErrorResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
}

function isGeminiTeamRecommendation(
  value: unknown,
): value is GeminiTeamRecommendation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<GeminiTeamRecommendation>;

  return (
    Array.isArray(result.recommendedPersonIds) &&
    typeof result.confidence === "number" &&
    typeof result.summary === "string" &&
    Array.isArray(result.rankedPeople) &&
    Array.isArray(result.teamStrengths) &&
    Array.isArray(result.skillGaps) &&
    Array.isArray(result.risks) &&
    (result.source === "gemini" ||
      result.source === "fallback")
  );
}