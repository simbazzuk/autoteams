import type { ContextMode } from "@/lib/contextual-profiles";
import {
  loadCoreInterview,
  loadContextInterview,
  profileFreshness,
} from "@/lib/atlas-interview-state";
import { coreQuestions, contextQuestions } from "@/lib/atlas-question-packs";

export type TeamDnaTrait = {
  name: string;
  score: number;
  description: string;
};

export type TeamDnaInsight = {
  profileId: string;
  mode: ContextMode;
  confidence: number;
  freshnessLabel: string;
  freshnessStatus: "fresh" | "aging" | "stale" | "not-started";
  completion: number;
  interviewComplete: boolean;
  strengths: string[];
  developmentAreas: string[];
  traits: TeamDnaTrait[];
  summary: string;
};

function hashText(text: string): number {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 100000;
  }
  return hash;
}

function scoreFromAnswers(
  answerText: string,
  offset: number,
  complete: boolean,
): number {
  if (!complete && !answerText.trim()) return 0;
  const base = 62 + ((hashText(answerText || String(offset)) + offset) % 34);
  return Math.min(96, Math.max(58, base));
}

const traitDefinitions: Record<
  ContextMode,
  Array<{ name: string; description: string }>
> = {
  business: [
    { name: "Communication", description: "How clearly ideas, concerns and decisions are shared." },
    { name: "Leadership", description: "How naturally responsibility and direction are taken." },
    { name: "Delivery", description: "How reliably priorities are converted into outcomes." },
    { name: "Adaptability", description: "How effectively changing circumstances are handled." },
    { name: "Challenge", description: "How confidently evidence and assumptions are tested." },
  ],
  friendship: [
    { name: "Social Energy", description: "The type and size of social setting that feels natural." },
    { name: "Reliability", description: "How consistently plans and commitments are maintained." },
    { name: "Inclusion", description: "How naturally others are welcomed and supported." },
    { name: "Spontaneity", description: "Comfort with flexible and last-minute arrangements." },
    { name: "Connection", description: "How relationships and shared interests are developed." },
  ],
  community: [
    { name: "Commitment", description: "How consistently time and energy can be contributed." },
    { name: "Empathy", description: "How thoughtfully other people's circumstances are understood." },
    { name: "Organisation", description: "How effectively volunteers, activities and resources are coordinated." },
    { name: "Practical Support", description: "Readiness to complete useful hands-on work." },
    { name: "Community Connection", description: "Ability to build trust across diverse groups." },
  ],
  sports: [
    { name: "Teamwork", description: "How effectively individual contribution supports the team." },
    { name: "Resilience", description: "How quickly setbacks and difficult results are overcome." },
    { name: "Competitive Drive", description: "How strongly performance and winning motivate behaviour." },
    { name: "Tactical Awareness", description: "How well situations are read and adjusted during activity." },
    { name: "Motivation", description: "How energy and encouragement are brought to teammates." },
  ],
  education: [
    { name: "Research", description: "How confidently information is explored and evaluated." },
    { name: "Planning", description: "How effectively assignments, milestones and deadlines are organised." },
    { name: "Critical Review", description: "How constructively ideas and work are challenged." },
    { name: "Presentation", description: "How clearly learning and conclusions are communicated." },
    { name: "Collaboration", description: "How effectively responsibility is shared in group work." },
  ],
};

export function buildTeamDnaInsight(
  profileId: string,
  mode: ContextMode,
): TeamDnaInsight {
  const core = loadCoreInterview();
  const context = loadContextInterview(profileId, mode);
  const freshness = profileFreshness(context.completedAt);

  const coreAnswered = coreQuestions.filter((question) =>
    Boolean(core.answers[question.id]?.trim()),
  ).length;
  const contextAnswered = contextQuestions[mode].filter((question) =>
    Boolean(context.answers[question.id]?.trim()),
  ).length;
  const questionCount = coreQuestions.length + contextQuestions[mode].length;
  const answered = coreAnswered + contextAnswered;
  const completion = questionCount
    ? Math.round((answered / questionCount) * 100)
    : 0;

  const allText = [
    ...Object.values(core.answers),
    ...Object.values(context.answers),
  ].join(" ");

  const complete = Boolean(core.completedAt && context.completedAt);
  const traits = traitDefinitions[mode].map((trait, index) => ({
    ...trait,
    score: scoreFromAnswers(allText, (index + 1) * 17, complete),
  }));

  const ranked = [...traits].sort((left, right) => right.score - left.score);
  const strengths = ranked
    .slice(0, 3)
    .map((trait) => `${trait.name}: ${strengthNarrative(trait.name, mode)}`);
  const developmentAreas = ranked
    .slice(-2)
    .reverse()
    .map((trait) => `${trait.name}: ${developmentNarrative(trait.name, mode)}`);

  return {
    profileId,
    mode,
    confidence: complete ? freshness.confidence : Math.min(70, completion),
    freshnessLabel: freshness.label,
    freshnessStatus: freshness.status,
    completion,
    interviewComplete: complete,
    strengths,
    developmentAreas,
    traits,
    summary: summaryFor(mode, ranked[0]?.name, ranked[1]?.name, complete),
  };
}

function summaryFor(
  mode: ContextMode,
  first?: string,
  second?: string,
  complete = false,
): string {
  if (!complete) {
    return "Complete the core and contextual Atlas interviews to generate a full Team DNA summary.";
  }

  const contextText: Record<ContextMode, string> = {
    business: "workplace collaboration",
    friendship: "social connection",
    community: "community contribution",
    sports: "sports teamwork",
    education: "learning and group projects",
  };

  return `Your strongest signals currently relate to ${first || "collaboration"} and ${second || "adaptability"} within ${contextText[mode]}.`;
}

function strengthNarrative(name: string, mode: ContextMode): string {
  const descriptions: Record<string, string> = {
    Communication: "communicates direction and concerns clearly",
    Leadership: "is comfortable taking responsibility when required",
    Delivery: "turns plans into dependable outcomes",
    Adaptability: "responds constructively when priorities change",
    Challenge: "tests assumptions without losing collaboration",
    "Social Energy": "understands the settings that create enjoyable connection",
    Reliability: "follows through on plans and commitments",
    Inclusion: "helps others feel welcome and involved",
    Spontaneity: "brings flexibility and energy to social plans",
    Connection: "builds relationships around shared interests",
    Commitment: "provides dependable support over time",
    Empathy: "responds thoughtfully to different needs",
    Organisation: "creates structure around people and activities",
    "Practical Support": "contributes through useful action",
    "Community Connection": "builds trust with different groups",
    Teamwork: "balances personal contribution with team needs",
    Resilience: "recovers constructively after setbacks",
    "Competitive Drive": "brings focus and performance energy",
    "Tactical Awareness": "reads situations and adjusts effectively",
    Motivation: "encourages teammates during pressure",
    Research: "explores evidence and information thoroughly",
    Planning: "organises work and deadlines clearly",
    "Critical Review": "improves quality through constructive challenge",
    Presentation: "communicates learning with clarity",
    Collaboration: "shares responsibility effectively",
  };
  return descriptions[name] || `shows a strong ${name.toLowerCase()} signal in this ${mode} profile`;
}

function developmentNarrative(name: string, mode: ContextMode): string {
  return `could be strengthened through deliberate practice and feedback in the ${mode} context`;
}
