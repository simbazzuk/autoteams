import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { RobotLogo } from "@/components/Site";
import styles from "./SignupPage.module.css";

export default function SignUpPage() {
  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <Link className={styles.brand} href="/">
            <RobotLogo />
            <span>
              <strong>TeamScience.ai</strong>
              <small>AI Team Intelligence</small>
            </span>
          </Link>

          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Start your TeamScience.ai journey</span>
            <h1>Build stronger teams with explainable AI.</h1>
            <p>
              Create contextual profiles, understand how people collaborate and
              let Atlas help design balanced teams while keeping every final
              decision human.
            </p>
          </div>

          <div className={styles.benefits}>
            <Benefit
              icon="✦"
              title="Understand people"
              text="Create separate Business, Friendship, Community, Sports and Education profiles."
            />
            <Benefit
              icon="♙"
              title="Build My Atlas Profile"
              text="Turn interview answers into an explainable individual collaboration profile."
            />
            <Benefit
              icon="◎"
              title="Design balanced teams"
              text="Review candidate recommendations, confidence and collective Team DNA."
            />
          </div>

          <div className={styles.atlasPreview}>
            <div className={styles.atlasOrb}>✦</div>
            <div>
              <small>Atlas</small>
              <strong>People understood. Teams explained.</strong>
              <p>
                Your profile information is used according to your privacy and
                workspace settings.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.decorativeOrbOne} />
        <div className={styles.decorativeOrbTwo} />
      </section>

      <section className={styles.formPanel}>
        <div className={styles.mobileBrand}>
          <Link className={styles.brand} href="/">
            <RobotLogo />
            <span>
              <strong>TeamScience.ai</strong>
              <small>AI Team Intelligence</small>
            </span>
          </Link>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.formIntro}>
            <span className={styles.eyebrow}>Secure registration</span>
            <h2>Create your account.</h2>
            <p>
              Register first, verify your email and then complete the profile
              appropriate to your workspace.
            </p>
          </div>

          <Suspense fallback={<div className={styles.loading}>Loading registration…</div>}>
            <div className={styles.authFormWrapper}>
              <AuthForm mode="signup" />
            </div>
          </Suspense>

          <div className={styles.trustNote}>
            <span>✓</span>
            <p>
              Your information stays within the relevant workspace and is used
              according to your profile privacy settings.
            </p>
          </div>
        </div>

        <div className={styles.signInPrompt}>
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </section>
    </main>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <article className={styles.benefit}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}
