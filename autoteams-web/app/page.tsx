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
    text: "Define the purpose, roles and constraints before creating the composition.",
  },
  {
    icon: "◫",
    title: "Refine on a canvas",
    text: "Add or remove people and see the team assessment update immediately.",
  },
  {
    icon: "◇",
    title: "Explain every outcome",
    text: "Show the strengths, risks and reasons behind each recommendation.",
  },
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="v6-home-hero">
        <div className="container v6-home-layout">
          <div className="v6-home-copy">
            <span className="eyebrow">
              Professional AI team intelligence
            </span>

            <h1>
              Build Better Teams
              <span>Using Explainable AI</span>
            </h1>

            <p>
              AutoTeams combines Gemini AI, explainable Team DNA and
              collaborative design to help organisations and communities build
              balanced, high-performing teams with confidence.
            </p>

            <div className="actions">
              <Link className="button" href="/teamguide">
                Start with TeamGuide
              </Link>

              <Link className="button secondary" href="/team-canvas">
                Explore Team Canvas
              </Link>
            </div>

            <div className="v6-trust-points">
              <span>Explainable recommendations</span>
              <span>Human decisions retained</span>
              <span>Privacy-aware design</span>
            </div>
          </div>

          <div className="v6-product-preview">
            <div className="v6-preview-toolbar">
              <span>
                <i />
                Live team design
              </span>
              <em>92% confidence</em>
            </div>

            <div className="v6-preview-header">
              <div>
                <span className="v6-team-icon">A</span>
                <span>
                  <strong>AI Product Team</strong>
                  <small>Balanced delivery scenario</small>
                </span>
              </div>

              <button type="button">View team</button>
            </div>

            <div className="v6-preview-members">
              {[
                ["Amara", "Product Connector"],
                ["James", "Delivery Builder"],
                ["Maya", "Analytical Challenger"],
                ["Sukh", "Strategic Lead"],
              ].map(([name, role]) => (
                <article key={name}>
                  <span>{name.charAt(0)}</span>
                  <div>
                    <strong>{name}</strong>
                    <small>{role}</small>
                  </div>
                  <em>✓</em>
                </article>
              ))}
            </div>

            <div className="v6-preview-metrics">
              <div>
                <span>Collaboration</span>
                <strong>91%</strong>
              </div>
              <div>
                <span>Leadership</span>
                <strong>88%</strong>
              </div>
              <div>
                <span>Conflict risk</span>
                <strong>Low</strong>
              </div>
            </div>

            <div className="v6-preview-insight">
              <span>✦</span>
              <p>
                <strong>Strong collaboration coverage.</strong>
                Add a creative specialist when innovation becomes the main
                priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="v6-capabilities">
        <div className="container">
          <div className="v6-section-heading">
            <span className="eyebrow">One connected workflow</span>
            <h2>Move from individual insight to a complete team.</h2>
            <p>
              Every stage uses the same profile, matching and explainability
              model.
            </p>
          </div>

          <div className="v6-capability-grid">
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

      <section className="v6-home-cta">
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
