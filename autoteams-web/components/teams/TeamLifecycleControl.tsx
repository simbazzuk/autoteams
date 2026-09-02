"use client";

import { useMemo, useState } from "react";
import styles from "./TeamLifecycleControl.module.css";

const TEAM_KEY = "autoteams-v20-saved-teams";

export type TeamLifecycleStatus =
  | "active"
  | "recruiting"
  | "formed"
  | "closed"
  | "archived";

export type TeamLifecycleRecord = {
  id: string;
  name: string;
  status?: string;
  openPlaces?: number;
  lifecycleUpdatedAt?: string;
  recommendation?: {
    skillGaps?: string[];
  };
};

function readTeams(): Array<Record<string, unknown>> {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function capacityFromRecommendation(team: TeamLifecycleRecord) {
  const gaps = team.recommendation?.skillGaps || [];

  for (const raw of gaps) {
    const text = String(raw || "").trim();
    const match = text.match(
      /^(\d+)\s+place(?:\(s\)|s)?\s+remain(?:s)?\s+unfilled$/i,
    );

    if (match) {
      return Math.max(0, Number(match[1] || 0));
    }
  }

  return 0;
}

function normaliseStatus(value?: string): TeamLifecycleStatus {
  const raw = String(value || "").toLowerCase();

  if (raw === "recruiting") return "recruiting";
  if (raw === "formed") return "formed";
  if (raw === "closed") return "closed";
  if (raw === "archived") return "archived";

  return "active";
}

function statusLabel(status: TeamLifecycleStatus) {
  if (status === "recruiting") return "Recruiting";
  if (status === "formed") return "Formed";
  if (status === "closed") return "Closed";
  if (status === "archived") return "Archived";
  return "Active";
}

function updateTeam(
  teamId: string,
  patch: Record<string, unknown>,
) {
  const teams = readTeams();
  let found = false;

  const next = teams.map(team => {
    if (String(team.id || "") !== teamId) {
      return team;
    }

    found = true;

    return {
      ...team,
      ...patch,
      lifecycleUpdatedAt: new Date().toISOString(),
    };
  });

  if (!found) {
    throw new Error("This team could not be found in My Teams.");
  }

  localStorage.setItem(
    TEAM_KEY,
    JSON.stringify(next),
  );

  window.dispatchEvent(
    new CustomEvent(
      "autoteams:team-lifecycle-changed",
      {
        detail: {
          teamId,
          patch,
        },
      },
    ),
  );
}

export function TeamLifecycleControl({
  team,
  onChanged,
}: {
  team: TeamLifecycleRecord;
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const status =
    normaliseStatus(team.status);

  const openPlaces = useMemo(
    () =>
      typeof team.openPlaces === "number"
        ? Math.max(0, team.openPlaces)
        : capacityFromRecommendation(team),
    [team],
  );

  function apply(
    patch: Record<string, unknown>,
    success: string,
  ) {
    try {
      setBusy(true);
      setMessage("");
      updateTeam(team.id, patch);
      setMessage(success);
      onChanged?.();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update this team.",
      );
    } finally {
      setBusy(false);
    }
  }

  function setOpenPlaces(value: number) {
    const places = Math.max(0, value);

    apply(
      {
        openPlaces: places,
        status:
          places > 0
            ? "recruiting"
            : status === "recruiting"
              ? "active"
              : status,
      },
      places > 0
        ? `Recruitment opened for ${places} ${places === 1 ? "place" : "places"}.`
        : "Open places cleared.",
    );
  }

  return (
    <>
      <div className={styles.summary}>
        <div>
          <span
            className={`${styles.status} ${styles[`status_${status}`]}`}
          >
            {statusLabel(status)}
          </span>

          {status !== "archived" && (
            <span className={styles.places}>
              {openPlaces > 0
                ? `${openPlaces} open ${openPlaces === 1 ? "place" : "places"}`
                : "No open places"}
            </span>
          )}
        </div>

        <button
          className={styles.manage}
          type="button"
          onClick={() => {
            setMessage("");
            setOpen(true);
          }}
        >
          Manage team
        </button>
      </div>

      {open && (
        <div
          className={styles.backdrop}
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <section
            aria-labelledby={`team-lifecycle-${team.id}`}
            className={styles.modal}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHead}>
              <div>
                <span>Team lifecycle</span>
                <h2 id={`team-lifecycle-${team.id}`}>
                  {team.name}
                </h2>
              </div>

              <button
                aria-label="Close team lifecycle"
                className={styles.close}
                type="button"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.current}>
              <div>
                <small>Current status</small>
                <strong>{statusLabel(status)}</strong>
              </div>
              <div>
                <small>Open places</small>
                <strong>{openPlaces}</strong>
              </div>
            </div>

            <div className={styles.section}>
              <span className={styles.sectionLabel}>
                Recruitment
              </span>

              <div className={styles.capacity}>
                <button
                  type="button"
                  disabled={busy || openPlaces === 0}
                  onClick={() =>
                    setOpenPlaces(openPlaces - 1)
                  }
                >
                  −
                </button>

                <strong>{openPlaces}</strong>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setOpenPlaces(openPlaces + 1)
                  }
                >
                  +
                </button>
              </div>

              <p>
                Track how many additional people this team is actively
                recruiting.
              </p>

              <div className={styles.actionGrid}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    apply(
                      {
                        status: "recruiting",
                        openPlaces:
                          openPlaces > 0
                            ? openPlaces
                            : 1,
                      },
                      "Recruitment reopened.",
                    )
                  }
                >
                  Reopen recruitment
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    apply(
                      {
                        status: "closed",
                        openPlaces: 0,
                      },
                      "Recruitment closed.",
                    )
                  }
                >
                  Close recruitment
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <span className={styles.sectionLabel}>
                Team state
              </span>

              <div className={styles.actionGrid}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    apply(
                      {
                        status: "active",
                      },
                      "Team marked active.",
                    )
                  }
                >
                  Mark active
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    apply(
                      {
                        status: "formed",
                        openPlaces: 0,
                      },
                      "Team marked formed.",
                    )
                  }
                >
                  Mark formed
                </button>
              </div>
            </div>

            <div className={styles.archiveSection}>
              {status === "archived" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    apply(
                      {
                        status: "active",
                      },
                      "Team restored.",
                    )
                  }
                >
                  Restore team
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Archive ${team.name}? It will remain in My Teams but be marked inactive.`,
                      )
                    ) {
                      apply(
                        {
                          status: "archived",
                          openPlaces: 0,
                        },
                        "Team archived.",
                      );
                    }
                  }}
                >
                  Archive team
                </button>
              )}
            </div>

            {message && (
              <div className={styles.message} role="status">
                {message}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
