import {
  RecommendationCandidate,
  RecommendationRequirement,
} from "./recommendation-types";

export function buildRecommendationPrompt(input: {
  requirement: RecommendationRequirement;
  candidates: RecommendationCandidate[];
}): string {
  return [
    "You are the recommendation engine for AutoTeams.",
    "",
    "Your task is to recommend a team from an already authorised candidate population.",
    "The application has already enforced group membership, active status, access and consent.",
    "",
    "Rules:",
    "1. Use only candidate IDs supplied below.",
    "2. Recommend no more people than the requested team size.",
    "3. Never invent candidate information.",
    "4. Treat missing profile data as uncertainty, not as a negative personal judgement.",
    "5. Base reasons only on supplied role, department, location, strengths and profile readiness.",
    "6. Clearly identify skill gaps and risks.",
    "7. The result supports human review and must not claim to be the final decision.",
    "8. Avoid sensitive or protected-characteristic inference.",
    "",
    "Team requirement:",
    JSON.stringify(input.requirement, null, 2),
    "",
    "Authorised candidates:",
    JSON.stringify(input.candidates, null, 2),
  ].join("\n");
}
