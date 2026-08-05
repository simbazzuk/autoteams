import Link from "next/link";
import { PageShell } from "@/components/Site";
import { AtlasOrb } from "@/components/AtlasOrb";

const benefits = [
  {
    icon: "∞",
    title: "Free Pro Access",
    text: "Unlimited access to premium AutoTeams features during Beta.",
  },
  {
    icon: "◇",
    title: "Influence the Roadmap",
    text: "Help prioritise the capabilities that matter most to real teams.",
  },
  {
    icon: "✦",
    title: "Early Feature Access",
    text: "Test new Atlas, Team DNA and collaboration features first.",
  },
  {
    icon: "★",
    title: "Founding Member Badge",
    text: "Receive exclusive recognition inside your AutoTeams account.",
  },
  {
    icon: "◉",
    title: "Private Feedback Community",
    text: "Share ideas directly and help guide future product releases.",
  },
  {
    icon: "↗",
    title: "Launch Benefits",
    text: "Receive preferred pricing when paid plans are introduced.",
  },
];

const roadmap = [
  ["Now", "Community Edition", "Free early access and product validation"],
  ["Next", "Pro Features", "Advanced reports, exports and richer matching"],
  ["Later", "Organisation Workspaces", "Shared teams, invitations and history"],
  ["Future", "Team Health", "Trends, coaching and organisation-level insights"],
  ["Launch", "Commercial Release", "Free, Pro and Business plans"],
];

export default function FoundingMembersPage() {
  return (
    <PageShell>
      <section className="founding-hero">
        <div className="container founding-hero-grid">
          <div>
            <span className="eyebrow">AutoTeams Early Access</span>
            <h1>Become a Founding Member.</h1>
            <p>
              Help shape the future of AI team intelligence while receiving
              premium access at no cost during the Beta period.
            </p>
            <div className="actions">
              <Link className="button" href="/signup">Join Free</Link>
              <Link className="button secondary" href="/roadmap">View Roadmap</Link>
            </div>
          </div>

          <div className="founding-atlas-card">
            <AtlasOrb size="xl" />
            <span className="eyebrow">Powered by Atlas</span>
            <h2>Your feedback will shape the product.</h2>
            <p>
              Founding Members help improve Team DNA, matching, Team Builder,
              Team Canvas and the way Atlas explains recommendations.
            </p>
          </div>
        </div>
      </section>

      <section className="founding-section">
        <div className="container">
          <div className="founding-heading">
            <span className="eyebrow">Why join?</span>
            <h2>More than early access.</h2>
            <p>
              Join a small community helping build a transparent and useful AI
              platform for better team decisions.
            </p>
          </div>

          <div className="founding-benefits-grid">
            {benefits.map((benefit) => (
              <article key={benefit.title}>
                <span>{benefit.icon}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="founding-roadmap-section">
        <div className="container founding-roadmap-grid">
          <div>
            <span className="eyebrow">The journey</span>
            <h2>Help shape what comes next.</h2>
            <p>
              AutoTeams will remain free during early access while the product
              is tested, improved and validated with real users.
            </p>
          </div>

          <div className="founding-timeline">
            {roadmap.map(([stage, title, text]) => (
              <article key={title}>
                <span>{stage}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="founding-cta">
        <div className="container">
          <div>
            <span className="eyebrow">Join the first community</span>
            <h2>Build the future of AutoTeams with us.</h2>
            <p>
              Create a free account, explore Atlas and share your feedback as a
              Founding Member.
            </p>
          </div>
          <Link className="button" href="/signup">Become a Founding Member</Link>
        </div>
      </section>
    </PageShell>
  );
}
