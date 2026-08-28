export type SupportLink = { label: string; href: string };

export const PRODUCT_CONTEXT = `
AutoTeams is a Team Science platform for building better teams, groups and communities using explainable AI and human judgement.
AutoTeams is the platform. Atlas is the intelligence layer. Team Science is the methodology. Academy is the learning experience.
Core principle: AI recommends; humans decide.
Main areas: Dashboard /home, Get Started /get-started, People /people, Build Team /team-builder, Atlas Coach /gemini-team-coach, Teams /teams, Academy /academy, Recommendation History /recommendation-history.
Build Team uses a five-step flow: choose group, choose people, describe the requirement, review the recommendation, confirm the human decision.
Context-aware skills use the team name and outcome to suggest relevant strengths. Communication, Collaboration and Adaptability form a universal Team Science core. Suggestions remain under user control.
Academy learning paths: Team Science Foundations, Building Better Teams, Atlas & Explainable AI, Team Health.
Never invent workspace or user data. Never claim to change data. Atlas Support is read-only.
`.trim();

export function routeContext(pathname: string) {
  if (pathname.startsWith("/team-builder")) return "The user is in Build Team.";
  if (pathname.startsWith("/people")) return "The user is on People.";
  if (pathname.startsWith("/academy")) return "The user is in Team Science Academy.";
  if (pathname.startsWith("/recommendation")) return "The user is viewing recommendation information.";
  if (pathname.startsWith("/teams")) return "The user is viewing saved teams.";
  if (pathname.startsWith("/get-started")) return "The user is in Get Started.";
  if (pathname.startsWith("/gemini-team-coach")) return "The user is using Atlas Coach.";
  if (pathname === "/home") return "The user is on the Dashboard.";
  if (pathname === "/") return "The user is on the product landing page.";
  return `The user is on ${pathname}.`;
}

export function supportLinksFor(question: string): SupportLink[] {
  const q = question.toLowerCase();
  if (/(build|team|skill|strength|recommend)/.test(q)) return [
    { label: "Build Team", href: "/team-builder" },
    { label: "Academy", href: "/academy" },
  ];
  if (/(people|person|profile|member)/.test(q)) return [
    { label: "People", href: "/people" },
    { label: "Get Started", href: "/get-started" },
  ];
  if (/(academy|science|learn)/.test(q)) return [
    { label: "Academy", href: "/academy" },
    { label: "Foundations", href: "/academy/foundations" },
  ];
  if (/(history|audit)/.test(q)) return [
    { label: "Recommendation History", href: "/recommendation-history" },
  ];
  return [
    { label: "Get Started", href: "/get-started" },
    { label: "Academy", href: "/academy" },
  ];
}

export function deterministicAnswer(question: string, pathname: string) {
  const q = question.toLowerCase();
  if (/(what.*team science|team science.*what)/.test(q)) {
    return "Team Science is the methodology TeamScience.ai uses to understand how people combine around a shared purpose. It considers complementary strengths, communication, leadership balance, collaboration and human judgement.";
  }
  if (/(how.*build|create.*team|build.*team)/.test(q)) {
    return "Open Build Team and work through five steps: choose the group, choose authorised people, describe the requirement, review Atlas's recommendation, then confirm the human decision.";
  }
  if (/(skill|strength).*suggest|why.*skill/.test(q)) {
    return "TeamScience.ai uses the team name and desired outcome to infer likely strengths. Communication, Collaboration and Adaptability form the universal core. Other suggestions vary by context, and you decide which ones remain selected.";
  }
  if (/(confidence|match score|percentage)/.test(q)) {
    return "Confidence is decision-support evidence, not a guarantee of success. Review the strengths, gaps, risks and person-level reasons before making the final decision.";
  }
  if (/(academy|learn)/.test(q)) {
    return "The Team Science Academy contains Foundations, Building Better Teams, Atlas & Explainable AI, and Team Health.";
  }
  if (/(firebase|firestore|permission)/.test(q)) {
    return "Check the signed-in account, active workspace, Firestore rules and required indexes. Atlas Support is read-only and cannot change Firebase permissions.";
  }
  if (pathname.startsWith("/team-builder")) {
    return "You are in Build Team. I can explain the requirement fields, context-aware skills, confidence, strengths, gaps or the five-step workflow.";
  }
  return "I can help with TeamScience.ai navigation, People, Build Team, Atlas recommendations, Team Science, Academy learning, saved teams and recommendation history.";
}
