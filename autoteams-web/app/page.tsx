import Link from "next/link";
import { PageShell } from "@/components/Site";

const useCases = [
  ["Business", "Build balanced project teams with clear roles and shared goals.", "💼"],
  ["Friendship", "Create compatible local groups around interests and availability.", "🤝"],
  ["Sports", "Form fair, practical teams around ability and commitment.", "⚽"],
  ["Education", "Create study groups with complementary strengths.", "🎓"],
  ["Events", "Design better networking groups and breakout teams.", "🎟️"],
  ["Community", "Bring volunteers together around skills and purpose.", "🌍"],
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="v2-home-hero">
        <div className="container v2-home-grid">
          <div>
            <span className="eyebrow">AI team intelligence platform</span>
            <h1>Build better teams.<br /><span>Faster. Smarter. Together.</span></h1>
            <p>
              AutoTeams combines Gemini-powered profile intelligence with
              explainable matching to help people create trusted, balanced and
              high-performing teams.
            </p>
            <div className="actions">
              <Link className="button" href="/teamguide">Talk to TeamGuide</Link>
              <Link className="button secondary" href="/team-designer">Design a Team</Link>
            </div>
            <div className="v2-trust-row">
              <span>✓ Privacy by design</span>
              <span>✓ Explainable recommendations</span>
              <span>✓ Human review retained</span>
            </div>
          </div>
          <div className="v2-hero-visual">
            <div className="v2-orbit orbit-one" />
            <div className="v2-orbit orbit-two" />
            <div className="v2-hero-robot">
              <div className="v2-bot-head"><span /><span /><i /></div>
              <div className="v2-bot-body">⌁</div>
            </div>
            <div className="floating-card card-one"><strong>92%</strong><span>Team DNA</span></div>
            <div className="floating-card card-two"><strong>86%</strong><span>Match confidence</span></div>
            <div className="floating-card card-three"><strong>6</strong><span>Use cases</span></div>
          </div>
        </div>
      </section>

      <section className="v2-logo-strip">
        <div className="container">
          <span>One engine</span><span>Multiple team contexts</span><span>Explainable AI</span><span>Built for trust</span>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading wide">
            <span className="eyebrow">How AutoTeams works</span>
            <h2>From conversation to a complete team.</h2>
            <p>Use AI to understand people, deterministic logic to form teams and explainability to build trust.</p>
          </div>
          <div className="v2-process-grid">
            {[
              ["01","Understand","TeamGuide turns natural conversation into structured Team DNA."],
              ["02","Design","Define the purpose, team size, roles and practical constraints."],
              ["03","Match","Score goals, availability, interests, trust and complementary strengths."],
              ["04","Explain","Show why the team works and where human review is needed."],
            ].map(([n,t,x])=>(
              <article className="v2-process-card" key={n}>
                <span>{n}</span><h3>{t}</h3><p>{x}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section v2-alt-section">
        <div className="container">
          <div className="section-heading wide">
            <span className="eyebrow">One platform, many experiences</span>
            <h2>Configure the team model for the outcome.</h2>
          </div>
          <div className="v2-usecase-grid">
            {useCases.map(([title,text,icon])=>(
              <article className="v2-usecase-card" key={title}>
                <span>{icon}</span><h3>{title}</h3><p>{text}</p>
                <Link href="/solutions">Explore →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container v2-cta">
          <div>
            <span className="eyebrow">Ready to build differently?</span>
            <h2>Start with a conversation.</h2>
            <p>TeamGuide will ask a few questions and create your first explainable Team DNA profile.</p>
          </div>
          <Link className="button" href="/teamguide">Meet TeamGuide</Link>
        </div>
      </section>
    </PageShell>
  );
}
