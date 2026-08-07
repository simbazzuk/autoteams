import { Type } from "@google/genai";

export const recommendationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    recommendedPersonIds: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Candidate IDs recommended for the team. Use only IDs supplied in the request.",
    },
    confidence: {
      type: Type.INTEGER,
      description: "Overall confidence from 0 to 100.",
    },
    summary: {
      type: Type.STRING,
      description:
        "A concise explanation of why the proposed team fits the requirement.",
    },
    rankedPeople: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          personId: {
            type: Type.STRING,
            description:
              "Candidate ID from the supplied candidate population.",
          },
          score: {
            type: Type.INTEGER,
            description: "Candidate fit score from 0 to 100.",
          },
          reasons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Evidence-based reasons supporting the candidate.",
          },
          concerns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Missing evidence, limitations, or points for human review.",
          },
        },
        required: ["personId", "score", "reasons", "concerns"],
        propertyOrdering: [
          "personId",
          "score",
          "reasons",
          "concerns",
        ],
      },
    },
    teamStrengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Strengths of the proposed team as a combined group.",
    },
    skillGaps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Required capabilities that are missing or weakly evidenced.",
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Risks or uncertainties requiring human review.",
    },
  },
  required: [
    "recommendedPersonIds",
    "confidence",
    "summary",
    "rankedPeople",
    "teamStrengths",
    "skillGaps",
    "risks",
  ],
  propertyOrdering: [
    "recommendedPersonIds",
    "confidence",
    "summary",
    "rankedPeople",
    "teamStrengths",
    "skillGaps",
    "risks",
  ],
} as const;
