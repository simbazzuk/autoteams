import Link from "next/link";
import { PageShell } from "@/components/Site";
import { AtlasOrb } from "@/components/AtlasOrb";

export default function AboutPage() {
  return (
    <PageShell>
      <section className="about-hero">
        <div className="container about-hero-grid">
          <div>
            <span className="eyebrow">About AutoTeams</span>
            <h1>Helping people build stronger teams.</h1>
            <p>
              AutoTeams was created to make team decisions clearer, more
              transparent and easier to review.
            </p>
          </div>
          <AtlasOrb size="xl" />
        </div>
      </section>

      <section className="about-section">
        <div className="container about-content-grid">
          <article>
            <span>01</span>
            <h2>The problem</h2>
            <p>
              Teams are often created using incomplete information, personal
              judgement and unclear criteria. This can make decisions difficult
              to explain and repeat.
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>The idea</h2>
            <p>
              AutoTeams combines guided conversations, Team DNA and transparent
              matching logic so users can understand how each recommendation was
              formed.
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>The role of Atlas</h2>
            <p>
              Atlas is the AI Team Strategist. It helps users create profiles,
              build teams, compare people and review strengths and risks.
            </p>
          </article>
          <article>
            <span>04</span>
            <h2>Human decisions</h2>
            <p>
              AutoTeams is designed to support human judgement, not replace it.
              Recommendations should always be reviewed in context.
            </p>
          </article>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <div>
            <span className="eyebrow">Help shape the product</span>
            <h2>Join the Founding Members programme.</h2>
          </div>
          <Link className="button" href="/founding-members">Learn more</Link>
        </div>
      </section>
    </PageShell>
  );
}
