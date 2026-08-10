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
  profileCompleted: boolean;
  atlasCompleted: boolean;
  completed: boolean;
};

const initialState: OnboardingState = {
  profileCompleted: false,
  atlasCompleted: false,
  completed: false,
};

function loadState(): OnboardingState {
  try {
    const raw =
      localStorage.getItem(KEY);

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

    setState(value);

    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(value),
      );
    } catch {}
  }

  const completedSteps =
    Number(
      state.profileCompleted,
    ) +
    Number(
      state.atlasCompleted,
    ) +
    Number(
      state.completed,
    );

  const percent =
    Math.round(
      (completedSteps / 3) *
        100,
    );

  const atlasLocked =
    !state.profileCompleted;

  const dashboardLocked =
    !state.atlasCompleted;

  return (
    <main
      className={styles.page}
      data-autoteams-onboarding="v7.9.4"
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
            Complete your profile
            before you start.
          </h1>

          <p>
            AutoTeams works best when
            your profile and Atlas
            answers are complete.
            Follow these steps in order
            so recommendations use the
            right information about you.
          </p>

          <div
            className={styles.progress}
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
            className={`${styles.step} ${
              state.profileCompleted
                ? styles.done
                : styles.active
            }`}
          >
            <div
              className={
                styles.stepNumber
              }
            >
              {state.profileCompleted
                ? "✓"
                : "1"}
            </div>

            <div
              className={
                styles.stepContent
              }
            >
              <small>
                STEP 1
              </small>

              <h2>
                Create your profile
              </h2>

              <p>
                Choose your first
                AutoTeams context and
                complete the profile
                that describes how you
                want to participate.
              </p>

              <Link
                href="/onboarding/profile"
                onClick={() =>
                  update({
                    profileCompleted:
                      true,
                  })
                }
              >
                {state.profileCompleted
                  ? "Review profile"
                  : "Create profile"}{" "}
                →
              </Link>
            </div>
          </article>

          <article
            className={`${styles.step} ${
              state.atlasCompleted
                ? styles.done
                : atlasLocked
                  ? styles.locked
                  : styles.active
            }`}
          >
            <div
              className={
                styles.stepNumber
              }
            >
              {state.atlasCompleted
                ? "✓"
                : "2"}
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
                Complete Atlas
                questions
              </h2>

              <p>
                Atlas uses your answers
                to build a more useful
                collaboration profile
                and improve team
                recommendations.
              </p>

              {atlasLocked ? (
                <button
                  type="button"
                  className={
                    styles.lockedButton
                  }
                  disabled
                >
                  Complete profile
                  first
                </button>
              ) : (
                <Link
                  href="/my-atlas-profile"
                  onClick={() =>
                    update({
                      atlasCompleted:
                        true,
                    })
                  }
                >
                  {state.atlasCompleted
                    ? "Review Atlas profile"
                    : "Start Atlas questions"}{" "}
                  →
                </Link>
              )}
            </div>
          </article>

          <article
            className={`${styles.step} ${
              state.completed
                ? styles.done
                : dashboardLocked
                  ? styles.locked
                  : styles.active
            }`}
          >
            <div
              className={
                styles.stepNumber
              }
            >
              {state.completed
                ? "✓"
                : "3"}
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
                Start AutoTeams
              </h2>

              <p>
                Once your profile and
                Atlas questions are
                complete, you can start
                using Team Builder,
                Atlas and Team Science.
              </p>

              {dashboardLocked ? (
                <button
                  type="button"
                  className={
                    styles.lockedButton
                  }
                  disabled
                >
                  Complete Atlas first
                </button>
              ) : (
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
                  Start AutoTeams →
                </Link>
              )}
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
              Complete in order
            </strong>

            <p>
              Profile first, Atlas
              second, AutoTeams third.
              This keeps onboarding
              simple and gives Team
              Builder better data from
              the start.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
