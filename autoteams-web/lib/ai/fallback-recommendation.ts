import {
  GeminiTeamRecommendation,
  RecommendationApiRequest,
} from "./recommendation-types";

export function buildFallbackRecommendation(
  request: RecommendationApiRequest,
): GeminiTeamRecommendation {
  const requiredSkills = request.requirement.skills.map(
    (skill) => skill.toLowerCase(),
  );

  const rankedPeople = request.candidates
    .map((candidate) => {
      const strengths = candidate.strengths.map(
        (strength) => strength.toLowerCase(),
      );

      const matches = request.requirement.skills.filter((skill) =>
        strengths.some(
          (strength) =>
            strength.includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(strength),
        ),
      );

      let score = 55 + Math.min(matches.length * 10, 30);

      if (candidate.profileReady) score += 8;
      if (candidate.location !== "Not specified") score += 4;

      const reasons = [
        ...(matches.length
          ? [`Matches ${matches.slice(0, 2).join(" and ")}`]
          : requiredSkills.length
            ? []
            : ["Active authorised candidate"]),
        ...(candidate.profileReady
          ? ["Collaboration profile available"]
          : []),
        ...(candidate.strengths.length
          ? [
              `Strengths: ${candidate.strengths
                .slice(0, 2)
                .join(", ")}`,
            ]
          : []),
      ];

      const concerns = [
        ...(!matches.length && requiredSkills.length
          ? ["No direct required-skill match recorded"]
          : []),
        ...(!candidate.profileReady
          ? ["Collaboration profile not completed"]
          : []),
      ];

      return {
        personId: candidate.id,
        score: Math.min(score, 96),
        reasons,
        concerns,
      };
    })
    .sort((left, right) => right.score - left.score);

  const recommendedPersonIds = rankedPeople
    .slice(0, request.requirement.size)
    .map((person) => person.personId);

  const recommended = request.candidates.filter((candidate) =>
    recommendedPersonIds.includes(candidate.id),
  );

  const coveredStrengths = new Set(
    recommended.flatMap((candidate) =>
      candidate.strengths.map((strength) =>
        strength.toLowerCase(),
      ),
    ),
  );

  const skillGaps = request.requirement.skills.filter(
    (skill) =>
      !Array.from(coveredStrengths).some(
        (strength) =>
          strength.includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(strength),
      ),
  );

  const readyCount = recommended.filter(
    (candidate) => candidate.profileReady,
  ).length;

  const profileCoverage =
    recommended.length === 0
      ? 0
      : readyCount / recommended.length;

  const confidence = Math.round(
    62 +
      Math.min(
        request.requirement.skills.length - skillGaps.length,
        3,
      ) *
        5 +
      profileCoverage * 15,
  );

  return {
    recommendedPersonIds,
    confidence: Math.min(confidence, 92),
    summary:
      "A deterministic fallback recommendation was generated because Gemini was unavailable.",
    rankedPeople,
    teamStrengths: Array.from(coveredStrengths)
      .slice(0, 8)
      .map(toTitleCase),
    skillGaps,
    risks: [
      "Gemini analysis was unavailable.",
      ...(readyCount < recommended.length
        ? ["Some selected people have incomplete profiles."]
        : []),
    ],
    source: "fallback",
  };
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (character) =>
    character.toUpperCase(),
  );
}
