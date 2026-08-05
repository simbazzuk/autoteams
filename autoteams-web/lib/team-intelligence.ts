export type TeamDna = {
  leadership: number;
  collaboration: number;
  communication: number;
  planning: number;
  creativity: number;
  adaptability: number;
  socialEnergy: number;
  reliability: number;
};

export type ProfileAnalysis = {
  summary: string;
  teamDna: TeamDna;
  preferredRoles: string[];
  workingStyle: string;
  strengths: string[];
  potentialChallenges: string[];
  recommendedEnvironment: string;
};

export type CandidateProfile = {
  id: string;
  name: string;
  city: string;
  teamType: string;
  interests: string[];
  availability: string[];
  goals: string[];
  trustLevel: number;
  dna: TeamDna;
  role: string;
};

export type MatchExplanation = {
  candidate: CandidateProfile;
  score: number;
  reasons: string[];
  cautions: string[];
  dimensions: {
    goals: number;
    availability: number;
    interests: number;
    location: number;
    dnaBalance: number;
    trust: number;
  };
};

export const defaultDna: TeamDna = {
  leadership: 60,
  collaboration: 72,
  communication: 68,
  planning: 65,
  creativity: 70,
  adaptability: 66,
  socialEnergy: 58,
  reliability: 75,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function overlapScore(left: string[], right: string[]): number {
  if (!left.length || !right.length) return 50;

  const normalise = (value: string) => value.trim().toLowerCase();
  const leftSet = new Set(left.map(normalise));
  const rightSet = new Set(right.map(normalise));
  const matches = [...leftSet].filter((value) => rightSet.has(value)).length;
  const denominator = Math.max(leftSet.size, rightSet.size);

  return clamp((matches / denominator) * 100);
}

function complementaryDnaScore(a: TeamDna, b: TeamDna): number {
  const values = (Object.keys(a) as (keyof TeamDna)[]).map((key) => {
    const difference = Math.abs(a[key] - b[key]);

    // Moderate differences can provide useful complementarity.
    if (difference >= 12 && difference <= 35) return 92;
    if (difference < 12) return 78;
    return Math.max(45, 90 - difference);
  });

  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function scoreCandidate(
  person: {
    city: string;
    teamType: string;
    interests: string[];
    availability: string[];
    goals: string[];
    trustLevel: number;
    dna: TeamDna;
  },
  candidate: CandidateProfile
): MatchExplanation {
  const goals = overlapScore(person.goals, candidate.goals);
  const availability = overlapScore(
    person.availability,
    candidate.availability
  );
  const interests = overlapScore(person.interests, candidate.interests);
  const location =
    person.city.trim().toLowerCase() === candidate.city.trim().toLowerCase()
      ? 100
      : 60;
  const dnaBalance = complementaryDnaScore(person.dna, candidate.dna);
  const trust =
    candidate.trustLevel >= person.trustLevel
      ? 100
      : clamp(100 - (person.trustLevel - candidate.trustLevel) * 25);

  const score = clamp(
    goals * 0.25 +
      availability * 0.2 +
      interests * 0.2 +
      location * 0.15 +
      dnaBalance * 0.1 +
      trust * 0.1
  );

  const reasons: string[] = [];
  const cautions: string[] = [];

  if (goals >= 70) reasons.push("Strong alignment around the purpose of the team");
  if (availability >= 70) reasons.push("Compatible availability");
  if (interests >= 60) reasons.push("Several shared interests or skills");
  if (location >= 90) reasons.push("Located in the same area");
  if (dnaBalance >= 80) reasons.push("Complementary Team DNA");
  if (trust >= 90) reasons.push("Meets the required trust level");

  if (availability < 55) cautions.push("Availability may require coordination");
  if (interests < 45) cautions.push("Limited direct overlap in interests");
  if (dnaBalance < 60) cautions.push("Working styles may need active alignment");
  if (trust < 75) cautions.push("Candidate has a lower trust level");

  return {
    candidate,
    score,
    reasons: reasons.length ? reasons : ["Balanced overall compatibility"],
    cautions,
    dimensions: {
      goals,
      availability,
      interests,
      location,
      dnaBalance,
      trust,
    },
  };
}
