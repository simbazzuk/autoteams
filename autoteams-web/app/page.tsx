import Link from "next/link";
import { PageShell } from "@/components/Site";

const capabilities = [
  {
    icon: "✦",
    title: "Understand people",
    text: "TeamGuide turns natural conversation into an explainable Team DNA profile.",
  },
  {
    icon: "◎",
    title: "Design complete teams",
    text: "Set the purpose, roles and constraints before creating a balanced composition.",
  },
  {
    icon: "◫",
    title: "Refine on a canvas",
    text: "Add or remove people and see the team assessment update as the composition changes.",
  },
  {
    icon: "◇",
    title: "Explain every outcome",
    text: "Show the reasons, strengths and risks behind recommendations.",
  },
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="v4-home-hero">
        <div className="container v4-home-layout">
          <div className="v4-home-copy">
            <span className="eyebrow">Professional AI team intelligence</span>
            <h1>
              Build better teams.
              <span>With clarity, not guesswork.</span>
            </h1>
            <p>
              AutoTeams combines Gemini profile intelligence with transparent
              team design and matching logic for business, friendship, sport,
              education, events and community.
            </p>
            <div className="actions">
              <Link className="button" href="/teamguide">
                Start with TeamGuide
              </Link>
              <Link className="button secondary" href="/team-canvas">
                Open Team Canvas
              </Link>
            </div>
            <div className="v4-home-proof">
              <span>Explainable recommendations</span>
              <span>Human review retained</span>
              <span>Privacy-aware design</span>
            </div>
          </div>

          <div className="v4-product-preview">
            <div className="v4-preview-top">
              <span className="v4-preview-avatar">A</span>
              <span>
                <strong>AI Product Team</strong>
                <small>Balanced delivery scenario</small>
              </span>
              <em>92% confidence</em>
            </div>

            <div className="v4-preview-members">
              {["Amara", "James", "Maya", "Sukh"].map((name, index) => (
                <div key={name}>
                  <span>{name.charAt(0)}</span>
                  <strong>{name}</strong>
                  <small>
                    {["Product Connector", "Delivery Builder", "Analytical Challenger", "Strategic Lead"][index]}
                  </small>
                </div>
              ))}
            </div>

            <div className="v4-preview-insight">
              <span>✦</span>
              <p>
                <strong>Strong collaboration coverage.</strong>
                Add a creative specialist if innovation is the main priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="v4-capability-section">
        <div className="container">
          <div className="v4-section-heading">
            <span className="eyebrow">One connected workflow</span>
            <h2>Move from individual insight to a complete team.</h2>
            <p>
              Every stage uses the same profile, matching and explainability
              model.
            </p>
          </div>

          <div className="v4-capability-grid">
            {capabilities.map((capability) => (
              <article key={capability.title}>
                <span>{capability.icon}</span>
                <h3>{capability.title}</h3>
                <p>{capability.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-home-cta">
        <div className="container">
          <div>
            <span className="eyebrow">Start with one profile</span>
            <h2>Create your first Team DNA.</h2>
            <p>
              A short guided conversation is enough to begin building an
              explainable collaboration profile.
            </p>
          </div>
          <Link className="button" href="/teamguide">
            Meet TeamGuide
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
