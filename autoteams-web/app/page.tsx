import Link from "next/link";
import { PageShell } from "@/components/Site";

const solutions = [
  ["🤝", "Consumer", "Friendship groups, travel circles and local communities."],
  ["💼", "Enterprise", "Project teams, onboarding cohorts and innovation squads."],
  ["🎓", "Education", "Study teams, project groups and peer support."],
  ["⚽", "Sports", "Balanced teams based on ability and availability."],
  ["🎟️", "Events", "Networking groups, tables and breakout teams."],
  ["🌍", "Community", "Volunteer groups matched around skills and causes."],
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">AI team formation platform</span>
            <h1>Better people.<br /><span className="gradient">Better teams.</span></h1>
            <p className="lead">AutoTeams uses AI to understand people, purpose and context, then forms compatible teams for life, work and community.</p>
            <div className="actions">
              <Link className="button" href="/teamguide">Talk to TeamGuide</Link>
              <Link className="button secondary" href="/team-designer">Design a Team</Link>
            </div>
            <div className="chips">
              <Link className="chip" href="/trust-centre">Privacy by design</Link>
              <Link className="chip" href="/why-this-team">Explainable matching</Link>
              <Link className="chip" href="/solutions">Multiple use cases</Link>
            </div>
          </div>
          <div className="dark-panel">
            {[
              ["1. Understand people", "Personality, skills, interests, goals and availability"],
              ["2. Apply context", "Friendship, business, sports, events or education"],
              ["3. Optimise the group", "Compatibility, diversity, balance and constraints"],
              ["4. Explain the result", "Team DNA, confidence and rationale"],
            ].map(([title, text], index) => (
              <div key={title}>
                <div className="flow-node"><strong>{title}</strong><span>{text}</span></div>
                {index < 3 && <div className="flow-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container stats">
          {[
            ["1", "Reusable team engine"], ["6+", "Supported use cases"],
            ["4", "Configurable trust levels"], ["100%", "Explainable recommendations"],
          ].map(([value, label]) => <div className="card stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">One platform, many solutions</span>
            <h2>Form the right team for any situation.</h2>
            <p>The same engine can be configured for different team purposes.</p>
          </div>
          <div className="solution-grid">
            {solutions.map(([icon, title, text]) => (
              <Link className="card solution-card" href="/solutions" key={title}>
                <span className="icon">{icon}</span><h3>{title}</h3><p>{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container feature-grid">
          <div>
            <span className="eyebrow">Privacy by design</span>
            <h2>AI should understand people, not expose them.</h2>
            <p className="lead">AutoTeams separates identity data from matching data wherever possible and applies configurable trust controls.</p>
            <Link className="button" href="/trust-centre">Explore the Trust Centre</Link>
          </div>
          <div className="dark-panel">
            <div className="flow-node"><strong>Identity Service</strong><span>Name, email and verification result</span></div>
            <div className="flow-line" />
            <div className="flow-node"><strong>Pseudonymised Profile</strong><span>Internal reference and matching features</span></div>
            <div className="flow-line" />
            <div className="flow-node"><strong>AI Team Intelligence</strong><span>Matching without unnecessary identity exposure</span></div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
