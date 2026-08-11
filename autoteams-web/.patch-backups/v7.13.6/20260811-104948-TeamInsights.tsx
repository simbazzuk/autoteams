"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { MyAutoTeamsSummary } from "@/components/team-insights/MyAutoTeamsSummary";
import {
  useFirebaseTeamInsightsData,
  type FirebaseInsightProfile,
  type FirebaseInsightTeam,
} from "@/components/team-insights/useFirebaseTeamInsightsData";
import styles from "./TeamInsights.module.css";

type CoachContext = {
  contextId?: string;
  contextName?: string;
  contextType?: string;
  peopleCount?: number;
  teamCount?: number;
};

const CONTEXT_KEY =
  "autoteams-coach-context-object-v7101";

const TEAM_KEY =
  "autoteams-team-insights-selected-team-v7121";

const PROFILE_KEY =
  "autoteams-team-insights-selected-profile-v7122";

const DEFAULT_PROFILES:
  FirebaseInsightProfile[] = [
    {
      id: "work",
      label: "Work",
      type: "work",
    },
    {
      id: "sport",
      label: "Sport",
      type: "sport",
    },
    {
      id: "friendship",
      label: "Friendship",
      type: "friendship",
    },
    {
      id: "community",
      label: "Community",
      type: "community",
    },
    {
      id: "education",
      label: "Education",
      type: "education",
    },
  ];

const DIMENSIONS = [
  ["Leadership", 72],
  ["Collaboration", 84],
  ["Analysis", 63],
  ["Delivery", 81],
  ["Creativity", 70],
  ["Communication", 78],
] as const;

function normaliseProfileType(
  value?: string,
) {
  const raw =
    (value ?? "")
      .toLowerCase()
      .trim();

  if (
    [
      "business",
      "work",
      "professional",
    ].includes(raw)
  ) {
    return "work";
  }

  if (
    [
      "sports",
      "sport",
    ].includes(raw)
  ) {
    return "sport";
  }

  if (
    [
      "friendship",
      "personal",
      "friends",
      "friends & family",
    ].includes(raw)
  ) {
    return "friendship";
  }

  if (raw === "community") {
    return "community";
  }

  if (raw === "education") {
    return "education";
  }

  return raw || "work";
}

function profileLabel(
  value?: string,
) {
  const type =
    normaliseProfileType(
      value,
    );

  return (
    DEFAULT_PROFILES.find(
      (profile) =>
        profile.type === type,
    )?.label ??
    "Relevant"
  );
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      value,
    ),
  );
}

export function TeamInsights() {
  const {
    teams,
    profiles:
      firebaseProfiles,
    loading,
    error,
  } =
    useFirebaseTeamInsightsData();

  const [
    context,
    setContext,
  ] =
    useState<CoachContext>(
      {},
    );

  const [
    selectedTeamId,
    setSelectedTeamId,
  ] =
    useState("");

  const [
    selectedProfile,
    setSelectedProfile,
  ] =
    useState("");

  const profiles =
    useMemo(
      () =>
        firebaseProfiles.length
          ? firebaseProfiles
          : DEFAULT_PROFILES,
      [
        firebaseProfiles,
      ],
    );

  useEffect(() => {
    try {
      const rawContext =
        localStorage.getItem(
          CONTEXT_KEY,
        );

      setContext(
        rawContext
          ? JSON.parse(
              rawContext,
            )
          : {},
      );

      const persistedProfile =
        localStorage.getItem(
          PROFILE_KEY,
        );

      const preferredProfile =
        profiles.find(
          (profile) =>
            profile.type ===
            persistedProfile,
        )?.type ??
        profiles.find(
          (profile) =>
            profile.type ===
            normaliseProfileType(
              rawContext
                ? (
                    JSON.parse(
                      rawContext,
                    ) as CoachContext
                  ).contextType
                : undefined,
            ),
        )?.type ??
        profiles[0]?.type ??
        "";

      setSelectedProfile(
        preferredProfile,
      );

      if (
        preferredProfile
      ) {
        localStorage.setItem(
          PROFILE_KEY,
          preferredProfile,
        );
      }
    } catch {
      setContext({});

      setSelectedProfile(
        profiles[0]?.type ??
          "",
      );
    }
  }, [profiles]);

  const profileTeams =
    useMemo(
      () =>
        teams.filter(
          (team) =>
            !selectedProfile ||
            !team.profileType ||
            normaliseProfileType(
              team.profileType,
            ) ===
              selectedProfile,
        ),
      [
        teams,
        selectedProfile,
      ],
    );

  const contextualTeams =
    useMemo(
      () =>
        profileTeams.filter(
          (team) =>
            !context.contextId ||
            !team.contextId ||
            team.contextId ===
              context.contextId,
        ),
      [
        profileTeams,
        context.contextId,
      ],
    );

  useEffect(() => {
    if (loading) {
      return;
    }

    try {
      const persistedTeam =
        localStorage.getItem(
          TEAM_KEY,
        );

      const valid =
        contextualTeams.find(
          (team) =>
            team.id ===
            persistedTeam,
        );

      if (valid) {
        setSelectedTeamId(
          valid.id,
        );
        return;
      }

      if (
        contextualTeams.length ===
        1
      ) {
        setSelectedTeamId(
          contextualTeams[0]
            .id,
        );

        localStorage.setItem(
          TEAM_KEY,
          contextualTeams[0]
            .id,
        );
      } else {
        setSelectedTeamId(
          "",
        );

        localStorage.removeItem(
          TEAM_KEY,
        );
      }
    } catch {
      setSelectedTeamId(
        contextualTeams.length ===
          1
          ? contextualTeams[0]
              .id
          : "",
      );
    }
  }, [
    contextualTeams,
    loading,
  ]);

  const selectedTeam =
    useMemo(
      () =>
        contextualTeams.find(
          (team) =>
            team.id ===
            selectedTeamId,
        ),
      [
        contextualTeams,
        selectedTeamId,
      ],
    );

  function chooseProfile(
    type: string,
  ) {
    setSelectedProfile(
      type,
    );

    setSelectedTeamId(
      "",
    );

    try {
      localStorage.setItem(
        PROFILE_KEY,
        type,
      );

      localStorage.removeItem(
        TEAM_KEY,
      );
    } catch {}
  }

  function chooseTeam(
    id: string,
  ) {
    setSelectedTeamId(id);

    try {
      if (id) {
        localStorage.setItem(
          TEAM_KEY,
          id,
        );
      } else {
        localStorage.removeItem(
          TEAM_KEY,
        );
      }
    } catch {}
  }

  const people =
    selectedTeam?.memberCount ??
    0;

  const metrics =
    useMemo(() => {
      if (!selectedTeam) {
        return null;
      }

      const coverage =
        people > 0
          ? clamp(
              68 +
                Math.min(
                  people,
                  10,
                ) *
                  2,
            )
          : 68;

      const balance =
        clamp(
          76 +
            Math.min(
              Math.max(
                people,
                1,
              ),
              8,
            ),
        );

      const collaboration =
        84;

      const skills = 68;

      const health =
        Math.round(
          (
            coverage +
            balance +
            collaboration +
            skills
          ) /
            4,
        );

      return {
        health,
        balance,
        coverage,
        skills,
        collaboration,
      };
    }, [
      selectedTeam,
      people,
    ]);

  return (
    <main
      className={styles.page}
      data-autoteams-team-insights="v7.13.2"
    >
      <div
        className={`container ${styles.container}`}
      >
        

        <section
          className={styles.hero}
          data-autoteams-v7132-hero="true"
        >
          <div>
            <span className={styles.eyebrow}>
              TEAM INSIGHTS
            </span>
        
            <h1>Team Overview</h1>
        
            <p>
              Key metrics, strengths, gaps and Atlas recommendations for
              your selected team.
            </p>
          </div>
        
          <div className={styles.atlasBadge}>
            ✦ Powered by Atlas
          </div>
        </section>
        
        <MyAutoTeamsSummary
          profiles={profiles}
          teams={teams}
          selectedProfile={
            selectedProfile
          }
          selectedTeamId={
            selectedTeamId
          }
          onSelectProfile={
            chooseProfile
          }
          onSelectTeam={
            chooseTeam
          }
        />

        <section
          className={`${styles.context} ${styles.selectorPanel}`}
        >
          <div
            className={
              styles.selectorIntro
            }
          >
            <span>
              ANALYSE
            </span>

            <h2>
              {loading
                ? "Loading your teams…"
                : selectedTeam?.name ??
                  "Choose a profile and team"}
            </h2>

            <p>
              {error
                ? "AutoTeams could not load all Team Insights data from Firebase."
                : selectedTeam
                  ? `${profileLabel(
                      selectedProfile,
                    )} profile · ${
                      selectedTeam.contextName ??
                      context.contextName ??
                      "Current group"
                    } · ${
                      selectedTeam.memberCount ??
                      "—"
                    } people`
                  : "Select the relevant profile first, then choose which team Atlas should analyse."}
            </p>
          </div>

          <div
            className={
              styles.selectorStack
            }
          >
            <label
              className={
                styles.teamSelect
              }
            >
              <span>
                Profile
              </span>

              <select
                value={
                  selectedProfile
                }
                onChange={(
                  event,
                ) =>
                  chooseProfile(
                    event.target
                      .value,
                  )
                }
              >
                {profiles.map(
                  (profile) => (
                    <option
                      key={
                        profile.id
                      }
                      value={
                        profile.type
                      }
                    >
                      {
                        profile.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            {contextualTeams.length >
            0 ? (
              <label
                className={
                  styles.teamSelect
                }
              >
                <span>
                  Team
                </span>

                <select
                  value={
                    selectedTeamId
                  }
                  onChange={(
                    event,
                  ) =>
                    chooseTeam(
                      event.target
                        .value,
                    )
                  }
                >
                  {contextualTeams.length >
                    1 && (
                    <option value="">
                      Select a
                      team…
                    </option>
                  )}

                  {contextualTeams.map(
                    (team) => (
                      <option
                        key={
                          team.id
                        }
                        value={
                          team.id
                        }
                      >
                        {
                          team.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>
            ) : (
              <Link
                className={
                  styles.primaryAction
                }
                href="/team-builder"
              >
                Create a Team →
              </Link>
            )}
          </div>
        </section>

        {!selectedTeam ? (
          <section
            className={
              styles.emptyState
            }
          >
            <div
              className={
                styles.emptyIcon
              }
            >
              ✦
            </div>

            <div>
              <span>
                {loading
                  ? "LOADING"
                  : "NO ANALYSIS YET"}
              </span>

              <h2>
                {loading
                  ? "Loading your Firebase teams…"
                  : contextualTeams.length
                    ? "Select a team to generate insights."
                    : `No ${profileLabel(
                        selectedProfile,
                      )} teams are available yet.`}
              </h2>

              <p>
                {loading
                  ? "AutoTeams is loading teams linked to your authenticated account."
                  : "Teams you own or belong to will appear here when they are available in Firebase."}
              </p>
            </div>

            {!loading && (
              <Link href="/team-builder">
                Build a{" "}
                {profileLabel(
                  selectedProfile,
                )}{" "}
                Team →
              </Link>
            )}
          </section>
        ) : (
          <>
            <section
              className={
                styles.metricGrid
              }
            >
              <Metric
                label="Team Health"
                value={
                  metrics!.health
                }
                suffix="/100"
              />

              <Metric
                label="Team Balance"
                value={
                  metrics!.balance
                }
                suffix="%"
              />

              <Metric
                label="Profile Coverage"
                value={
                  metrics!
                    .coverage
                }
                suffix="%"
              />

              <Metric
                label="Skills Coverage"
                value={
                  metrics!.skills
                }
                suffix="%"
              />

              <Metric
                label="Collaboration"
                value={
                  metrics!
                    .collaboration
                }
                suffix="%"
              />

              <Metric
                label="Atlas Confidence"
                displayText={
                  metrics!
                    .coverage >= 80
                    ? "High"
                    : "Medium"
                }
              />
            </section>

            <div
              className={
                styles.twoColumn
              }
            >
              <section
                className={
                  styles.card
                }
              >
                <div
                  className={
                    styles.cardHeading
                  }
                >
                  <div>
                    <span>
                      TEAM DNA
                    </span>

                    <h2>
                      How{" "}
                      {
                        selectedTeam.name
                      }{" "}
                      is balanced
                    </h2>
                  </div>

                  <Link href="/team-dna">
                    View Team DNA →
                  </Link>
                </div>

                <div
                  className={
                    styles.dna
                  }
                >
                  {DIMENSIONS.map(
                    ([
                      label,
                      value,
                    ]) => (
                      <div
                        className={
                          styles.dnaRow
                        }
                        key={
                          label
                        }
                      >
                        <div>
                          <strong>
                            {
                              label
                            }
                          </strong>

                          <span>
                            {
                              value
                            }
                            %
                          </span>
                        </div>

                        <div
                          className={
                            styles.track
                          }
                        >
                          <i
                            style={{
                              width: `${value}%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <section
                className={
                  styles.card
                }
              >
                <div
                  className={
                    styles.cardHeading
                  }
                >
                  <div>
                    <span>
                      STRENGTHS &
                      GAPS
                    </span>

                    <h2>
                      What stands
                      out
                    </h2>
                  </div>
                </div>

                <div
                  className={
                    styles.signalGroup
                  }
                >
                  <Signal
                    kind="strength"
                    title="Strong collaboration"
                    description="The selected team shows a healthy mix of collaborative working styles."
                  />

                  <Signal
                    kind="strength"
                    title="Good delivery coverage"
                    description="Delivery capability is well represented across this team."
                  />

                  <Signal
                    kind="gap"
                    title="Analytical depth"
                    description="Analytical capability appears less represented than delivery and collaboration."
                  />

                  <Signal
                    kind="gap"
                    title="Profile completeness"
                    description={`Completing ${profileLabel(
                      selectedProfile,
                    )} Atlas profiles will improve recommendation confidence.`}
                  />
                </div>
              </section>
            </div>

            <section
              className={
                styles.recommendations
              }
            >
              <div
                className={
                  styles.cardHeading
                }
              >
                <div>
                  <span>
                    ATLAS
                    RECOMMENDATIONS
                  </span>

                  <h2>
                    What should you
                    improve next?
                  </h2>

                  <p>
                    Actions for{" "}
                    {
                      selectedTeam.name
                    }
                    , using the{" "}
                    {profileLabel(
                      selectedProfile,
                    )}{" "}
                    profile context.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.recommendationList
                }
              >
                <Recommendation
                  priority="High priority"
                  title="Strengthen analytical coverage"
                  description="The team appears stronger in collaboration and delivery than analysis."
                  href="/team-builder"
                  action="Adjust team"
                />

                <Recommendation
                  priority="Medium priority"
                  title="Build leadership depth"
                  description="Avoid concentrating coordination and leadership responsibility in too few people."
                  href="/team-dna"
                  action="Review Team DNA"
                />

                <Recommendation
                  priority="Data quality"
                  title={`Complete ${profileLabel(
                    selectedProfile,
                  )} Atlas profiles`}
                  description="More complete profiles improve Atlas confidence and make recommendations more useful."
                  href={`/profile?context=${selectedProfile}`}
                  action="Review profiles"
                />
              </div>
            </section>

            <section
              className={
                styles.askAtlas
              }
            >
              <div>
                <span>
                  ASK ATLAS
                </span>

                <h2>
                  Explore{" "}
                  {
                    selectedTeam.name
                  }{" "}
                  further.
                </h2>

                <p>
                  Ask why a
                  recommendation was
                  made or explore how
                  a change could
                  affect this team.
                </p>
              </div>

              <Link href="/atlas">
                Ask Atlas about this
                team →
              </Link>
            </section>

            <p
              className={
                styles.disclaimer
              }
            >
              v7.13 uses Firebase
              as the authoritative
              source for the signed-in
              user’s profiles and
              teams. Insight scoring
              remains presentation-level
              until the Atlas scoring
              service is connected.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  suffix,
  displayText,
}: {
  label: string;
  value?: number;
  suffix?: string;
  displayText?: string;
}) {
  return (
    <article
      className={
        styles.metric
      }
    >
      <span>
        {label}
      </span>

      <strong>
        {displayText ?? (
          <>
            {value ?? 0}
            <small>
              {suffix}
            </small>
          </>
        )}
      </strong>
    </article>
  );
}

function Signal({
  kind,
  title,
  description,
}: {
  kind:
    | "strength"
    | "gap";
  title: string;
  description: string;
}) {
  return (
    <div
      className={
        styles.signal
      }
    >
      <div
        className={
          kind ===
          "strength"
            ? styles.good
            : styles.warn
        }
      >
        {kind ===
        "strength"
          ? "✓"
          : "!"}
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>
      </div>
    </div>
  );
}

function Recommendation({
  priority,
  title,
  description,
  href,
  action,
}: {
  priority: string;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <article
      className={
        styles.recommendation
      }
    >
      <div>
        <span>
          {priority}
        </span>

        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>
      </div>

      <Link href={href}>
        {action} →
      </Link>
    </article>
  );
}
