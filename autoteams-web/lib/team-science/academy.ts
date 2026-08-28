export type AcademyLesson = {
  title: string;
  summary: string;
  content: string[];
  example?: string;
  takeaway: string;
};

export type AcademyPath = {
  slug: string;
  icon: string;
  title: string;
  shortTitle: string;
  description: string;
  duration: string;
  level: string;
  objectives: string[];
  lessons: AcademyLesson[];
  accent: string;
};

export const academyPaths: AcademyPath[] = [
  {
    slug: "foundations",
    icon: "🧠",
    title: "Team Science Foundations",
    shortTitle: "Foundations",
    description:
      "Understand what Team Science means in AutoTeams and the principles behind effective groups, collaboration, trust and shared purpose.",
    duration: "20 min",
    level: "Foundation",
    objectives: [
      "Understand the difference between individual capability and team effectiveness.",
      "Recognise why shared purpose, complementary strengths and trust matter.",
      "Understand why AutoTeams treats recommendations as decision support rather than automated decisions.",
    ],
    lessons: [
      {
        title: "What is Team Science?",
        summary:
          "Team Science is the structured study and application of the factors that help groups work effectively together.",
        content: [
          "A strong team is more than a collection of individually capable people. The way people combine, communicate, coordinate and respond to a shared goal can materially affect the result.",
          "AutoTeams uses Team Science as the methodology behind its people and team recommendations. The aim is to make team formation more deliberate, explainable and evidence-based.",
          "The same principles can apply across project teams, sports squads, friendship groups, communities, education and volunteering because each involves people working or participating together around a purpose.",
        ],
        example:
          "A football squad may contain the most talented players available, but still perform poorly if everyone wants the same role. A balanced squad needs complementary strengths.",
        takeaway:
          "Team effectiveness depends on how people combine, not only on how strong they are individually.",
      },
      {
        title: "Shared Purpose",
        summary:
          "Effective groups need a clear reason for existing and a common understanding of what success means.",
        content: [
          "A team objective creates the context for every other decision. Skills that are important for one outcome may be less relevant for another.",
          "AutoTeams therefore begins with the purpose of the team or group before considering who should be included.",
          "A clear purpose also helps people understand trade-offs. A short-term delivery team may prioritise speed and experience, while a mentoring group may prioritise learning, communication and development.",
        ],
        example:
          "A community event team may need organisers, communicators and practical volunteers rather than five people with the same specialist skill.",
        takeaway:
          "Start with the outcome before selecting the people.",
      },
      {
        title: "Complementary Strengths",
        summary:
          "Balance comes from combining different useful strengths rather than maximising one characteristic.",
        content: [
          "Complementary strengths allow people to contribute in different ways. One person may provide direction while another brings detailed planning, creativity or relationship-building.",
          "This does not mean every team requires every possible strength. The right balance depends on the objective and context.",
          "AutoTeams surfaces strengths and gaps so a human reviewer can decide whether the proposed mix is appropriate.",
        ],
        example:
          "A project team with excellent technical ability but no stakeholder communication may struggle to gain support even when the technical solution is strong.",
        takeaway:
          "The strongest group is often the one with the best combination, not the highest individual scores.",
      },
      {
        title: "Trust and Psychological Safety",
        summary:
          "People need enough trust to contribute, challenge, ask for help and share uncertainty.",
        content: [
          "Teams learn faster when people can raise concerns and make suggestions without unnecessary fear of embarrassment or punishment.",
          "Psychological safety does not mean avoiding challenge. It means creating conditions where respectful challenge can happen.",
          "AutoTeams can highlight balance and potential gaps, but trust is ultimately created through leadership, behaviour and experience over time.",
        ],
        example:
          "A study group becomes more useful when members can admit they do not understand a topic and ask for help.",
        takeaway:
          "A technically balanced team still needs an environment where people can contribute openly.",
      },
      {
        title: "Human Judgement",
        summary:
          "Team Science supports better decisions; it does not remove human responsibility.",
        content: [
          "Data and AI can surface patterns, gaps and possible combinations that a person might overlook.",
          "However, context is rarely complete. Personal circumstances, relationships, availability and sensitive information may not be represented in the data.",
          "AutoTeams therefore keeps a human review and approval step at the centre of the recommendation lifecycle.",
        ],
        example:
          "Atlas may identify a highly suitable volunteer, but the organiser may know that person is unavailable for the event date.",
        takeaway:
          "AI can improve the evidence available to a decision-maker, but people remain accountable for the decision.",
      },
    ],
    accent:
      "linear-gradient(135deg, rgba(120,104,255,.26), rgba(79,140,255,.08))",
  },
  {
    slug: "building-teams",
    icon: "👥",
    title: "Building Better Teams",
    shortTitle: "Building Teams",
    description:
      "Learn how purpose, skills, leadership, communication and diversity can be combined to form more balanced teams and groups.",
    duration: "25 min",
    level: "Core",
    objectives: [
      "Understand how to translate an objective into team requirements.",
      "Recognise the value of complementary skills and role balance.",
      "Use diversity and communication as design considerations rather than simple quotas.",
    ],
    lessons: [
      {
        title: "Design Around the Objective",
        summary:
          "Team formation should begin with the outcome the group needs to achieve.",
        content: [
          "Before selecting people, define the problem, expected outcome, team size and any important constraints.",
          "This prevents a common failure mode where familiar people are selected first and the objective is adapted around them later.",
          "AutoTeams asks for the team requirement before producing a recommendation so the reasoning can be tied back to the stated goal.",
        ],
        example:
          "A six-month cloud migration requires different strengths from a two-hour community fundraising event.",
        takeaway:
          "Describe the work before choosing the workers.",
      },
      {
        title: "Skills and Role Balance",
        summary:
          "Strong teams usually need coverage across several capabilities rather than duplication of one.",
        content: [
          "A team can appear highly skilled while still containing important gaps. Five specialists in one area may leave planning, coordination or communication uncovered.",
          "Role balance is contextual. Formal job titles matter less than the contribution required to achieve the objective.",
          "AutoTeams can compare the desired strengths with the available people and highlight missing or concentrated capabilities.",
        ],
        example:
          "A sports club committee needs people who can organise, communicate, manage money and engage members, not only people who understand the sport.",
        takeaway:
          "Look for coverage across the needs of the team, not just depth in one area.",
      },
      {
        title: "Leadership Balance",
        summary:
          "Leadership is useful when it provides direction without suppressing contribution from others.",
        content: [
          "Some groups need a clear leader. Others benefit from shared leadership where responsibility changes according to the situation.",
          "Too little leadership can create ambiguity; too much concentrated leadership can reduce autonomy and participation.",
          "Team design should therefore consider both formal leadership and the ability of members to take initiative.",
        ],
        example:
          "A volunteer group may have one coordinator while different members lead logistics, communications and fundraising.",
        takeaway:
          "Good leadership creates clarity and enables contribution from the rest of the group.",
      },
      {
        title: "Communication and Collaboration",
        summary:
          "How people exchange information can be as important as their technical or functional skill.",
        content: [
          "Communication includes listening, explaining, adapting to different audiences and surfacing problems early.",
          "Collaboration involves sharing work, coordinating dependencies and helping the group succeed rather than optimising only individual tasks.",
          "AutoTeams can treat these qualities as explicit strengths when they matter to the objective.",
        ],
        example:
          "A technically strong project can still fail if the team cannot explain decisions to customers or stakeholders.",
        takeaway:
          "Communication and collaboration should be designed into the team, not assumed.",
      },
      {
        title: "Diversity and Balance",
        summary:
          "Different perspectives can improve problem solving when the environment allows those perspectives to be heard.",
        content: [
          "Diversity can include experience, skills, background, thinking styles and approaches to problem solving.",
          "The purpose is not simply to maximise difference. Teams need enough shared understanding to work together while avoiding excessive similarity that can narrow thinking.",
          "AutoTeams should use diversity as one input into a wider balance assessment rather than as a single optimisation target.",
        ],
        example:
          "An innovation team benefits from different professional perspectives when members also share enough context to collaborate effectively.",
        takeaway:
          "Useful diversity combines different perspectives with the conditions needed to integrate them.",
      },
    ],
    accent:
      "linear-gradient(135deg, rgba(34,197,94,.22), rgba(20,184,166,.08))",
  },
  {
    slug: "atlas",
    icon: "🤖",
    title: "Atlas & Explainable AI",
    shortTitle: "Atlas",
    description:
      "Understand how Atlas supports team recommendations, what explainability means and why the final decision remains with a person.",
    duration: "20 min",
    level: "Core",
    objectives: [
      "Understand Atlas as the intelligence layer inside AutoTeams.",
      "Interpret recommendation confidence, strengths, gaps and risks.",
      "Understand the difference between AI recommendation and human decision.",
    ],
    lessons: [
      {
        title: "What Atlas Does",
        summary:
          "Atlas helps AutoTeams analyse available evidence and produce an explainable recommendation.",
        content: [
          "Atlas is the intelligence layer inside AutoTeams. It evaluates the team objective together with information about the authorised people who may be considered.",
          "Its purpose is not to declare a perfect team. It helps surface a plausible combination and explains the evidence behind that suggestion.",
          "The recommendation can then be reviewed, compared, adjusted, approved or rejected by a human.",
        ],
        example:
          "For a delivery team, Atlas may prioritise a mix of planning, technical delivery, communication and leadership rather than ranking everyone using one score.",
        takeaway:
          "Atlas supports the decision process; it does not own the decision.",
      },
      {
        title: "Explainable Recommendations",
        summary:
          "A recommendation should show the reasoning that led to it.",
        content: [
          "Explainability helps users challenge, validate and improve an AI-assisted decision.",
          "AutoTeams exposes team strengths, skill gaps, risks, confidence and person-level reasons instead of returning only a list of names.",
          "This creates a more useful conversation between the system and the reviewer because the reviewer can assess the reasoning rather than accepting a black-box output.",
        ],
        example:
          "A recommendation can explain that one person was selected for leadership while another was selected to cover a missing collaboration strength.",
        takeaway:
          "A recommendation is more trustworthy when its reasoning can be inspected and challenged.",
      },
      {
        title: "Confidence Scores",
        summary:
          "Confidence is a signal about the strength of the match, not a probability that the team will succeed.",
        content: [
          "A high confidence score should not be interpreted as a guarantee of performance.",
          "The score reflects the evidence available to the recommendation process and how well the selected group appears to satisfy the stated requirement.",
          "Missing or poor-quality profile data should reduce how much weight a reviewer places on the score.",
        ],
        example:
          "A 90% match does not mean there is a 90% chance of project success. It means the available evidence strongly aligns with the stated team requirement.",
        takeaway:
          "Treat confidence as decision support, not certainty.",
      },
      {
        title: "Risks, Gaps and Alternatives",
        summary:
          "A useful AI system should highlight what may be missing as well as what looks strong.",
        content: [
          "Every recommendation contains trade-offs. A team may be strong in experience but weak in availability, or balanced in skills but light on leadership.",
          "Surfacing gaps helps reviewers understand where mitigation may be needed.",
          "Alternative recommendations and team comparison can be valuable when more than one reasonable combination exists.",
        ],
        example:
          "A sports squad may have excellent attacking capability while lacking defensive balance. The reviewer can decide whether that trade-off is acceptable.",
        takeaway:
          "Good recommendations expose uncertainty and trade-offs rather than hiding them.",
      },
      {
        title: "Responsible Human Review",
        summary:
          "Human oversight is part of the AutoTeams design, not an optional extra.",
        content: [
          "People decisions can affect opportunity, participation and relationships. They therefore deserve review and accountability.",
          "AutoTeams records recommendation lifecycle events so a decision can be understood later.",
          "The reviewer should consider context that may not exist in the data and should be able to reject or change the recommendation.",
        ],
        example:
          "A manager may reject a recommended person because the individual is already committed to another critical project.",
        takeaway:
          "The final decision should remain transparent, reviewable and owned by a person.",
      },
    ],
    accent:
      "linear-gradient(135deg, rgba(168,85,247,.24), rgba(79,140,255,.08))",
  },
  {
    slug: "team-health",
    icon: "📈",
    title: "Team Health",
    shortTitle: "Team Health",
    description:
      "Learn how to think about team balance after formation and how strengths, gaps, collaboration and change can affect a team over time.",
    duration: "25 min",
    level: "Applied",
    objectives: [
      "Understand team health as an ongoing condition rather than a one-time score.",
      "Recognise signals of imbalance, concentration and capability gaps.",
      "Use Team Science observations to support continuous improvement.",
    ],
    lessons: [
      {
        title: "What is Team Health?",
        summary:
          "Team health describes whether a group has the conditions and capability to continue working effectively.",
        content: [
          "A team that looked balanced when it was formed may change as people leave, priorities shift or new challenges emerge.",
          "Team health therefore considers the current mix of strengths, collaboration patterns, risks and gaps rather than only the original recommendation.",
          "AutoTeams can evolve from team formation into ongoing team intelligence by retaining this history over time.",
        ],
        example:
          "A project team may become overloaded after its only experienced planner leaves, even though the original team was well balanced.",
        takeaway:
          "Team health changes over time and should be reviewed periodically.",
      },
      {
        title: "Strength Concentration",
        summary:
          "Having a strength is useful; depending on only one person for it can create fragility.",
        content: [
          "A team may appear to have complete capability coverage while still relying heavily on one individual.",
          "Concentration creates risk when the person is unavailable or leaves.",
          "Team health reviews can therefore consider whether critical strengths are distributed enough to support resilience.",
        ],
        example:
          "If only one community volunteer knows how to manage event bookings, the group has a dependency even though the skill technically exists.",
        takeaway:
          "Coverage and resilience are different things.",
      },
      {
        title: "Gaps and Development",
        summary:
          "A gap can be mitigated through learning, support or changes in team composition.",
        content: [
          "Not every capability gap requires replacing someone or adding a new member.",
          "Training, mentoring, role adjustment or temporary support may be more appropriate.",
          "Team Science should therefore support development decisions as well as selection decisions.",
        ],
        example:
          "A junior team member may develop facilitation skills through mentoring rather than the team recruiting another person.",
        takeaway:
          "Treat gaps as improvement opportunities, not automatically as reasons to remove people.",
      },
      {
        title: "Collaboration Signals",
        summary:
          "Team effectiveness can deteriorate even when formal skills remain unchanged.",
        content: [
          "Repeated communication breakdowns, unresolved conflict, low participation or unclear ownership can be indicators that the team needs attention.",
          "These signals should be interpreted carefully and with context; they should not become simplistic individual performance scores.",
          "The purpose of team health is to support constructive improvement rather than surveillance.",
        ],
        example:
          "A sports team may have the right positions covered but still struggle because players do not communicate effectively during games.",
        takeaway:
          "Team health is about the system of relationships as well as the individuals.",
      },
      {
        title: "Continuous Improvement",
        summary:
          "Teams improve when they review evidence, learn and adapt.",
        content: [
          "Periodic reflection helps teams understand what is working and what needs to change.",
          "Recommendation history and decision audit data can create a useful evidence base when used responsibly.",
          "Future AutoTeams capabilities can connect team outcomes back to Team Science observations without treating people as fixed scores.",
        ],
        example:
          "A volunteer committee can review after each event and adjust roles based on what worked well and where pressure occurred.",
        takeaway:
          "Team Science should help teams learn, not label them permanently.",
      },
    ],
    accent:
      "linear-gradient(135deg, rgba(249,115,22,.22), rgba(239,68,68,.07))",
  },
];

export const teamSciencePrinciples = [
  {
    title: "Complementary Skills",
    text:
      "Look for a useful mix of strengths rather than simply selecting the highest individual scores.",
  },
  {
    title: "Leadership Balance",
    text:
      "Consider whether the group has enough direction without concentrating leadership in one person.",
  },
  {
    title: "Communication Mix",
    text:
      "Balance people who can communicate, listen, coordinate and adapt across different situations.",
  },
  {
    title: "Experience Distribution",
    text:
      "Combine experience and emerging capability so knowledge can be applied and shared.",
  },
  {
    title: "Human Accountability",
    text:
      "Recommendations are evidence for a person to review, not an automated final decision.",
  },
];
