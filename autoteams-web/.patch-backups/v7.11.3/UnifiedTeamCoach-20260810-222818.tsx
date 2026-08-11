"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./UnifiedTeamCoach.module.css";

type CoachContext = {
  contextId?: string;
  contextName?: string;
  contextType?: string;
  peopleCount?: number;
  teamCount?: number;
};

const CONTEXT_KEY =
  "autoteams-coach-context-object-v7101";

function isValidPersistedCoachContext(
  value: unknown,
): value is CoachContext {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const context =
    value as Record<string, unknown>;

  const id =
    context.contextId;

  const name =
    context.contextName;

  if (
    typeof id !== "string" ||
    !id.trim() ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    return false;
  }

  /*
   * Reject known person/profile-shaped persisted values.
   * A coaching context represents a group/workspace, never an individual.
   */
  const combined =
    JSON.stringify(context)
      .toLowerCase();

  const personSignals = [
    "displayname",
    "email",
    "jobtitle",
    "teamdnastatus",
    "profileready",
    "strengths",
  ];

  if (
    personSignals.some(
      (signal) =>
        combined.includes(
          `"${signal}"`,
        ),
    )
  ) {
    return false;
  }

  const type =
    String(
      context.contextType ??
      "",
    )
      .toLowerCase()
      .trim();

  /*
   * "personal" was previously capable of coming from profile records.
   * Do not accept it as a group context unless stronger group metadata exists.
   */
  if (
    type === "personal" &&
    context.peopleCount === undefined &&
    context.teamCount === undefined
  ) {
    return false;
  }

  return true;
}

function clearPersistedCoachContext() {
  try {
    localStorage.removeItem(
      "autoteams-coach-context-v710",
    );

    localStorage.removeItem(
      CONTEXT_KEY,
    );
  } catch {}
}


const PROFILE_MAP: Record<
  string,
  {
    label: string;
    description: string;
  }
> = {
  business: {
    label: "Work",
    description:
      "professional strengths, collaboration and workplace preferences",
  },
  work: {
    label: "Work",
    description:
      "professional strengths, collaboration and workplace preferences",
  },
  personal: {
    label: "Friendship",
    description:
      "social preferences, interests and how you connect with others",
  },
  friendship: {
    label: "Friendship",
    description:
      "social preferences, interests and how you connect with others",
  },
  community: {
    label: "Community",
    description:
      "community interests, contribution style and collaboration preferences",
  },
  sports: {
    label: "Sport",
    description:
      "sport, positions, playing strengths and team preferences",
  },
  sport: {
    label: "Sport",
    description:
      "sport, positions, playing strengths and team preferences",
  },
  education: {
    label: "Education",
    description:
      "learning preferences, study strengths and project collaboration",
  },
};

function normaliseType(
  value?: string,
) {
  return (
    value
      ?.toLowerCase()
      .trim()
      .replace(
        /[_-]+/g,
        " ",
      ) || "group"
  );
}

function profileForContext(
  contextType?: string,
) {
  const type =
    normaliseType(
      contextType,
    );

  return (
    PROFILE_MAP[type] ?? {
      label: "Relevant",
      description:
        "the profile that best matches this group",
    }
  );
}

export function UnifiedTeamCoach() {
  const [
    context,
    setContext,
  ] =
    useState<CoachContext>(
      {},
    );

  useEffect(() => {
    function load() {
      try {
        const raw =
          localStorage.getItem(
            CONTEXT_KEY,
          );

        if (!raw) {
          setContext({});
          return;
        }

        const parsed =
          JSON.parse(raw);

        if (
          isValidPersistedCoachContext(
            parsed,
          )
        ) {
          setContext(parsed);
        } else {
          clearPersistedCoachContext();
          setContext({});
        }
      } catch {
        setContext({});
      }
    }

    load();

    window.addEventListener(
      "autoteams:coach-context-changed",
      load,
    );

    return () =>
      window.removeEventListener(
        "autoteams:coach-context-changed",
        load,
      );
  }, []);

  const profile =
    useMemo(
      () =>
        profileForContext(
          context.contextType,
        ),
      [
        context.contextType,
      ],
    );

  const contextName =
    context.contextName ??
    "No group selected";

  return (
    <main
      className={styles.page}
      data-autoteams-unified-team-coach="v7.11"
    >
      <div
        className={`container ${styles.container}`}
      >
        <section
          className={styles.hero}
        >
          <div
            className={styles.heroCopy}
          >
            <span
              className={styles.eyebrow}
            >
              TEAM COACH
            </span>

            <h1>
              Get advice about
              your team.
            </h1>

            <p>
              Team Coach is powered
              by Atlas. Atlas uses
              the relevant profiles
              in your selected group
              to help you understand
              team strengths, gaps
              and collaboration.
            </p>

            <div
              className={styles.badge}
            >
              ✦ Powered by Atlas
            </div>
          </div>
        </section>

        <section
          className={
            styles.contextPanel
          }
        >
          <div>
            <span>
              COACHING FOR
            </span>

            <h2>
              {contextName}
            </h2>

            <p>
              {context.contextName
              ? "Team Coach will use this group’s people, profiles and team information when giving advice."
              : "Choose a valid group or workspace before asking Team Coach for advice."}
            </p>
          </div>

          <div
            className={styles.contextMeta}
          >
            <span>
              {context.contextType
                ? normaliseType(
                    context.contextType,
                  )
                    .replace(
                      /\b\w/g,
                      (char) =>
                        char.toUpperCase(),
                    )
                : "Group"}
            </span>

            <span>
              {context.peopleCount ??
                "—"}{" "}
              people
            </span>

            <span>
              {context.teamCount ??
                "—"}{" "}
              teams
            </span>
          </div>

          <div
            className={styles.contextActions}
          >
            <Link href="/organisation">
              Manage group
            </Link>

            <Link href="/profile/privacy">
              Profile privacy
            </Link>

            <Link href="/trust-centre">
              Trust centre
            </Link>
          </div>
        </section>

        <section
          className={
            styles.profileReadiness
          }
        >
          <div
            className={styles.profileIcon}
          >
            ✦
          </div>

          <div>
            <span>
              RELEVANT PROFILE
            </span>

            <h2>
              {profile.label} profile
            </h2>

            <p>
              For this context, Atlas
              should use your{" "}
              <strong>
                {profile.label}
              </strong>{" "}
              profile —{" "}
              {profile.description}.
            </p>
          </div>

          <div
            className={
              styles.profileActions
            }
          >
            <Link
              href={`/profile?context=${normaliseType(
                context.contextType,
              ).replace(
                /\s+/g,
                "-",
              )}`}
            >
              Review profile →
            </Link>

            <Link href="/my-atlas-profile">
              Complete Atlas questions
              →
            </Link>
          </div>
        </section>

        <section
          className={styles.help}
        >
          <div
            className={styles.sectionHeading}
          >
            <span>
              HOW CAN TEAM COACH HELP?
            </span>

            <h2>
              Choose what you want
              help with.
            </h2>
          </div>

          <div
            className={styles.helpGrid}
          >
            <Link href="/team-builder">
              <span>👥</span>
              <strong>
                Team balance
              </strong>
              <p>
                Explore whether the
                group has the right
                mix of people, skills
                and roles.
              </p>
            </Link>

            <Link href="/team-dna">
              <span>🤝</span>
              <strong>
                Collaboration
              </strong>
              <p>
                Understand how the
                team works together
                and where friction
                may appear.
              </p>
            </Link>

            <Link href="/team-dna">
              <span>🧭</span>
              <strong>
                Leadership
              </strong>
              <p>
                Explore leadership
                distribution,
                contribution and
                team roles.
              </p>
            </Link>

            <Link href="/insights">
              <span>❤</span>
              <strong>
                Team health
              </strong>
              <p>
                Review signals around
                communication,
                resilience and
                psychological safety.
              </p>
            </Link>
          </div>
        </section>

        <section
          className={styles.ask}
        >
          <div>
            <span>
              ASK ATLAS
            </span>

            <h2>
              Ask about this team.
            </h2>

            <p>
              Atlas should answer in
              the context of{" "}
              <strong>
                {contextName}
              </strong>
              .
            </p>
          </div>

          <Link
            href="/atlas"
            className={styles.primary}
          >
            Ask Atlas →
          </Link>
        </section>

        <section
          className={styles.modelNote}
        >
          <strong>
            AutoTeams → Profile →
            Atlas → Team Coach
          </strong>

          <p>
            Gemini remains the
            underlying AI technology.
            It no longer needs to be
            presented as a separate
            Team Coach product.
          </p>
        </section>
      </div>
    </main>
  );
}
