"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import styles from "./GuidedOnboarding.module.css";

const KEY =
  "autoteams-onboarding-v79";

type OnboardingState = {
  profileStarted: boolean;
  atlasStarted: boolean;
  completed: boolean;
};

const initialState: OnboardingState = {
  profileStarted: false,
  atlasStarted: false,
  completed: false,
};

function loadState(): OnboardingState {
  try {
    const raw =
      localStorage.getItem(
        KEY,
      );

    return raw
      ? {
          ...initialState,
          ...JSON.parse(raw),
        }
      : initialState;
  } catch {
    return initialState;
  }
}

export function GuidedOnboarding() {
  const [
    state,
    setState,
  ] =
    useState<OnboardingState>(
      initialState,
    );

  useEffect(() => {
    setState(
      loadState(),
    );
  }, []);

  function update(
    next: Partial<OnboardingState>,
  ) {
    const value = {
      ...state,
      ...next,
    };

    setState(
      value,
    );

    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(
          value,
        ),
      );
    } catch {}
  }

  /*
   * Account creation is already complete on arrival.
   * This means a brand-new user starts at 25%.
   */
  const completedSteps =
    1 +
    Number(
      state.profileStarted,
    ) +
    Number(
      state.atlasStarted,
    ) +
    Number(
      state.completed,
    );

  const percent =
    Math.min(
      100,
      Math.round(
        (completedSteps / 4) *
          100,
      ),
    );

  return (
    <main
      className={styles.page}
      data-autoteams-onboarding="v7.9.2"
    >
      <div
        className={`container ${styles.container}`}
      >
        <section
          className={styles.hero}
        >
          <span
            className={styles.eyebrow}
          >
            WELCOME TO AUTOTEAMS
          </span>

          <h1>
            Let’s build your
            AutoTeams profile.
          </h1>

          <p>
            Your profile and Atlas
            answers help AutoTeams
            understand your strengths,
            preferences and Team DNA
            before you take part in
            recommendations.
          </p>

          <div
            className={
              styles.progress
            }
          >
            <div>
              <strong>
                {percent}%
              </strong>

              <span>
                onboarding progress
              </span>
            </div>

            <div
              className={
                styles.progressBar
              }
            >
              <i
                style={{
                  width:
                    `${percent}%`,
                }}
              />
            </div>
          </div>
        </section>

        <section
          className={styles.steps}
        >
          <article
            className={`${styles.step} ${styles.done}`}
          >
            <div
              className={
                styles.stepNumber
              }
            >
              ✓
            </div>

            <div>
              <small>
                STEP 1
              </small>

              <h2>
                Account created
              </h2>

              <p>
                Your AutoTeams account
                is ready.
              </p>
            </div>
          </article>

          <article
            className={styles.step}
          >
            <div
              className={
                styles.stepNumber
              }
            >
              2
            </div>

            <div
              className={
                styles.stepContent
              }
            >
              <small>
                STEP 2
              </small>

              <h2>
                Create your profile
              </h2>

              <p>
                Choose the profile
                that best represents
                how you want to use
                AutoTeams — work,
                sport, friendship,
                community or
                education.
              </p>

              <Link
                href="/onboarding/profile"
                onClick={() =>
                  update({
                    profileStarted:
                      true,
                  })
                }
              >
                Create profile →
              </Link>
            </div>
          </article>

          <article
            className={styles.step}
          >
            <div
              className={
                styles.stepNumber
              }
            >
              3
            </div>

            <div
              className={
                styles.stepContent
              }
            >
              <small>
                STEP 3
              </small>

              <h2>
                Complete Atlas
                questions
              </h2>

              <p>
                Atlas asks a short
                set of questions to
                build a more useful
                Team DNA profile and
                improve future team
                recommendations.
              </p>

              <Link
                href="/my-atlas-profile"
                onClick={() =>
                  update({
                    atlasStarted:
                      true,
                  })
                }
              >
                Start Atlas questions
                →
              </Link>
            </div>
          </article>

          <article
            className={styles.step}
          >
            <div
              className={
                styles.stepNumber
              }
            >
              4
            </div>

            <div
              className={
                styles.stepContent
              }
            >
              <small>
                STEP 4
              </small>

              <h2>
                Start using AutoTeams
              </h2>

              <p>
                Once your profile is
                ready, head to the
                Dashboard and start
                exploring Team Builder,
                Atlas and Team Science.
              </p>

              <Link
                href="/dashboard"
                className={
                  styles.primary
                }
                onClick={() =>
                  update({
                    completed:
                      true,
                  })
                }
              >
                Go to Dashboard →
              </Link>
            </div>
          </article>
        </section>

        <section
          className={styles.note}
        >
          <span>
            ✦
          </span>

          <div>
            <strong>
              Why this matters
            </strong>

            <p>
              AutoTeams recommendations
              are more useful when your
              profile reflects the
              context in which you want
              to participate.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
