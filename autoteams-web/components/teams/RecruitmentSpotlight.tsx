"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./RecruitmentSpotlight.module.css";

const TEAM_KEY = "autoteams-v20-saved-teams";

type TeamRecord = {
  id: string;
  name: string;
  status?: string;
  openPlaces?: number;
  recommendation?: {
    skillGaps?: string[];
  };
};

function readTeams(): TeamRecord[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function inferredOpenPlaces(team: TeamRecord) {
  if (typeof team.openPlaces === "number") {
    return Math.max(0, team.openPlaces);
  }

  for (const raw of team.recommendation?.skillGaps || []) {
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

function capabilityGap(team: TeamRecord) {
  return (team.recommendation?.skillGaps || [])
    .map(item => String(item || "").trim())
    .find(
      item =>
        item &&
        !/^\d+\s+place(?:\(s\)|s)?\s+remain(?:s)?\s+unfilled$/i.test(item),
    );
}

export function RecruitmentSpotlight() {
  const [teams, setTeams] = useState<TeamRecord[]>([]);

  useEffect(() => {
    const refresh = () => setTeams(readTeams());

    refresh();

    const timer = window.setInterval(refresh, 1200);

    window.addEventListener(
      "autoteams:team-lifecycle-changed",
      refresh,
    );

    return () => {
      window.clearInterval(timer);
      window.removeEventListener(
        "autoteams:team-lifecycle-changed",
        refresh,
      );
    };
  }, []);

  const recruitment = useMemo(
    () =>
      teams
        .map(team => ({
          team,
          openPlaces: inferredOpenPlaces(team),
          capability: capabilityGap(team),
        }))
        .filter(
          item =>
            String(item.team.status || "").toLowerCase() === "recruiting" ||
            item.openPlaces > 0 ||
            Boolean(item.capability),
        )
        .slice(0, 3),
    [teams],
  );

  if (recruitment.length === 0) {
    return null;
  }

  return (
    <section className={styles.spotlight}>
      <div className={styles.intro}>
        <div className={styles.atlasIcon} aria-hidden="true">
          A
        </div>

        <div>
          <span>Atlas recruitment spotlight</span>
          <h2>
            {recruitment.length}{" "}
            {recruitment.length === 1 ? "team needs" : "teams need"} attention
          </h2>
          <p>
            Focus recruitment where it will make the biggest difference.
          </p>
        </div>
      </div>

      <div className={styles.items}>
        {recruitment.map(({ team, openPlaces, capability }) => (
          <article key={team.id}>
            <div>
              <strong>{team.name}</strong>
              <span>
                {openPlaces > 0
                  ? `${openPlaces} open ${openPlaces === 1 ? "place" : "places"}`
                  : capability
                    ? `Missing: ${capability}`
                    : "Recruitment active"}
              </span>
            </div>

            <Link
              href="/team-builder"
              onClick={() => {
                try {
                  localStorage.setItem(
                    "autoteams-build-route-v71511",
                    "hybrid",
                  );
                  localStorage.setItem(
                    "autoteams-active-hybrid-team-v715121",
                    team.id,
                  );
                } catch {}
              }}
            >
              Recruit
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
