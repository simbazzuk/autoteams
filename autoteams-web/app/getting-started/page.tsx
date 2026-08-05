import Link from "next/link";
import { PageShell } from "@/components/Site";
import { AtlasOrb } from "@/components/AtlasOrb";
import "./getting-started.css";

const steps = [
  {
    number: "01",
    icon: "✦",
    title: "Meet Atlas",
    time: "2 minutes",
    description:
      "Start a guided conversation with Atlas. It will learn how you communicate, collaborate and contribute within a team.",
    outcome: "Your collaboration journey begins",
    href: "/atlas",
    action: "Start with Atlas",
  },
  {
    number: "02",
    icon: "◌",
    title: "Create Team DNA",
    time: "3 minutes",
    description:
      "Turn your answers into an explainable Team DNA profile covering collaboration, leadership, planning, creativity and communication.",
    outcome: "An explainable Team DNA profile",
    href: "/team-dna",
    action: "Create Team DNA",
  },
  {
    number: "03",
    icon: "◎",
    title: "Build Your Team",
    time: "2 minutes",
    description:
      "Use Team DNA profiles to create a balanced team based on complementary strengths and the outcome you want to achieve.",
    outcome: "Your first recommended team",
    href: "/team-builder",
    action: "Build a Team",
  },
  {
    number: "04",
    icon: "◇",
    title: "Review Recommendations",
    time: "2 minutes",
    description:
      "Review the reasons behind each recommendation, including strengths, possible gaps, leadership coverage and collaboration risks.",
    outcome: "A clear explanation of the recommendation",
    href: "/insights",
    action: "View Insights",
  },
  {
    number: "05",
    icon: "◫",
    title: "Save and Improve",
    time: "1 minute",
    description:
      "Open the Team Canvas, refine the composition and continue improving the team as more Team DNA profiles are created.",
    outcome: "A team you can revisit and refine",
    href: "/team-canvas",
    action: "Open Team Canvas",
  },
];

const faqs = [
  {
    question: "What is Team DNA?",
    answer:
      "Team DNA describes how someone naturally communicates, collaborates, plans and contributes within a team. It is not a technical skills assessment.",
  },
  {
    question: "Does Atlas make the final decision?",
    answer:
      "No. Atlas provides transparent recommendations to support human judgement. The final team decision always remains with you.",
  },
  {
    question: "Can Team DNA be updated?",
    answer:
      "Yes. Team DNA can be refreshed as people develop, roles change or new information becomes available.",
  },
  {
    question: "How long does the first journey take?",
    answer:
      "Most users can create their first Team DNA and build an initial team in around 10 to 15 minutes.",
  },
];

export default function GettingStartedPage() {
  return (
    <PageShell>
      <section className="gs-page">
        <div className="gs-container">
          <section className="gs-hero">
            <div className="gs-hero-copy">
              <span className="gs-pill">Getting Started</span>
              <h1>Build Teams That Work</h1>
              <h2>Powered by Atlas</h2>
              <p className="gs-lead">
                AutoTeams guides you through a clear five-step process to create
                Team DNA, build balanced teams and understand every recommendation.
              </p>

              <div className="gs-actions">
                <Link className="gs-button gs-button-primary" href="/atlas">
                  Start the Journey
                </Link>
                <Link className="gs-button gs-button-secondary" href="/dashboard">
                  Go to Dashboard
                </Link>
              </div>

              <div className="gs-meta">
                <span>Estimated time: 10–15 minutes</span>
                <span>5 guided steps</span>
                <span>Human decisions retained</span>
              </div>
            </div>

            <aside className="gs-atlas-card">
              <AtlasOrb size="xl" />
              <span className="gs-eyebrow">Atlas</span>
              <h3>Your AI Team Strategist</h3>
              <p>
                Atlas guides each stage, explains the recommendations and helps
                you understand what to do next.
              </p>
            </aside>
          </section>

          <section className="gs-flow-section">
            <div className="gs-section-heading">
              <span className="gs-eyebrow">The AutoTeams Journey</span>
              <h2>Follow the process in sequence.</h2>
              <p>
                Each step builds on the previous one, so new users always know
                where to start and what outcome to expect.
              </p>
            </div>

            <div className="gs-flow" aria-label="AutoTeams journey">
              {steps.map((step, index) => (
                <div className="gs-flow-item" key={step.number}>
                  <span>{step.number}</span>
                  <strong>{step.title}</strong>
                  {index < steps.length - 1 && <i aria-hidden="true">→</i>}
                </div>
              ))}
            </div>
          </section>

          <section className="gs-steps-grid">
            {steps.map((step) => (
              <article className="gs-step-card" key={step.number}>
                <div className="gs-step-top">
                  <span className="gs-step-icon">{step.icon}</span>
                  <span className="gs-step-number">{step.number}</span>
                </div>

                <div className="gs-step-title-row">
                  <h3>{step.title}</h3>
                  <span>{step.time}</span>
                </div>

                <p>{step.description}</p>

                <div className="gs-outcome">
                  <strong>Outcome</strong>
                  <span>{step.outcome}</span>
                </div>

                <Link className="gs-card-link" href={step.href}>
                  {step.action}
                  <span>→</span>
                </Link>
              </article>
            ))}
          </section>

          <section className="gs-value-section">
            <div className="gs-section-heading">
              <span className="gs-eyebrow">Why AutoTeams?</span>
              <h2>Designed to support better team decisions.</h2>
            </div>

            <div className="gs-value-grid">
              <article>
                <span>✦</span>
                <h3>Explainable AI</h3>
                <p>Understand the reasoning behind every recommendation.</p>
              </article>
              <article>
                <span>◌</span>
                <h3>Team DNA</h3>
                <p>Understand how people naturally work and collaborate.</p>
              </article>
              <article>
                <span>◎</span>
                <h3>Balanced Teams</h3>
                <p>Build around complementary strengths rather than similarity.</p>
              </article>
              <article>
                <span>◇</span>
                <h3>Human Control</h3>
                <p>Atlas supports decisions but never replaces human judgement.</p>
              </article>
            </div>
          </section>

          <section className="gs-faq-section">
            <div className="gs-section-heading">
              <span className="gs-eyebrow">Common Questions</span>
              <h2>Before you begin.</h2>
            </div>

            <div className="gs-faq-grid">
              {faqs.map((faq) => (
                <article key={faq.question}>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="gs-cta">
            <div>
              <span className="gs-eyebrow">Ready to begin?</span>
              <h2>Build your first team with Atlas.</h2>
              <p>Start with a short conversation and follow the guided process.</p>
            </div>
            <Link className="gs-button gs-button-light" href="/atlas">
              Start with Atlas
            </Link>
          </section>
        </div>
      </section>
    </PageShell>
  );
}
