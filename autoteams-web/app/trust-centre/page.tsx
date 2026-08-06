import Link from "next/link";
import { PageShell } from "@/components/Site";
import {
  TrustCard,
  TrustHero,
  TrustSectionHeading,
  TrustTimeline,
} from "@/components/trust/TrustComponents";

const pillars = [
  {
    icon: "◇",
    title: "Privacy by design",
    text: "Collect only the information needed for a clear workspace or team purpose.",
    href: "/privacy",
  },
  {
    icon: "✦",
    title: "Explainable AI",
    text: "Show the signals, scores and reasoning behind every Atlas recommendation.",
    href: "/why-this-team",
  },
  {
    icon: "♙",
    title: "Human control",
    text: "Authorised users can review, adjust or reject any suggested team outcome.",
    href: "/getting-started",
  },
  {
    icon: "✓",
    title: "Appropriate verification",
    text: "Apply email verification and stronger security according to role and risk.",
    href: "/security",
  },
];

const process = [
  {
    number: "01",
    title: "Register and verify",
    text: "Users create an account, verify their email and review security settings.",
  },
  {
    number: "02",
    title: "Join a private workspace",
    text: "Access is controlled through workspace membership and assigned roles.",
  },
  {
    number: "03",
    title: "Provide explicit consent",
    text: "Members choose whether Team DNA may be visible, matched or used in insights.",
  },
  {
    number: "04",
    title: "Build from eligible Talent",
    text: "Atlas only evaluates people inside the active workspace and selected population.",
  },
  {
    number: "05",
    title: "Explain the recommendation",
    text: "Every result shows the balance, strengths, gaps and reasons behind the selection.",
  },
  {
    number: "06",
    title: "Keep a human decision",
    text: "The user remains responsible for accepting, changing or rejecting the result.",
  },
];

export default function TrustCentrePage() {
  return (
    <PageShell>
      <main className="trust12-page">
        <TrustHero
          eyebrow="Trust Centre"
          title="Trust is part of the product."
          text="AutoTeams combines privacy controls, secure workspace boundaries, explainable AI and human review so team recommendations remain transparent and accountable."
          primaryHref="/privacy"
          primaryLabel="View Privacy Centre"
          secondaryHref="/security"
          secondaryLabel="Review Security"
        />

        <section className="trust12-section">
          <div className="container">
            <TrustSectionHeading
              eyebrow="Four trust pillars"
              title="Designed for responsible team decisions."
              text="Trust is not a separate policy page. It is built into how users register, join workspaces, share Team DNA and review Atlas recommendations."
            />

            <div className="trust12-card-grid">
              {pillars.map((pillar) => (
                <TrustCard key={pillar.title} {...pillar} />
              ))}
            </div>
          </div>
        </section>

        <section className="trust12-section trust12-section-alt">
          <div className="container trust12-process-grid">
            <div>
              <TrustSectionHeading
                eyebrow="Trust architecture"
                title="How information moves through AutoTeams."
                text="The process keeps data inside the correct workspace and ensures users understand what happens at every stage."
              />

              <div className="trust12-architecture-note">
                <span>◇</span>
                <div>
                  <strong>Private workspace boundary</strong>
                  <p>
                    AutoTeams never searches all registered users. Atlas only
                    evaluates eligible Talent inside the active workspace.
                  </p>
                </div>
              </div>
            </div>

            <TrustTimeline items={process} />
          </div>
        </section>

        <section className="trust12-section">
          <div className="container trust12-promise">
            <div>
              <span className="eyebrow">The Atlas Promise</span>
              <h2>What Atlas will and will not do.</h2>
              <p>
                Atlas is designed to support people making team decisions, not
                to make hidden or irreversible decisions about them.
              </p>
            </div>

            <div className="trust12-promise-grid">
              {[
                "Explain every recommendation",
                "Keep a human in control",
                "Stay inside the active workspace",
                "Respect Team DNA consent",
                "Avoid inferring sensitive characteristics",
                "Allow users to export or remove their profile",
              ].map((item) => (
                <div key={item}>
                  <span>✓</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="trust12-cta">
          <div className="container">
            <div>
              <span className="eyebrow">Your controls</span>
              <h2>Review privacy, consent and account security.</h2>
              <p>
                Manage the information Atlas can use and understand the controls
                available to workspace members.
              </p>
            </div>

            <div className="actions">
              <Link className="button" href="/privacy">
                Privacy Centre
              </Link>
              <Link className="button secondary" href="/security">
                Security Centre
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
