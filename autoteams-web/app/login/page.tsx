import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { RobotLogo } from "@/components/Site";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
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
            <span className={styles.eyebrow}>Welcome back</span>
            <h1>Continue building stronger, more balanced teams.</h1>
            <p>
              Return to your workspace, review Atlas recommendations and
              continue from where you left off.
            </p>
          </div>

          <div className={styles.benefits}>
            <Benefit
              icon="♙"
              title="Review your Atlas Profile"
              text="Check confidence, freshness and collaboration traits."
            />
            <Benefit
              icon="◎"
              title="Build and compare teams"
              text="Use explainable recommendations and collective Team DNA."
            />
            <Benefit
              icon="✓"
              title="Keep decisions human"
              text="Atlas explains the evidence while you make the final decision."
            />
          </div>

          <div className={styles.atlasPreview}>
            <div className={styles.atlasOrb}>✦</div>
            <div>
              <small>Atlas</small>
              <strong>Your workspace is ready.</strong>
              <p>Sign in to continue where you left off.</p>
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
            <span className={styles.eyebrow}>Secure sign in</span>
            <h2>Welcome back.</h2>
            <p>
              Sign in to open your Home command centre and continue working
              with Atlas.
            </p>
          </div>

          <Suspense fallback={<div className={styles.loading}>Loading sign in…</div>}>
            <div className={styles.authFormWrapper}>
              <AuthForm mode="login" />
            </div>
          </Suspense>

          <div className={styles.securityNote}>
            <span>✓</span>
            <p>
              Your account and workspace access remain protected by your
              configured authentication and security settings.
            </p>
          </div>
        </div>

        <div className={styles.signUpPrompt}>
          New to TeamScience.ai? <Link href="/signup">Create an account</Link>
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
