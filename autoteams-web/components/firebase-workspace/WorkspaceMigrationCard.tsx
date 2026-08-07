"use client";

import {
  useEffect,
  useState,
} from "react";
import type {
  User,
} from "firebase/auth";
import {
  subscribeToFirebaseUser,
} from "@/lib/firebase/auth-ready";
import {
  migrateLocalWorkspacesToFirestore,
  type WorkspaceMigrationResult,
} from "@/lib/firebase/workspace-migration";
import {
  getWorkspaceCloudStatus,
  type WorkspaceCloudStatus,
} from "@/lib/firebase/workspace-cloud-status";
import {
  FirebaseWorkspaceRepository,
} from "@/lib/repositories/firebase/firebase-workspace-repository";
import type {
  Workspace,
} from "@/lib/workspaces";
import styles from "./WorkspaceMigrationCard.module.css";

export function WorkspaceMigrationCard() {
  const [
    status,
    setStatus,
  ] = useState<
    WorkspaceCloudStatus | null
  >(null);

  const [
    cloudWorkspaces,
    setCloudWorkspaces,
  ] = useState<
    Workspace[]
  >([]);

  const [
    migration,
    setMigration,
  ] = useState<
    WorkspaceMigrationResult | null
  >(null);

  const [
    authUser,
    setAuthUser,
  ] = useState<
    User | null
  >(null);

  const [
    authReady,
    setAuthReady,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    return subscribeToFirebaseUser(
      (user) => {
        setAuthUser(user);
        setAuthReady(true);

        if (user) {
          void refresh();
        }
        else {
          setStatus({
            localWorkspaceCount: 0,
            cloudWorkspaceCount: 0,
            membershipCount: 0,
            activeCloudWorkspaceId: "",
            signedIn: false,
          });
          setCloudWorkspaces([]);
          setLoading(false);
        }
      },
    );
  }, []);

  async function refresh() {
    setError("");
    setLoading(true);

    try {
      const nextStatus =
        await getWorkspaceCloudStatus();

      setStatus(nextStatus);

      if (
        nextStatus.signedIn
      ) {
        const repository =
          new FirebaseWorkspaceRepository();

        setCloudWorkspaces(
          await repository.list(),
        );
      }
      else {
        setCloudWorkspaces(
          [],
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to read workspace migration status.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function migrate() {
    setLoading(true);
    setError("");

    try {
      const result =
        await migrateLocalWorkspacesToFirestore();

      setMigration(
        result,
      );

      await refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Workspace migration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!authReady) {
    return (
      <section className={styles.card}>
        <div className={styles.authLoading}>
          <span className={styles.spinner} />
          <div>
            <span className="eyebrow">
              Firebase Authentication
            </span>
            <h2>
              Restoring Firebase session…
            </h2>
            <p>
              AutoTeams is waiting for Firebase to restore
              the signed-in browser session before checking
              workspace migration status.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.heading}>
        <div>
          <span className="eyebrow">
            Phase 3 Migration
          </span>
          <h2>
            Move workspaces to Firestore.
          </h2>
          <p>
            This copies your existing local workspaces
            into Firestore and creates an owner membership
            for the signed-in Firebase user. Local data is
            not deleted.
          </p>
        </div>

        <span
          className={
            authUser
              ? styles.ready
              : styles.warning
          }
        >
          {authUser
            ? "Firebase user ready"
            : "Sign in required"}
        </span>
      </div>

      {authUser && (
        <div className={styles.firebaseUser}>
          {authUser.photoURL ? (
            <img
              alt=""
              referrerPolicy="no-referrer"
              src={authUser.photoURL}
            />
          ) : (
            <span>
              {(authUser.displayName ||
                authUser.email ||
                "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          )}

          <div>
            <strong>
              {authUser.displayName ||
                "Firebase User"}
            </strong>
            <small>
              {authUser.email || ""}
            </small>
          </div>
        </div>
      )}

      <div className={styles.metrics}>
        <Metric
          label="Local workspaces"
          value={
            status?.localWorkspaceCount ??
            "—"
          }
        />
        <Metric
          label="Cloud workspaces"
          value={
            status?.cloudWorkspaceCount ??
            "—"
          }
        />
        <Metric
          label="Memberships"
          value={
            status?.membershipCount ??
            "—"
          }
        />
        <Metric
          label="Cloud active workspace"
          value={
            status?.activeCloudWorkspaceId ||
            "Not set"
          }
        />
      </div>

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      )}

      {migration && (
        <div className={styles.success}>
          <strong>
            Migration completed.
          </strong>
          <span>
            {migration.workspaceCount} workspace
            {migration.workspaceCount === 1
              ? ""
              : "s"}{" "}
            copied to Firestore.
          </span>

          {migration.skipped > 0 && (
            <span>
              {migration.skipped} workspace
              {migration.skipped === 1
                ? ""
                : "s"}{" "}
              skipped because another owner was already
              recorded.
            </span>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button
          className="button"
          disabled={
            loading ||
            !authUser
          }
          onClick={migrate}
          type="button"
        >
          {loading
            ? "Checking…"
            : "Migrate Workspaces to Firestore"}
        </button>

        <button
          className="button secondary"
          disabled={loading}
          onClick={() =>
            void refresh()
          }
          type="button"
        >
          Refresh Status
        </button>
      </div>

      {cloudWorkspaces.length > 0 && (
        <div className={styles.cloudList}>
          <div>
            <span className="eyebrow">
              Firestore workspaces
            </span>
            <h3>
              Cloud copy verified.
            </h3>
          </div>

          {cloudWorkspaces.map(
            (workspace) => (
              <article
                key={workspace.id}
              >
                <div>
                  <strong>
                    {workspace.name}
                  </strong>
                  <small>
                    {workspace.type}
                  </small>
                </div>

                <code>
                  {workspace.id}
                </code>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <article>
      <small>
        {label}
      </small>
      <strong>
        {value}
      </strong>
    </article>
  );
}
