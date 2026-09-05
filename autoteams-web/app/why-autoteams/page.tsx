import Link from "next/link";
import { PageShell } from "@/components/Site";
import styles from "./why-autoteams.module.css";

const principles = [
  {
    number: "01",
    title: "Teams are more than skills",
    text: "Skills matter, but so do working styles, strengths, motivations, interests and the way people complement one another.",
  },
  {
    number: "02",
    title: "Explain the recommendation",
    text: "Atlas is designed to show why people may work well together, rather than presenting team recommendations as a black box.",
  },
  {
    number: "03",
    title: "Help people make the decision",
    text: "AutoTeams provides team intelligence to support human judgement. The final decision about a team always belongs to people.",
  },
];

const contexts = ["Business", "Friendship", "Community", "Sports", "Education"];

export default function WhyAutoTeamsPage() {
  return (
    <PageShell>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.eyebrow}>WHY AUTOTEAMS?</div>
          <h1>
            Finding people is easy.
            <span> Finding the right combination is harder.</span>
          </h1>
          <p className={styles.lead}>
            AutoTeams was created around a simple question: why do we spend so
            much time deciding what a team should deliver, but so little time
            understanding who should be in that team?
          </p>
          <div className={styles.heroActions}>
            <Link className="button" href="/team-builder">
              Build a team
            </Link>
            <Link className={styles.secondaryButton} href="/feedback">
              Share your idea
            </Link>
          </div>
        </section>

        <section className={styles.problem}>
          <div>
            <div className={styles.sectionLabel}>THE PROBLEM</div>
            <h2>Most teams start with availability.</h2>
          </div>
          <div className={styles.problemCopy}>
            <p>
              Teams are often formed around who is available, job titles,
              existing relationships or individual skills. Those things are
              useful, but they do not necessarily tell us whether a group of
              people will work effectively together.
            </p>
            <p>
              The harder question is how the combination of people will work:
              what each person brings, where they complement one another and
              where the team may have gaps.
            </p>
          </div>
        </section>

        <section className={styles.shift}>
          <div className={styles.shiftCard}>
            <span>Traditional question</span>
            <strong>Who is available?</strong>
          </div>
          <div className={styles.arrow} aria-hidden="true">→</div>
          <div className={`${styles.shiftCard} ${styles.shiftCardAccent}`}>
            <span>AutoTeams question</span>
            <strong>Who could work well together?</strong>
          </div>
        </section>

        <section className={styles.atlas}>
          <div className={styles.atlasOrb} aria-hidden="true">A</div>
          <div>
            <div className={styles.sectionLabel}>THE AUTOTEAMS APPROACH</div>
            <h2>Team intelligence, powered by Atlas.</h2>
            <p>
              Atlas helps understand the signals people bring to a team and
              turns them into explainable recommendations. The aim is not to
              replace human judgement, but to give people better information
              when they form and develop teams.
            </p>
          </div>
        </section>

        <section className={styles.principles}>
          {principles.map((item) => (
            <article className={styles.principleCard} key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className={styles.contextSection}>
          <div>
            <div className={styles.sectionLabel}>A BROADER VISION</div>
            <h2>Better teams, wherever people come together.</h2>
            <p>
              What started as a way to think differently about workplace teams
              has grown into a broader idea. The same challenge exists whenever
              people need to come together around a shared purpose.
            </p>
          </div>
          <div className={styles.contexts}>
            {contexts.map((context) => (
              <span key={context}>{context}</span>
            ))}
          </div>
        </section>

        <section className={styles.feedbackCta}>
          <div>
            <div className={styles.sectionLabel}>BUILD IT WITH US</div>
            <h2>What problem should AutoTeams solve next?</h2>
            <p>
              AutoTeams is still evolving. Your experience, ideas and
              recommendations can directly help shape what we build next.
            </p>
          </div>
          <Link className="button" href="/feedback">
            Share feedback &amp; ideas
          </Link>
        </section>
      </main>
    </PageShell>
  );
}
