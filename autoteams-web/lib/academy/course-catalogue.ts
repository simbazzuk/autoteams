export type CourseModule={id:string;title:string;summary:string;minutes:number};
export type AcademyCourse={slug:string;icon:string;title:string;summary:string;level:"Beginner"|"Intermediate"|"Advanced";minutes:number;modules:CourseModule[];available:boolean;pathway:string};
export const academyCourses:AcademyCourse[]=[
{slug:"team-science-foundations",icon:"Foundations",title:"Team Science Foundations",summary:"Understand effective teams, complementary strengths and human-centred team decisions.",level:"Beginner",minutes:45,available:true,pathway:"Foundation",modules:[
{id:"what-is-team-science",title:"What is Team Science?",summary:"Explore how people combine around a shared purpose.",minutes:6},
{id:"individual-v-team",title:"Individual vs Team Performance",summary:"Why strong individuals do not automatically create a strong team.",minutes:6},
{id:"complementary-strengths",title:"Complementary Strengths",summary:"Why coverage and balance matter.",minutes:7},
{id:"communication",title:"Communication & Collaboration",summary:"Explore universal foundations of teamwork.",minutes:7},
{id:"leadership",title:"Leadership & Team Roles",summary:"Understand distributed leadership and contribution.",minutes:6},
{id:"psychological-safety",title:"Psychological Safety",summary:"Why people need space to question and contribute.",minutes:7},
{id:"balanced-teams",title:"Building Balanced Teams",summary:"Bring Team Science concepts together.",minutes:6}]},
{slug:"building-better-teams",icon:"Team Building",title:"Building Better Teams",summary:"Apply Team Science to purpose, skills, roles and practical team formation.",level:"Intermediate",minutes:60,available:true,pathway:"Apply",modules:[
{id:"purpose-first",title:"Start With Purpose",summary:"Translate an outcome into a clear team requirement.",minutes:10},
{id:"skills-context",title:"Context-Aware Strengths",summary:"Choose strengths that reflect the team's purpose.",minutes:10},
{id:"balance",title:"Balance Over Similarity",summary:"Value complementary rather than identical profiles.",minutes:10},
{id:"team-risks",title:"Team Risks & Gaps",summary:"Identify missing coverage and collaboration risks.",minutes:10},
{id:"human-review",title:"Human Review",summary:"Use AI evidence without handing over the decision.",minutes:10},
{id:"practice",title:"Practical Team Exercise",summary:"Apply the concepts using AutoTeams Build Team.",minutes:10}]},
{slug:"atlas-explainable-ai",icon:"Explainable AI",title:"Atlas & Explainable AI",summary:"Interpret AI-supported recommendations, confidence, evidence and human review.",level:"Intermediate",minutes:55,available:true,pathway:"Explain",modules:[
{id:"decision-support",title:"AI as Decision Support",summary:"Recommendation versus decision.",minutes:9},
{id:"evidence",title:"Reading Recommendation Evidence",summary:"Interpret strengths, gaps and reasoning.",minutes:10},
{id:"confidence",title:"Understanding Confidence",summary:"Confidence is evidence, not a guarantee.",minutes:9},
{id:"explainability",title:"Explainability",summary:"Recommendations should be understandable and challengeable.",minutes:9},
{id:"bias-review",title:"Human Review & Bias",summary:"Use judgement to challenge assumptions.",minutes:9},
{id:"atlas-practice",title:"Ask Atlas",summary:"Explore recommendation concepts with Atlas.",minutes:9}]},
{slug:"team-health",icon:"Team Health",title:"Team Health",summary:"Explore psychological safety, communication, resilience and healthy team signals.",level:"Intermediate",minutes:70,available:true,pathway:"Develop",modules:[
{id:"health-signals",title:"Team Health Signals",summary:"Understand behaviours and patterns worth watching.",minutes:12},
{id:"safety",title:"Psychological Safety",summary:"Create conditions where people can speak and challenge.",minutes:12},
{id:"communication-health",title:"Healthy Communication",summary:"Recognise helpful communication patterns.",minutes:12},
{id:"resilience",title:"Team Resilience",summary:"How teams respond to pressure and change.",minutes:12},
{id:"reflection",title:"Reflection & Improvement",summary:"Turn signals into improvement conversations.",minutes:12},
{id:"health-practice",title:"Team Health Exercise",summary:"Apply the ideas to a scenario.",minutes:10}]},
{slug:"team-dynamics-leadership",icon:"Leadership",title:"Team Dynamics & Leadership",summary:"Explore team roles, leadership distribution, influence and how dynamics change as teams evolve.",level:"Advanced",minutes:75,available:false,pathway:"Lead",modules:[]},
{slug:"conflict-collaboration",icon:"Collaboration",title:"Conflict & Collaboration",summary:"Understand constructive challenge, healthy disagreement and strong collaboration.",level:"Advanced",minutes:70,available:false,pathway:"Collaborate",modules:[]},
{slug:"ai-assisted-team-design",icon:"AI Team Design",title:"AI-Assisted Team Design",summary:"Apply explainable AI, Team Science evidence and human judgement to complex team design decisions.",level:"Advanced",minutes:90,available:false,pathway:"Design",modules:[]}
];
export const availableAcademyCourses=academyCourses.filter(c=>c.available);
export function getAcademyCourse(slug:string){return availableAcademyCourses.find(c=>c.slug===slug)}
