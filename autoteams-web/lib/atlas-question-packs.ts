import type { ContextMode } from "@/lib/contextual-profiles";

export type AtlasQuestion = {
  id: string;
  category: string;
  prompt: string;
};

export const coreQuestions: AtlasQuestion[] = [
  {
    id: "core-communication",
    category: "Communication",
    prompt:
      "When a group needs direction, how do you usually communicate what should happen next?",
  },
  {
    id: "core-collaboration",
    category: "Collaboration",
    prompt:
      "Describe the kind of contribution you naturally make when working with other people.",
  },
  {
    id: "core-planning",
    category: "Planning",
    prompt:
      "Do you prefer a clear plan, a flexible outline or discovering the approach as you go?",
  },
  {
    id: "core-adaptability",
    category: "Adaptability",
    prompt:
      "How do you respond when priorities or circumstances change unexpectedly?",
  },
  {
    id: "core-leadership",
    category: "Leadership",
    prompt:
      "When do you naturally step forward to lead, and when do you prefer someone else to take the lead?",
  },
  {
    id: "core-conflict",
    category: "Conflict",
    prompt:
      "How do you handle disagreement when people have strongly different views?",
  },
];

export const contextQuestions: Record<ContextMode, AtlasQuestion[]> = {
  business: [
    {
      id: "business-clarity",
      category: "Delivery",
      prompt:
        "When a project becomes unclear, do you create structure, explore alternatives or bring people together to agree the next step?",
    },
    {
      id: "business-pressure",
      category: "Pressure",
      prompt:
        "How do you maintain delivery when deadlines tighten or dependencies fail?",
    },
    {
      id: "business-decisions",
      category: "Decision-making",
      prompt:
        "How do you balance evidence, experience and stakeholder expectations when making a decision?",
    },
    {
      id: "business-feedback",
      category: "Feedback",
      prompt:
        "How do you give challenge or feedback when you disagree with a colleague?",
    },
  ],
  friendship: [
    {
      id: "friendship-plans",
      category: "Social planning",
      prompt:
        "In a group of friends, do you usually organise activities, join plans created by others or prefer spontaneous arrangements?",
    },
    {
      id: "friendship-energy",
      category: "Social energy",
      prompt:
        "What size and type of social setting helps you feel most comfortable and energised?",
    },
    {
      id: "friendship-inclusion",
      category: "Inclusion",
      prompt:
        "What helps you feel included, and how do you help others feel welcome?",
    },
    {
      id: "friendship-reliability",
      category: "Reliability",
      prompt:
        "How important are advance notice, punctuality and following through on social plans?",
    },
  ],
  community: [
    {
      id: "community-contribution",
      category: "Contribution",
      prompt:
        "When volunteering, which contribution suits you best: organising people, practical tasks, community communication or direct support?",
    },
    {
      id: "community-motivation",
      category: "Motivation",
      prompt:
        "What motivates you to contribute to a community or cause?",
    },
    {
      id: "community-sensitivity",
      category: "Sensitive situations",
      prompt:
        "How do you approach situations involving vulnerable people or sensitive personal circumstances?",
    },
    {
      id: "community-commitment",
      category: "Commitment",
      prompt:
        "What level of time commitment can you reliably maintain?",
    },
  ],
  sports: [
    {
      id: "sports-pressure",
      category: "Pressure",
      prompt:
        "When your team is under pressure, do you motivate others, focus on your own role, suggest a tactical change or calm the group?",
    },
    {
      id: "sports-feedback",
      category: "Coaching",
      prompt:
        "How do you prefer to receive coaching or performance feedback?",
    },
    {
      id: "sports-competition",
      category: "Competition",
      prompt:
        "How do you balance competitiveness with supporting teammates?",
    },
    {
      id: "sports-results",
      category: "Resilience",
      prompt:
        "How do you respond after a difficult result or personal performance?",
    },
  ],
  education: [
    {
      id: "education-role",
      category: "Group assignments",
      prompt:
        "In a group assignment, which role do you naturally take: research, planning, writing, presenting, coordinating or checking quality?",
    },
    {
      id: "education-study",
      category: "Study style",
      prompt:
        "When do you learn best independently, and when does collaboration help?",
    },
    {
      id: "education-deadlines",
      category: "Deadlines",
      prompt:
        "How do you organise your work when several deadlines overlap?",
    },
    {
      id: "education-review",
      category: "Critical thinking",
      prompt:
        "How comfortable are you reviewing and challenging someone else's work?",
    },
  ],
};

export function getQuestionPack(mode: ContextMode): AtlasQuestion[] {
  return [...coreQuestions, ...contextQuestions[mode]];
}

export function suggestedRoles(mode: ContextMode): string[] {
  const roles: Record<ContextMode, string[]> = {
    business: [
      "Strategic Lead",
      "Delivery Builder",
      "Product Connector",
      "Analytical Challenger",
      "Creative Facilitator",
    ],
    friendship: [
      "Social Organiser",
      "Inclusive Connector",
      "Spontaneous Explorer",
      "Reliable Planner",
      "Group Supporter",
    ],
    community: [
      "Community Connector",
      "Volunteer Coordinator",
      "Practical Contributor",
      "Communications Lead",
      "Support Champion",
    ],
    sports: [
      "Team Captain",
      "Tactical Thinker",
      "Motivator",
      "Consistent Performer",
      "Team Supporter",
    ],
    education: [
      "Research Lead",
      "Project Coordinator",
      "Critical Reviewer",
      "Creative Contributor",
      "Presenter",
      "Quality Checker",
    ],
  };
  return roles[mode];
}
