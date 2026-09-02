"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GuidedTeamBuilder } from "@/components/team-builder/GuidedTeamBuilder";
import { UnifiedTeamBuilderEntry } from "@/components/team-builder/UnifiedTeamBuilderEntry";
import { AtlasRecruitGaps } from "@/components/team-builder/AtlasRecruitGaps";

type ControlledBuildMode = "people" | "hybrid" | null;

const MODE_KEY = "autoteams-build-route-v71511";
const ACTIVE_HYBRID_TEAM_KEY = "autoteams-active-hybrid-team-v715121";

function readBoundHybridTeamId(): string {
  try {
    return localStorage.getItem(ACTIVE_HYBRID_TEAM_KEY) || "";
  } catch {
    return "";
  }
}

export function TeamBuilderExperience() {
  const searchParams = useSearchParams();

  const [mode, setMode] =
    useState<ControlledBuildMode>(null);

  const [hybridTeamId, setHybridTeamId] =
    useState("");

  const directBuilderIntent = useMemo(() => {
    return Boolean(
      searchParams.get("teamId") ||
        searchParams.get("person") ||
        searchParams.get("scenario") ||
        searchParams.get("mode") === "rebuild" ||
        searchParams.get("flow") === "rebuild",
    );
  }, [searchParams]);

  useEffect(() => {
    function sync() {
      const boundTeamId =
        readBoundHybridTeamId();

      setHybridTeamId(boundTeamId);

      if (
        window.location.hash ===
          "#atlas-recruit-gaps" &&
        boundTeamId
      ) {
        try {
          localStorage.setItem(
            MODE_KEY,
            "hybrid",
          );
        } catch {}

        setMode("hybrid");
        return;
      }

      if (directBuilderIntent) {
        try {
          localStorage.setItem(
            MODE_KEY,
            "people",
          );

          localStorage.removeItem(
            ACTIVE_HYBRID_TEAM_KEY,
          );
        } catch {}

        setHybridTeamId("");
        setMode("people");
        return;
      }

      // Normal visits always show the route chooser.
      // A previous Hybrid selection must not leak into a new journey.
      setMode(null);
    }

    sync();

    window.addEventListener(
      "hashchange",
      sync,
    );

    window.addEventListener(
      "autoteams:hybrid-team-saved",
      sync,
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        sync,
      );

      window.removeEventListener(
        "autoteams:hybrid-team-saved",
        sync,
      );
    };
  }, [directBuilderIntent]);

  function chooseMode(
    nextMode: "people" | "opportunity" | "hybrid",
  ) {
    if (nextMode === "opportunity") {
      return;
    }

    try {
      localStorage.setItem(
        MODE_KEY,
        nextMode,
      );

      // Every newly selected journey starts without a previously
      // bound Hybrid team. Hybrid binds only after Stage 1 saves.
      localStorage.removeItem(
        ACTIVE_HYBRID_TEAM_KEY,
      );
    } catch {}

    setHybridTeamId("");
    setMode(nextMode);
  }

  if (mode === null) {
    return (
      <UnifiedTeamBuilderEntry
        onModeSelected={chooseMode}
      />
    );
  }

  // Option 1: normal existing-people build only.
  if (mode === "people") {
    return <GuidedTeamBuilder />;
  }

  // Option 3: Hybrid Stage 1, then Stage 2 only after
  // the exact initial team has been saved and bound.
  if (mode === "hybrid") {
    return (
      <>
        <GuidedTeamBuilder />

        {hybridTeamId ? (
          <AtlasRecruitGaps />
        ) : null}
      </>
    );
  }

  return null;
}
