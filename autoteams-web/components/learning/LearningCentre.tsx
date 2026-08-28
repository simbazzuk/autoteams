"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./LearningCentre.module.css";

type TabId = "start" | "playbooks" | "features" | "trust" | "faq";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "start", label: "Getting Started" },
  { id: "playbooks", label: "Playbooks" },
  { id: "features", label: "Feature Guides" },
  { id: "trust", label: "Trust & Privacy" },
  { id: "faq", label: "FAQ" },
];

export function LearningCentre() {
  const [tab, setTab] = useState<TabId>("start");

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">Learning Centre</span>
          <h1>Everything you need to understand TeamScience.ai.</h1>
          <p>
            Start with the core journey, follow a real user story or explore a
            specific feature without searching across several pages.
          </p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <nav className={styles.tabs} aria-label="Learning Centre sections">
            {tabs.map((item) => (
              <button
                className={tab === item.id ? styles.activeTab : ""}
                key={item.id}
                onClick={() => setTab(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {tab === "start" && <GettingStarted />}
          {tab === "playbooks" && <Playbooks />}
          {tab === "features" && <FeatureGuides />}
          {tab === "trust" && <TrustPrivacy />}
          {tab === "faq" && <Faq />}
        </div>
      </section>
    </main>
  );
}

function GettingStarted() {
  const steps = [
    ["01", "Create or join a workspace", "Keep people and recommendations inside the correct boundary.", "/workspaces"],
    ["02", "Create a contextual profile", "Choose Business, Friendship, Community, Sports or Education.", "/profile"],
    ["03", "Complete the Atlas interview", "Answer the core questions once, then add context-specific answers.", "/atlas"],
    ["04", "Review Team DNA", "Check confidence, freshness, strengths and matching consent.", "/team-dna"],
    ["05", "Create a Talent Pool", "Define the eligible population Atlas may consider.", "/talent-pools"],
    ["06", "Build the team", "Describe the purpose, location, size and required capabilities.", "/team-builder"],
    ["07", "Review the recommendation", "Understand every candidate and make the final human decision.", "/matches"],
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <span className="eyebrow">Getting Started</span>
        <h2>The complete journey in seven steps.</h2>
        <p>Complete these steps in order. Each stage prepares the information required by the next.</p>
      </div>

      <div className={styles.steps}>
        {steps.map(([number, title, text, href]) => (
          <Link href={href} key={number}>
            <span>{number}</span>
            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
            <em>Open →</em>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Playbooks() {
  const cards = [
    ["⌂", "Business Team", "Build a balanced delivery team for a cloud migration project."],
    ["♡", "Friendship Group", "Create a compatible group using interests and availability."],
    ["♙", "Community Volunteers", "Organise a dependable volunteer team."],
    ["◎", "Sports Squad", "Build a balanced squad with role coverage."],
    ["▥", "Education Group", "Create a complementary study group."],
    ["◈", "Enterprise Rollout", "Run a controlled organisational pilot."],
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <span className="eyebrow">Playbooks</span>
        <h2>Learn through realistic user stories.</h2>
        <p>Detailed Playbooks include prerequisites, example values, expected results, success criteria and common mistakes.</p>
      </div>

      <div className={styles.cardGrid}>
        {cards.map(([icon, title, text]) => (
          <article key={title}>
            <span>{icon}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <Link className="button" href="/playbooks">Open Detailed Playbooks</Link>
    </section>
  );
}

function FeatureGuides() {
  const guides = [
    ["My Profile", "Create and maintain contextual profiles.", "/profile"],
    ["Atlas Interview", "Understand core and context-specific questions.", "/atlas"],
    ["My Atlas Profile", "Review your individual collaboration profile, confidence and freshness.", "/my-atlas-profile"],
    ["Talent Directory", "Understand who is eligible inside a workspace.", "/talent"],
    ["Talent Pools", "Narrow the population Atlas may consider.", "/talent-pools"],
    ["Recommendation Studio", "Review explanations and live team balance.", "/matches"],
    ["Team DNA", "Review the combined strengths, balance and gaps of a selected team.", "/team-dna"],
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <span className="eyebrow">Feature Guides</span>
        <h2>Understand one feature at a time.</h2>
      </div>

      <div className={styles.featureList}>
        {guides.map(([title, text, href]) => (
          <Link href={href} key={title}>
            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
            <span>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrustPrivacy() {
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <span className="eyebrow">Trust & Privacy</span>
        <h2>Atlas recommends. People decide.</h2>
        <p>TeamScience.ai is designed around workspace boundaries, contextual consent, explainable recommendations and human review.</p>
      </div>

      <div className={styles.cardGrid}>
        <article><span>◇</span><h3>Workspace boundaries</h3><p>Atlas does not recommend someone outside the active workspace.</p></article>
        <article><span>✓</span><h3>Explainable AI</h3><p>Recommendations show signals, reasons and points to consider.</p></article>
        <article><span>♙</span><h3>Human control</h3><p>A person remains responsible for the final decision.</p></article>
      </div>

      <div className="actions">
        <Link className="button" href="/trust-centre">Open Trust Centre</Link>
        <Link className="button secondary" href="/profile/privacy">Profile Privacy</Link>
        <Link className="button secondary" href="/profile/security">Profile Security</Link>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    ["Does Atlas search every registered user?", "No. Atlas only considers eligible people inside the active workspace and selected Talent Pool."],
    ["Are Atlas questions asked every time?", "No. Core questions are reusable. Each contextual profile adds only the relevant context questions."],
    ["Does Atlas make the final decision?", "No. Atlas provides recommendations and explanations. A person makes the final decision."],
    ["Can one person have several profiles?", "Yes. Business, Friendship, Community, Sports and Education profiles remain separate."],
    ["Is the demo connected to Firebase?", "No. The current demo environment uses local browser storage only."],
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <span className="eyebrow">Frequently Asked Questions</span>
        <h2>Common questions from first-time users.</h2>
      </div>

      <div className={styles.faqList}>
        {items.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
