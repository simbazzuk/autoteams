"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
} from "@/lib/workspaces";
import {
  listRecommendationsForWorkspace,
  type RecommendationHistoryRecord,
} from "@/lib/firebase/recommendation-persistence";

type SetupState = {
  workspace: boolean;
  people: boolean;
  recommendation: boolean;
  reviewed: boolean;
};

export function GetStartedExperience() {
  const [state, setState] = useState<SetupState>({
    workspace: false,
    people: false,
    recommendation: false,
    reviewed: false,
  });

  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);

    try {
      const workspaces = loadWorkspaces();
      const activeWorkspaceId = loadActiveWorkspaceId();

      const activeWorkspace = workspaces.find(
        (workspace) => workspace.id === activeWorkspaceId,
      );

      const people = loadPeople().filter(
        (person) =>
          person.workspaceId === activeWorkspaceId &&
          person.status === "active",
      );

      let recommendations: RecommendationHistoryRecord[] = [];

      if (activeWorkspaceId) {
        try {
          recommendations =
            await listRecommendationsForWorkspace(activeWorkspaceId);
        } catch {
          recommendations = [];
        }
      }

      setWorkspaceName(activeWorkspace?.name || "");

      setState({
        workspace: Boolean(activeWorkspace),
        people: people.length > 0,
        recommendation: recommendations.length > 0,
        reviewed: recommendations.some(
          (record) =>
            record.status === "approved" ||
            record.status === "rejected" ||
            record.status === "archived",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  const steps = useMemo(
    () => [
      {
        title: "Create or select a workspace",
        text: "A workspace keeps people, recommendations and decisions together.",
        complete: state.workspace,
        href: "/team-builder",
        action: state.workspace ? "Workspace ready" : "Choose workspace",
      },
      {
        title: "Add the people AutoTeams can consider",
        text: "Add or import the authorised people who may be selected for a team.",
        complete: state.people,
        href: "/people",
        action: state.people ? "People ready" : "Add people",
      },
      {
        title: "Describe the team you need",
        text: "Provide the outcome, team size, location preferences and important strengths.",
        complete: state.recommendation,
        href: "/team-builder",
        action: state.recommendation ? "Recommendation created" : "Build a team",
      },
      {
        title: "Review the recommendation",
        text: "Check the selected people, confidence, strengths, gaps and risks before making a decision.",
        complete: state.recommendation,
        href: "/recommendation-history",
        action: "Open history",
      },
      {
        title: "Make and record the human decision",
        text: "Submit, approve or reject the recommendation and retain the audit trail.",
        complete: state.reviewed,
        href: "/recommendation-history",
        action: state.reviewed ? "Decision recorded" : "Review recommendation",
      },
    ],
    [state],
  );

  const completed = steps.filter((step) => step.complete).length;
  const progress = Math.round((completed / steps.length) * 100);

  if (loading) {
    return (
      <section
        style={{
          padding: 24,
          color: "#8f9bb0",
          background: "#171e2d",
          border: "1px solid #2a3448",
          borderRadius: 18,
        }}
      >
        Checking your AutoTeams setup...
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section
        style={{
          display: "grid",
          gap: 13,
          padding: 22,
          background: "#171e2d",
          border: "1px solid #2a3448",
          borderRadius: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 18,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="eyebrow">Getting started</span>

            <h2 style={{ margin: "8px 0 6px", fontSize: 27 }}>
              {workspaceName
                ? `${workspaceName} setup`
                : "Set up your first AutoTeams workspace"}
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: 760,
                color: "#8f9bb0",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              Follow these steps to move from an empty workspace
              to a reviewed team recommendation.
            </p>
          </div>

          <strong
            style={{
              padding: "8px 11px",
              color: "#cfc9ff",
              background: "rgba(120,104,255,.12)",
              borderRadius: 999,
              fontSize: 11,
            }}
          >
            {completed}/{steps.length} complete
          </strong>
        </div>

        <div
          style={{
            height: 8,
            overflow: "hidden",
            background: "#252e40",
            borderRadius: 999,
          }}
        >
          <span
            style={{
              display: "block",
              width: `${progress}%`,
              height: "100%",
              background: "#7868ff",
              borderRadius: 999,
            }}
          />
        </div>

        <small style={{ color: "#8995a9", fontSize: 10 }}>
          {progress}% complete
        </small>
      </section>

      <section style={{ display: "grid", gap: 10 }}>
        {steps.map((step, index) => (
          <article
            key={step.title}
            style={{
              display: "grid",
              gridTemplateColumns: "42px minmax(0,1fr) auto",
              gap: 14,
              alignItems: "center",
              padding: 17,
              background: "#171e2d",
              border: `1px solid ${
                step.complete
                  ? "rgba(72,190,135,.28)"
                  : "#2a3448"
              }`,
              borderRadius: 14,
            }}
          >
            <span
              style={{
                display: "grid",
                width: 34,
                height: 34,
                placeItems: "center",
                color: step.complete ? "#8de2b5" : "#b9c3d2",
                background: step.complete
                  ? "rgba(72,190,135,.1)"
                  : "#222b3c",
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {step.complete ? "OK" : index + 1}
            </span>

            <div style={{ display: "grid", gap: 4 }}>
              <strong style={{ fontSize: 14 }}>{step.title}</strong>
              <p
                style={{
                  margin: 0,
                  color: "#8f9bb0",
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                {step.text}
              </p>
            </div>

            <Link
              className={step.complete ? "button secondary" : "button"}
              href={step.href}
            >
              {step.action}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
