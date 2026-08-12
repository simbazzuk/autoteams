"use client";

import { useEffect } from "react";

const ROUTE_KEY =
  "autoteams-team-dna-route-v71357";

const INSIGHTS_TEAM_KEY =
  "autoteams-team-insights-selected-team-v7121";

type StoredTarget = {
  id?: string;
  name?: string;
};

function normalise(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function readTarget(): StoredTarget {
  const params =
    new URLSearchParams(window.location.search);

  const routeId =
    params.get("teamId")?.trim() || "";

  const routeName =
    params.get("teamName")?.trim() || "";

  if (routeId || routeName) {
    const target = {
      id: routeId,
      name: routeName,
    };

    try {
      window.localStorage.setItem(
        ROUTE_KEY,
        JSON.stringify(target),
      );

      if (routeId) {
        window.localStorage.setItem(
          INSIGHTS_TEAM_KEY,
          routeId,
        );
      }
    } catch {}

    return target;
  }

  try {
    const stored =
      window.localStorage.getItem(
        ROUTE_KEY,
      );

    if (stored) {
      const parsed =
        JSON.parse(stored) as StoredTarget;

      if (parsed?.id || parsed?.name) {
        return parsed;
      }
    }

    const insightsId =
      window.localStorage.getItem(
        INSIGHTS_TEAM_KEY,
      );

    if (insightsId) {
      return {
        id: insightsId,
      };
    }
  } catch {}

  return {};
}

function clickMatchingTeam(
  target: StoredTarget,
) {
  const candidates =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          "button",
          "[role='button']",
          "a",
          "[data-team-id]",
          "[data-team-name]",
        ].join(","),
      ),
    );

  if (target.id) {
    const byId =
      candidates.find((element) => {
        const values = [
          element.dataset.teamId,
          element.getAttribute("data-id"),
          element.getAttribute("value"),
          element.getAttribute("href"),
        ]
          .filter(Boolean)
          .map(String);

        return values.some(
          (value) =>
            value === target.id ||
            value.includes(target.id!),
        );
      });

    if (byId) {
      byId.click();
      return true;
    }
  }

  if (target.name) {
    const wanted =
      normalise(target.name);

    const byName =
      candidates.find((element) => {
        const explicit =
          element.dataset.teamName;

        if (
          explicit &&
          normalise(explicit) === wanted
        ) {
          return true;
        }

        return (
          normalise(
            element.textContent || "",
          ) === wanted
        );
      });

    if (byName) {
      byName.click();
      return true;
    }
  }

  return false;
}

export function TeamDnaSelectionBridge() {
  useEffect(() => {
    const target = readTarget();

    if (!target.id && !target.name) {
      return;
    }

    let attempts = 0;
    let timer:
      ReturnType<typeof setTimeout> |
      undefined;

    const apply = () => {
      attempts += 1;

      if (clickMatchingTeam(target)) {
        return;
      }

      // Team DNA data may render asynchronously.
      if (attempts < 12) {
        timer = setTimeout(
          apply,
          attempts < 4 ? 80 : 180,
        );
      }
    };

    timer = setTimeout(apply, 0);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return null;
}
