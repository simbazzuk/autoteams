import type {
  RecommendationHistoryRecord,
} from "@/lib/firebase/recommendation-persistence";

export type TeamHealth = {
  overall: number;
  confidence: number;
  skillCoverage: number;
  balance: number;
  risk: number;
};

export type MemberDifference = {
  personId: string;
  name: string;
  state:
    | "both"
    | "left-only"
    | "right-only";
};

export function buildTeamHealth(
  record: RecommendationHistoryRecord,
): TeamHealth {
  const confidence =
    clamp(
      record.confidence,
    );

  const gapPenalty =
    Math.min(
      record.skillGaps.length * 10,
      40,
    );

  const riskPenalty =
    Math.min(
      record.risks.length * 12,
      45,
    );

  const strengthBonus =
    Math.min(
      record.teamStrengths.length * 6,
      24,
    );

  const skillCoverage =
    clamp(
      100 -
        gapPenalty +
        Math.round(
          strengthBonus / 2,
        ),
    );

  const balance =
    clamp(
      75 +
        strengthBonus -
        Math.round(
          riskPenalty / 2,
        ),
    );

  const risk =
    clamp(
      100 -
        riskPenalty,
    );

  const overall =
    Math.round(
      confidence * .4 +
      skillCoverage * .25 +
      balance * .2 +
      risk * .15,
    );

  return {
    overall:
      clamp(overall),
    confidence,
    skillCoverage,
    balance,
    risk,
  };
}

export function candidateName(
  record: RecommendationHistoryRecord,
  personId: string,
): string {
  return (
    record.candidates.find(
      (candidate) =>
        candidate.id === personId,
    )?.name ||
    personId
  );
}

export function memberDifferences(
  left: RecommendationHistoryRecord,
  right: RecommendationHistoryRecord,
): MemberDifference[] {
  const leftIds =
    new Set(
      left.recommendedPersonIds,
    );

  const rightIds =
    new Set(
      right.recommendedPersonIds,
    );

  const ids =
    Array.from(
      new Set([
        ...left.recommendedPersonIds,
        ...right.recommendedPersonIds,
      ]),
    );

  return ids.map(
    (personId) => ({
      personId,
      name:
        candidateName(
          left,
          personId,
        ) ||
        candidateName(
          right,
          personId,
        ),
      state:
        leftIds.has(personId) &&
        rightIds.has(personId)
          ? "both"
          : leftIds.has(personId)
            ? "left-only"
            : "right-only",
    }),
  );
}

export function rankedReasonForPerson(
  record: RecommendationHistoryRecord,
  personId: string,
): {
  score?: number;
  reasons: string[];
  concerns: string[];
} {
  const ranked =
    record.rankedPeople.find(
      (person) =>
        person.personId === personId,
    );

  return {
    score:
      ranked?.score,
    reasons:
      ranked?.reasons || [],
    concerns:
      ranked?.concerns || [],
  };
}

function clamp(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
