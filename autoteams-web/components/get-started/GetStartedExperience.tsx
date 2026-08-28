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
import styles from "./GetStartedExperience.module.css";

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
        title: "Add the people TeamScience.ai can consider",
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
      <section className={styles.loading}>
        Checking your TeamScience.ai setup...
      </section>
    );
  }

  return (
    <div className={styles.experience}>
      <section className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <div className={styles.progressCopy}>
            <span className={styles.eyebrow}>Getting started</span>

            <h2>
              {workspaceName
                ? `${workspaceName} setup`
                : "Set up your first TeamScience.ai workspace"}
            </h2>

            <p>
              Follow these steps to move from an empty workspace
              to a reviewed team recommendation.
            </p>
          </div>

          <strong className={styles.completionBadge}>
            {completed}/{steps.length} complete
          </strong>
        </div>

        <div className={styles.progressTrack}>
          <span
            className={styles.progressValue}
            style={{ width: `${progress}%` }}
          />
        </div>

        <small className={styles.progressLabel}>
          {progress}% complete
        </small>
      </section>

      <section className={styles.steps}>
        {steps.map((step, index) => (
          <article
            key={step.title}
            className={`${styles.stepCard} ${
              step.complete ? styles.stepComplete : ""
            }`}
          >
            <span
              className={`${styles.stepIcon} ${
                step.complete ? styles.iconComplete : ""
              }`}
            >
              {step.complete ? "OK" : index + 1}
            </span>

            <div className={styles.stepCopy}>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>

            <div className={styles.actionColumn}>
              <Link
                className={`${styles.stepAction} ${
                  step.complete
                    ? styles.completedAction
                    : styles.primaryAction
                }`}
                href={step.href}
              >
                {step.action}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
