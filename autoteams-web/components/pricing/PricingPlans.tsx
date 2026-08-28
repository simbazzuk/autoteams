"use client";

import Link from "next/link";
import styles from "./PricingPlans.module.css";

type Plan = {
  id: "free" | "pro" | "organisation";
  name: string;
  audience: string;
  price: string;
  cadence: string;
  badge: string;
  cta: string;
  href: string;
  featured?: boolean;
  summary: string;
  credits: Array<{
    label: string;
    value: string;
    meter?: { used: number; total: number };
  }>;
  included: string[];
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    audience: "For individuals trying AutoTeams",
    price: "£0",
    cadence: "during early access",
    badge: "START HERE",
    cta: "Get Started",
    href: "/get-started",
    summary: "Build your first teams and experience the core Team Science workflow.",
    credits: [
      { label: "Saved team credits", value: "5 credits", meter: { used: 0, total: 5 } },
      { label: "Atlas recommendation credits", value: "10 credits", meter: { used: 0, total: 10 } },
      { label: "Workspaces", value: "1 workspace", meter: { used: 0, total: 1 } },
    ],
    included: [
      "Build teams",
      "Basic Atlas guidance",
      "Basic Team DNA",
      "Team Science Foundations",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    audience: "For people designing teams regularly",
    price: "Planned",
    cadence: "future paid plan",
    badge: "MOST CAPABLE",
    cta: "Join Early Access",
    href: "/get-started",
    featured: true,
    summary: "Remove usage limits and unlock deeper Team Science intelligence.",
    credits: [
      { label: "Saved team credits", value: "Unlimited" },
      { label: "Atlas recommendation credits", value: "Unlimited" },
      { label: "Workspaces", value: "1 workspace", meter: { used: 0, total: 1 } },
    ],
    included: [
      "Compare Teams",
      "What-if analysis",
      "Advanced Atlas",
      "Advanced Team DNA",
      "Team Health",
      "Advanced Academy",
    ],
  },
  {
    id: "organisation",
    name: "Organisation",
    audience: "For teams operating at organisation scale",
    price: "Contact",
    cadence: "planned organisation plan",
    badge: "ORGANISATION",
    cta: "Register Interest",
    href: "/get-started",
    summary: "Apply Team Science across multiple workspaces with governance and analytics.",
    credits: [
      { label: "Saved team credits", value: "Unlimited" },
      { label: "Atlas recommendation credits", value: "Unlimited" },
      { label: "Workspaces", value: "Unlimited" },
    ],
    included: [
      "Everything in Pro",
      "Multiple workspaces",
      "Organisation administration",
      "Role-based governance",
      "Organisation analytics",
      "Learning dashboards",
      "Audit & governance",
    ],
  },
];

const comparisonRows = [
  ["Saved teams", "5 credits", "Unlimited", "Unlimited"],
  ["Atlas recommendations", "10 credits", "Unlimited", "Unlimited"],
  ["Workspaces", "1", "1", "Unlimited"],
  ["Compare Teams", "Locked", "Included", "Included"],
  ["What-if analysis", "Locked", "Included", "Included"],
  ["Advanced Atlas", "Locked", "Included", "Included"],
  ["Advanced Team DNA", "Locked", "Included", "Included"],
  ["Team Health", "Locked", "Included", "Included"],
  ["Organisation analytics", "Locked", "Locked", "Included"],
  ["Governance & audit", "Locked", "Locked", "Included"],
];

export function PricingPlans() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>PRICING & CREDITS</span>
        <h1>Start free. Upgrade when you need more Team Science intelligence.</h1>
        <p>
          Pick the plan that matches how often you build teams. Credits make the
          Free plan limits clear, while Pro and Organisation remove the main usage limits.
        </p>
        <strong>No payment is required during early access.</strong>
      </section>

      <section className={styles.plans}>
        {plans.map((plan) => (
          <article
            className={`${styles.plan} ${plan.featured ? styles.featured : ""}`}
            key={plan.id}
          >
            <div className={styles.planTop}>
              <span className={styles.badge}>{plan.badge}</span>
              <h2>{plan.name}</h2>
              <p>{plan.audience}</p>
            </div>

            <div className={styles.price}>
              <strong>{plan.price}</strong>
              <span>{plan.cadence}</span>
            </div>

            <p className={styles.summary}>{plan.summary}</p>

            <div className={styles.creditPanel}>
              <span className={styles.creditHeading}>CREDITS & LIMITS</span>
              {plan.credits.map((credit) => (
                <CreditRow
                  key={credit.label}
                  label={credit.label}
                  value={credit.value}
                  meter={credit.meter}
                />
              ))}
            </div>

            <div className={styles.included}>
              <span>INCLUDED</span>
              <ul>
                {plan.included.map((feature) => (
                  <li key={feature}>
                    <i aria-hidden="true">✓</i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={plan.href}
              className={plan.featured ? styles.primaryButton : styles.button}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className={styles.comparison}>
        <div className={styles.sectionHeading}>
          <span>QUICK COMPARISON</span>
          <h2>See the important differences at a glance.</h2>
          <p>
            Credits are consumed only where a usage limit exists. “Included” means
            the capability is available without a separate credit counter.
          </p>
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Organisation</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${index}`}
                      className={
                        cell === "Locked"
                          ? styles.locked
                          : cell === "Included" || cell === "Unlimited"
                            ? styles.positive
                            : undefined
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className={styles.faq}>
        <summary>How do credits work?</summary>
        <div>
          <p>
            A saved team uses one saved-team credit. A successful Atlas team
            recommendation uses one recommendation credit. Workspace limits are
            counted by the number of workspaces you create.
          </p>
          <p>
            Pro removes the saved-team and recommendation limits. Organisation
            additionally removes the workspace limit and unlocks organisation-scale
            administration, analytics and governance.
          </p>
        </div>
      </details>

      <p className={styles.disclaimer}>
        Early-access plans, prices and limits may change as AutoTeams develops.
      </p>
    </main>
  );
}

function CreditRow({
  label,
  value,
  meter,
}: {
  label: string;
  value: string;
  meter?: { used: number; total: number };
}) {
  return (
    <div className={styles.creditRow}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      {meter ? (
        <div className={styles.meter} aria-label={`${meter.total} available`}>
          {Array.from({ length: meter.total }).map((_, index) => (
            <i key={index} className={index < meter.used ? styles.used : ""} />
          ))}
        </div>
      ) : (
        <span className={styles.unlimited}>No credit limit</span>
      )}
    </div>
  );
}
