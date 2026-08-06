import Link from "next/link";
import { PageShell } from "@/components/Site";
import { AtlasOrb } from "@/components/AtlasOrb";
import "./getting-started.css";

const steps = [
  ["01","Create a Workspace","2 minutes","Create a company, community or friendship workspace. The creator automatically becomes the Owner.","A private workspace with you as Owner","/workspaces","Create Workspace"],
  ["02","Invite Members","3 minutes","Invite colleagues, friends or volunteers and assign the right permissions.","The right people have the right access","/members","Invite Members"],
  ["03","Complete Team DNA","5 minutes each","Members complete Team DNA and control whether Atlas may use it for matching and insights.","Consent-controlled collaboration profiles","/atlas","Meet Atlas"],
  ["04","Build the Talent Directory","5 minutes","Add the people Atlas can analyse. Talent may include employees who do not need workspace access.","A workspace-scoped Talent Directory","/talent","Manage Talent"],
  ["05","Create Talent Pools","3 minutes","Group Talent into focused populations such as Engineering, Graduates or Project Phoenix.","Relevant candidate pools","/talent-pools","Create Talent Pool"],
  ["06","Build Teams with Atlas","2 minutes","Choose a workspace, Talent Pool, team size and objective. Atlas only evaluates eligible Talent.","A balanced team recommendation","/team-builder","Build Team"],
  ["07","Review Atlas Recommendations","2 minutes","Understand why each person was selected, where the team is strong and which gaps remain.","An explainable recommendation","/insights","Review Insights"],
  ["08","Save and Improve","1 minute","Save teams, refine them on Team Canvas and retain a history of recommendations.","A reusable team intelligence record","/teams","View Teams"],
];

export default function GettingStartedPage() {
  return (
    <PageShell>
      <main className="v11-start">
        <section className="v11-start-hero">
          <div className="container v11-start-hero-grid">
            <div>
              <span className="eyebrow">Get Started</span>
              <h1>Set up AutoTeams in the right sequence.</h1>
              <h2>Powered by Atlas</h2>
              <p>Create the workspace, invite members, build a consent-controlled Talent Directory and then let Atlas recommend and explain teams.</p>
              <div className="actions">
                <Link className="button" href="/workspaces">Start with a Workspace</Link>
                <Link className="button secondary" href="/dashboard">Open Dashboard</Link>
              </div>
            </div>
            <aside><AtlasOrb size="xl"/><h3>Your AI Team Strategist</h3><p>Atlas creates Team DNA, builds balanced teams and explains every recommendation.</p></aside>
          </div>
        </section>
        <section className="v11-start-body">
          <div className="container">
            <div className="v11-start-heading"><span className="eyebrow">Workspace journey</span><h2>Eight guided steps</h2></div>
            <div className="v11-start-grid">
              {steps.map(([number,title,time,text,outcome,href,action]) => (
                <article key={number}>
                  <div className="top"><span>{number}</span><em>{time}</em></div>
                  <h2>{title}</h2><p>{text}</p>
                  <div className="outcome"><strong>Outcome</strong><span>{outcome}</span></div>
                  <Link href={href}>{action}<span>→</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
