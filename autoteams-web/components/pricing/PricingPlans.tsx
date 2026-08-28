import Link from "next/link";
import styles from "./PricingPlans.module.css";

const plans = [
  {
    name: "Free",
    audience: "Individuals, communities and occasional team builders",
    price: "£0",
    cadence: "forever",
    description:
      "Discover Team Science, create teams and experience explainable AI without a subscription.",
    cta: "Get Started",
    href: "/get-started",
    featured: false,
    badge: "AVAILABLE",
    features: [
      "People profiles",
      "Team Builder",
      "Context-aware skill suggestions",
      "Basic Atlas support",
      "Basic Team DNA",
      "Team Science Foundations",
      "Limited saved teams",
      "Limited team recommendations",
    ],
  },
  {
    name: "Pro",
    audience: "Team leaders, coaches and regular AutoTeams users",
    price: "From £12.99",
    cadence: "per month",
    description:
      "Go beyond building a team. Compare, model, understand and continuously improve how your teams work.",
    cta: "Join Early Access",
    href: "/get-started",
    featured: true,
    badge: "PLANNED",
    features: [
      "Everything in Free",
      "Unlimited team building",
      "Advanced Team DNA",
      "Compare alternative teams",
      "What-if team modelling",
      "Advanced Atlas Intelligence",
      "Advanced Team Health",
      "Full Team Science Academy",
      "Assessments & certificates",
      "Team Science reports",
      "Recommendation history",
    ],
  },
  {
    name: "Business",
    audience: "Organisations applying Team Science at scale",
    price: "Contact us",
    cadence: "future organisation plans",
    description:
      "Bring AutoTeams, Atlas and Team Science learning to teams across your organisation.",
    cta: "Register Interest",
    href: "/get-started",
    featured: false,
    badge: "PLANNED",
    features: [
      "Everything in Pro",
      "Multiple workspaces",
      "Organisation administration",
      "Role-based governance",
      "Organisation Team Science analytics",
      "Academy learning programmes",
      "Team learning dashboards",
      "Audit & governance capabilities",
      "Enterprise integration roadmap",
    ],
  },
];

const proHighlights = [
  {
    icon: "⇄",
    title: "Compare Teams",
    text: "Compare alternative team compositions and understand the trade-offs behind each option.",
  },
  {
    icon: "◈",
    title: "What-if Analysis",
    text: "Explore how changing a person, strength or requirement could affect overall team balance.",
  },
  {
    icon: "✦",
    title: "Advanced Atlas",
    text: "Ask deeper questions about recommendations, gaps, risks and why one team may fit better than another.",
  },
  {
    icon: "♡",
    title: "Team Health",
    text: "Move beyond team formation and understand how team health and capability evolve over time.",
  },
];

export function PricingPlans() {
  return (
    <main className={styles.page}>

      
      <section className={styles.hero}>
        <span className={styles.eyebrow}>PRICING & PLANS</span>
        <h1>Start free. Upgrade when your teams need more intelligence.</h1>
        <p>
          TeamScience.ai is currently in early access. Core Team Science capabilities
          remain free while we develop our future Pro and Business plans.
        </p>
        <strong>No payment is required today.</strong>
      </section>

      <section className={styles.plans}>
        {plans.map((plan) => (
          <article
            className={`${styles.plan} ${plan.featured ? styles.featured : ""}`}
            key={plan.name}
          >
            {plan.featured && <div className={styles.popular}>FUTURE PRO</div>}

            <div className={styles.planHeading}>
              <span className={styles.badge}>{plan.badge}</span>
              <h2>{plan.name}</h2>
              <p>{plan.audience}</p>
            </div>

            <div className={styles.price}>
              <strong>{plan.price}</strong>
              <span>{plan.cadence}</span>
            </div>

            <p className={styles.description}>{plan.description}</p>

            <Link
              className={plan.featured ? styles.primaryButton : styles.button}
              href={plan.href}
            >
              {plan.cta}
            </Link>

            <div className={styles.divider} />

            <strong className={styles.includes}>WHAT&apos;S INCLUDED</strong>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <p className={styles.disclaimer}>
        * Indicative future pricing only. Plans, prices and included capabilities
        may change during early access as AutoTeams develops with user feedback.
      </p>

      {/* AUTO_TEAMS_V7155_PRICING */}
      <section className={styles.commercialExplainer}>
        <div className={styles.sectionHeading}>
          <span>CREDITS &amp; ACCESS</span>
          <h2>Simple usage. Clear responsibilities.</h2>
          <p>AutoTeams separates everyday workspace activity from Atlas-powered intelligence. Roles control what people can manage; credits are used when Atlas performs AI-powered analysis.</p>
        </div>
        <div className={styles.explainerGrid}>
          <article className={styles.creditCard}>
            <div className={styles.explainerTitle}><span className={styles.explainerIcon}>✦</span><div><small>ATLAS CREDITS</small><h3>Use credits when Atlas does the thinking.</h3></div></div>
            <p>Everyday profile, invitation and workspace activity does not use credits. Credits are reserved for AI-powered recommendations and analysis, making usage easier to understand and manage.</p>
            <div className={styles.usageList}>
              <div><span>Create or update a profile</span><strong>NO CREDITS</strong></div>
              <div><span>Invite people &amp; manage members</span><strong>NO CREDITS</strong></div>
              <div><span>Build or view saved teams</span><strong>NO CREDITS</strong></div>
              <div className={styles.creditUse}><span>Generate an Atlas recommendation</span><strong>USES CREDITS</strong></div>
              <div className={styles.creditUse}><span>Refresh Atlas analysis</span><strong>USES CREDITS</strong></div>
              <div className={styles.creditUse}><span>Generate Atlas Team Insights</span><strong>USES CREDITS</strong></div>
            </div>
            <div className={styles.workspaceCreditNote}><strong>Workspace credits</strong><span>Planned paid-plan credits are shared at workspace level rather than allocated to individual members.</span></div>
          </article>
          <article className={styles.roleCard}>
            <div className={styles.explainerTitle}><span className={styles.explainerIcon}>◎</span><div><small>USER ROLES</small><h3>Give people the access they need.</h3></div></div>
            <p>Workspace roles define what a person can manage in AutoTeams. They are separate from the profile information Atlas uses for team recommendations.</p>
            <div className={styles.roleList}>
              <div><span className={styles.roleBadge}>ADMINISTRATOR</span><strong>Manage the workspace</strong><p>Manage members, invitations, permissions and workspace settings, and build and manage teams.</p></div>
              <div><span className={styles.roleBadge}>TEAM LEADER</span><strong>Build and understand teams</strong><p>Build teams, use Atlas recommendations and review Team Insights for people available to their workspace.</p></div>
              <div><span className={styles.roleBadge}>MEMBER</span><strong>Participate and maintain a profile</strong><p>Maintain personal profiles and Atlas information, participate in teams and control profile information used for matching.</p></div>
            </div>
          </article>
        </div>
        <div className={styles.accessPrinciple}><span>ROLE</span><strong>What can I manage?</strong><b>+</b><span>CREDITS</span><strong>How much Atlas intelligence can the workspace use?</strong></div>
        <p className={styles.creditsDisclaimer}>Credit quantities and paid-plan allowances are not yet final and may change during early access. Current early-access usage remains subject to the free-plan Atlas AI allowance.</p>
      </section>
      <section className={styles.proSection}>
        <div className={styles.sectionHeading}>
          <span>WHY PRO?</span>
          <h2>Move from building teams to designing them.</h2>
          <p>
            TeamScience.ai Pro is planned around deeper Team Science intelligence,
            rather than simply placing ordinary product features behind a paywall.
          </p>
        </div>

        <div className={styles.highlightGrid}>
          {proHighlights.map((item) => (
            <article key={item.title}>
              <span>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.academy}>
        <div>
          <span>TEAM SCIENCE ACADEMY</span>
          <h2>Learn the science behind better teams.</h2>
          <p>
            Team Science Foundations remains part of the free learning experience.
            Future advanced courses, professional learning and practitioner
            certification may form part of Pro and organisation plans.
          </p>
        </div>

        <div className={styles.academyOptions}>
          <div>
            <small>FREE</small>
            <strong>Team Science Foundations</strong>
            <span>Learn the core principles.</span>
          </div>
          <div>
            <small>PLANNED</small>
            <strong>Advanced Academy</strong>
            <span>Deeper courses and certificates.</span>
          </div>
          <div>
            <small>FUTURE</small>
            <strong>Team Science Practitioner</strong>
            <span>Professional learning pathway.</span>
          </div>
        </div>

        <Link href="/academy">Explore Team Science Academy →</Link>
      </section>

      <section className={styles.founding}>
        <div>
          <span>EARLY ACCESS</span>
          <h2>Help shape TeamScience.ai.</h2>
          <p>
            AutoTeams is being developed with early users. Founding members can
            explore new capabilities as they are introduced and help influence
            the future product and pricing model.
          </p>
        </div>

        <Link href="/get-started">Join as a Founding Member →</Link>
      </section>

      <section className={styles.philosophy}>
        <div>
          <strong>FREE</strong>
          <span>Build a team.</span>
        </div>
        <b>→</b>
        <div>
          <strong>PRO</strong>
          <span>Understand, compare and improve your teams.</span>
        </div>
        <b>→</b>
        <div>
          <strong>BUSINESS</strong>
          <span>Apply Team Science across an organisation.</span>
        </div>
      </section>
    </main>
  );
}
