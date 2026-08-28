export type AssessmentQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const PASS_MARK = 70;

export const courseAssessments: Record<
  string,
  AssessmentQuestion[]
> = {
  "team-science-foundations": [
    {
      id: "tsf-1",
      question:
        "Which statement best reflects the AutoTeams view of Team Science?",
      options: [
        "The strongest team is always made up of the highest-scoring individuals.",
        "Team effectiveness depends on how people combine around a shared purpose.",
        "Team Science removes the need for human judgement.",
        "Every team should contain the same set of strengths.",
      ],
      correctIndex: 1,
      explanation:
        "Team Science focuses on how people combine around a purpose, not simply on individual scores.",
    },
    {
      id: "tsf-2",
      question:
        "Why are complementary strengths important when forming a team?",
      options: [
        "They help cover different needs of the team.",
        "They guarantee that the team will succeed.",
        "They remove the need for leadership.",
        "They ensure everyone works in the same way.",
      ],
      correctIndex: 0,
      explanation:
        "Complementary strengths help the group cover different needs rather than duplicating the same capability.",
    },
    {
      id: "tsf-3",
      question:
        "What role should AI play in an AutoTeams recommendation?",
      options: [
        "Make the final decision automatically.",
        "Replace the team leader.",
        "Provide explainable decision-support evidence for human review.",
        "Select people without showing the reasoning.",
      ],
      correctIndex: 2,
      explanation:
        "AutoTeams follows the principle that AI recommends and humans decide.",
    },
  ],

  "building-better-teams": [
    {
      id: "bbt-1",
      question:
        "What should normally be defined before selecting people for a team?",
      options: [
        "The team objective and required outcome.",
        "The oldest available team member.",
        "The highest individual score.",
        "A fixed universal skills list.",
      ],
      correctIndex: 0,
      explanation:
        "Team design starts with purpose so strengths can be considered in the correct context.",
    },
    {
      id: "bbt-2",
      question:
        "How should context-aware skill suggestions be treated?",
      options: [
        "They must always be accepted.",
        "They are suggestions that the user can review, add or remove.",
        "They replace all human judgement.",
        "They should only be used for workplace teams.",
      ],
      correctIndex: 1,
      explanation:
        "Context-aware skills are decision support. The user remains in control of the final selected strengths.",
    },
    {
      id: "bbt-3",
      question:
        "A team has excellent technical capability but nobody is comfortable communicating with stakeholders. What does this illustrate?",
      options: [
        "The team is automatically balanced.",
        "A capability gap can exist even when individual members are strong.",
        "Communication never matters when technical skill is high.",
        "The team should ignore the stakeholder requirement.",
      ],
      correctIndex: 1,
      explanation:
        "A team can contain strong individuals and still have an important gap against its purpose.",
    },
  ],

  "atlas-explainable-ai": [
    {
      id: "aea-1",
      question:
        "What does a high recommendation confidence score mean?",
      options: [
        "The team is guaranteed to succeed.",
        "The available evidence aligns strongly with the stated requirement.",
        "The AI has made the final decision.",
        "Every candidate is equally suitable.",
      ],
      correctIndex: 1,
      explanation:
        "Confidence indicates alignment with available evidence and requirements; it is not a guarantee of success.",
    },
    {
      id: "aea-2",
      question:
        "Why does explainability matter in AutoTeams?",
      options: [
        "It allows the recommendation to be inspected and challenged.",
        "It hides uncertainty from the user.",
        "It makes human review unnecessary.",
        "It guarantees an unbiased outcome.",
      ],
      correctIndex: 0,
      explanation:
        "Explainability helps users understand, challenge and validate recommendation reasoning.",
    },
    {
      id: "aea-3",
      question:
        "Which statement best describes Atlas?",
      options: [
        "Atlas is the final decision-maker.",
        "Atlas is the AutoTeams intelligence layer that supports explainable recommendations.",
        "Atlas is only a navigation menu.",
        "Atlas replaces Team Science.",
      ],
      correctIndex: 1,
      explanation:
        "Atlas is the intelligence layer. Team Science remains the methodology and humans retain decision accountability.",
    },
  ],

  "team-health": [
    {
      id: "th-1",
      question:
        "Why should team health be reviewed over time?",
      options: [
        "Because team composition and circumstances can change.",
        "Because the original recommendation is always wrong.",
        "Because every team needs replacing regularly.",
        "Because skills never develop.",
      ],
      correctIndex: 0,
      explanation:
        "People, priorities, relationships and capability can change after the team is formed.",
    },
    {
      id: "th-2",
      question:
        "What is an example of strength concentration risk?",
      options: [
        "Several people can perform a critical capability.",
        "Only one person knows how to perform a critical activity.",
        "The team shares knowledge regularly.",
        "The team has multiple communication styles.",
      ],
      correctIndex: 1,
      explanation:
        "Depending on a single person for a critical capability creates fragility even if the capability technically exists.",
    },
    {
      id: "th-3",
      question:
        "What is the purpose of team health information?",
      options: [
        "To permanently label individuals.",
        "To support constructive reflection and improvement.",
        "To remove human discussion.",
        "To rank people publicly.",
      ],
      correctIndex: 1,
      explanation:
        "Team health should support improvement conversations, not simplistic surveillance or permanent labels.",
    },
  ],
};
