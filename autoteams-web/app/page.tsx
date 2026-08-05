import Link from "next/link";
import { PageShell } from "@/components/Site";
import { AtlasOrb } from "@/components/AtlasOrb";

const capabilities = [
  {
    icon: "✦",
    title: "Understand people",
    text: "Atlas turns natural conversation into an explainable Team DNA profile.",
  },
  {
    icon: "◎",
    title: "Build complete teams",
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
      <section className="v7-home-hero">
        <div className="container v7-home-layout">
          <div className="v7-home-copy">
            <div className="v7-atlas-kicker">
              <AtlasOrb size="md" />
              <span>
                <strong>Meet Atlas</strong>
                <small>Your AI Team Strategist</small>
              </span>
            </div>

            <h1>
              Build Teams That Work
              <span>Every Recommendation Explained</span>
            </h1>

            <p>
              AutoTeams combines Atlas, explainable Team DNA and collaborative
              design to help organisations and communities create balanced,
              high-performing teams with confidence.
            </p>

            <div className="actions">
              <Link className="button" href="/atlas">
                Start with Atlas
              </Link>
              <Link className="button secondary" href="/team-canvas">
                Explore Team Canvas
              </Link>
            </div>

            <div className="v7-trust-points">
              <span>Explainable recommendations</span>
              <span>Human decisions retained</span>
              <span>Privacy-aware design</span>
            </div>
          </div>

          <div className="v7-atlas-preview">
            <div className="v7-orb-stage">
              <AtlasOrb size="xl" state="idle" />
              <div className="v7-orb-copy">
                <span className="eyebrow">Atlas is ready</span>
                <h2>Your AI Team Strategist</h2>
                <p>
                  Create Team DNA, build balanced teams and understand every
                  recommendation.
                </p>
              </div>
            </div>

            <div className="v7-preview-actions">
              <Link href="/atlas">Create Team DNA <span>→</span></Link>
              <Link href="/team-builder">Build a team <span>→</span></Link>
              <Link href="/matches">Compare people <span>→</span></Link>
            </div>

            <div className="v7-preview-insight">
              <span>✦</span>
              <p>
                <strong>Atlas suggestion:</strong> add a creative specialist
                when innovation becomes the main priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="v7-capabilities">
        <div className="container">
          <div className="v7-section-heading">
            <span className="eyebrow">One connected workflow</span>
            <h2>Move from individual insight to a complete team.</h2>
            <p>
              Atlas, Team DNA, Team Builder and Team Canvas all use the same
              profile and explainability model.
            </p>
          </div>

          <div className="v7-capability-grid">
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

      <section className="v7-home-cta">
        <div className="container">
          <div>
            <span className="eyebrow">Start with one conversation</span>
            <h2>Let Atlas create your first Team DNA.</h2>
            <p>
              A short guided conversation is enough to begin building an
              explainable collaboration profile.
            </p>
          </div>
          <Link className="button" href="/atlas">
            Meet Atlas
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
