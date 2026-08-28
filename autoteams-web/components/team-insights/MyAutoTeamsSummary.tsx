"use client";

import { useMemo } from "react";
import styles from "./MyAutoTeamsSummary.module.css";

type TeamOption = {
  id: string;
  name: string;
  contextId?: string;
  contextName?: string;
  profileType?: string;
  memberCount?: number;
};

type ProfileOption = {
  id: string;
  label: string;
  type: string;
};

type Props = {
  profiles: ProfileOption[];
  teams: TeamOption[];
  selectedProfile: string;
  selectedTeamId: string;
  onSelectProfile: (profileType: string) => void;
  onSelectTeam: (teamId: string) => void;
  onDeleteTeam: (
    teamId: string,
    teamName: string,
  ) => void | Promise<void>;
};

const PROFILE_META: Record<
  string,
  {
    icon: string;
    className: string;
    completion: number;
  }
> = {
  work: {
    icon: "💼",
    className: styles.work,
    completion: 100,
  },
  community: {
    icon: "🌍",
    className: styles.community,
    completion: 82,
  },
  sport: {
    icon: "⚽",
    className: styles.sport,
    completion: 100,
  },
  friendship: {
    icon: "🤝",
    className: styles.friendship,
    completion: 76,
  },
  education: {
    icon: "🎓",
    className: styles.education,
    completion: 68,
  },
};

function getProfileMeta(type: string) {
  return (
    PROFILE_META[type] ?? {
      icon: "✦",
      className: styles.defaultProfile,
      completion: 70,
    }
  );
}

const TEAM_PALETTE = [
  styles.teamBlue,
  styles.teamTeal,
  styles.teamOrange,
  styles.teamGreen,
  styles.teamPurple,
  styles.teamPink,
];

function teamColourClass(
  teamId: string,
  index: number,
) {
  let hash = 0;

  for (let i = 0; i < teamId.length; i += 1) {
    hash = (hash * 31 + teamId.charCodeAt(i)) >>> 0;
  }

  return TEAM_PALETTE[
    (hash + index) % TEAM_PALETTE.length
  ];
}


export function MyAutoTeamsSummary({
  profiles,
  teams,
  selectedProfile,
  selectedTeamId,
  onSelectProfile,
  onSelectTeam,
  onDeleteTeam,
}: Props) {
  const profileCards = useMemo(
    () =>
      profiles.map((profile) => ({
        ...profile,
        meta: getProfileMeta(profile.type),
        teamCount: teams.filter(
          (team) =>
            !team.profileType ||
            team.profileType === profile.type,
        ).length,
      })),
    [profiles, teams],
  );

  return (
    <section
      className={styles.summary}
      data-autoteams-summary="v7.13.0"
    >
      <header className={styles.header}>
        <div>
          <span>✦ MY TEAMSCIENCE</span>
          <h2>My TeamScience Summary</h2>
          <p>
            Your profiles and teams at a glance. Jump straight into the profile or team you want to explore.
          </p>
        </div>
      </header>

      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <strong>Profiles</strong>
          <span>{profiles.length} available</span>
        </div>

        <div className={styles.profileGrid}>
          {profileCards.map((profile) => (
            <button
              className={`${styles.profileCard} ${profile.meta.className} ${
                selectedProfile === profile.type
                  ? styles.selected
                  : ""
              }`}
              key={profile.id}
              onClick={() =>
                onSelectProfile(profile.type)
              }
              type="button"
            >
              <div className={styles.profileTop}>
                <span className={styles.profileIcon}>
                  {profile.meta.icon}
                </span>

                <div>
                  <strong>{profile.label}</strong>
                  <small>
                    {profile.meta.completion >= 100
                      ? "Complete"
                      : `${profile.meta.completion}% complete`}
                  </small>
                </div>
              </div>

              <div className={styles.progress}>
                <i
                  style={{
                    width: `${profile.meta.completion}%`,
                  }}
                />
              </div>

              <div className={styles.profileFooter}>
                <span>
                  {profile.teamCount}{" "}
                  {profile.teamCount === 1
                    ? "team"
                    : "teams"}
                </span>
                <b>View →</b>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeading}>
          <strong>My Teams</strong>
          <span>{teams.length} teams</span>
        </div>

        {teams.length > 0 ? (
          <div className={styles.teamGrid}>
            {teams.map((team, index) => {
              const meta = getProfileMeta(
                team.profileType ?? "work",
              );
              const teamColour =
                teamColourClass(
                  team.id,
                  index,
                );


              const selected =
                selectedTeamId === team.id;

              return (
                <article
                  className={`${styles.teamCard} ${
                    teamColour
                  } ${
                    selected
                      ? styles.selectedTeam
                      : ""
                  }`}
                  key={team.id}
                  onClick={() => {
                    if (team.profileType) {
                      onSelectProfile(
                        team.profileType,
                      );
                    }

                    onSelectTeam(team.id);
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      if (team.profileType) {
                        onSelectProfile(
                          team.profileType,
                        );
                      }

                      onSelectTeam(team.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <button
                    className={styles.teamDelete}
                    type="button"
                    aria-label={`Delete ${team.name}`}
                    title={`Delete ${team.name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      void onDeleteTeam(
                        team.id,
                        team.name,
                      );
                    }}
                  >
                    <svg
                      aria-hidden="true"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v5" />
                      <path d="M14 11v5" />
                    </svg>
                  </button>
                  <div className={styles.teamTop}>
                    <span className={styles.teamIcon}>
                      {meta.icon}
                    </span>

                    <div>
                      <strong>{team.name}</strong>
                      <small>
                        {team.contextName ??
                          "TeamScience.ai group"}
                      </small>
                    </div>
                  </div>

                  <div className={styles.teamMeta}>
                    <span>
                      {team.profileType
                        ? team.profileType
                            .replace(
                              /[_-]+/g,
                              " ",
                            )
                            .replace(
                              /\b\w/g,
                              (char) =>
                                char.toUpperCase(),
                            )
                        : "Team"}
                    </span>

                    <span>
                      {team.memberCount ??
                        "—"}{" "}
                      people
                    </span>
                  </div>

                  <div className={styles.teamFooter}>
                    <span>
                      Team Health{" "}
                      <b>
                        {selected
                          ? "Selected"
                          : "View"}
                      </b>
                    </span>

                    <strong>
                      View Insights →
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <span>✦</span>
            <div>
              <strong>No teams yet</strong>
              <p>
                Teams you own, lead or participate in will appear here for quick access to Team
                Insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
