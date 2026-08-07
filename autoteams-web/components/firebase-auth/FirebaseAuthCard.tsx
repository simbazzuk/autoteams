"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  readAuthProvider,
} from "@/lib/config/autoteams-config";
import {
  signInWithConfiguredProvider,
  signOutConfiguredProvider,
  subscribeToConfiguredAuth,
  type AutoTeamsAuthUser,
} from "@/lib/auth/auth-adapter";
import styles from "./FirebaseAuthCard.module.css";

export function FirebaseAuthCard() {
  const [user, setUser] =
    useState<AutoTeamsAuthUser | null>(
      null,
    );
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const provider =
    readAuthProvider();

  useEffect(() => {
    if (
      provider !== "firebase"
    ) {
      setLoading(false);
      return;
    }

    return subscribeToConfiguredAuth(
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
    );
  }, [provider]);

  async function login() {
    setError("");

    try {
      setLoading(true);

      const nextUser =
        await signInWithConfiguredProvider();

      setUser(nextUser);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setError("");

    try {
      await signOutConfiguredProvider();
      setUser(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign out.",
      );
    }
  }

  if (
    provider !== "firebase"
  ) {
    return (
      <section className={styles.card}>
        <span className={styles.badge}>
          Local Auth
        </span>
        <h2>
          Firebase Authentication is ready but not active.
        </h2>
        <p>
          Change
          <code>
            AUTOTEAMS_AUTH_PROVIDER=firebase
          </code>
          when you want to test Google sign-in.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <span className={styles.badge}>
        Firebase Auth
      </span>

      <h2>
        {user
          ? `Signed in as ${user.displayName}`
          : "Sign in with Google"}
      </h2>

      <p>
        {user
          ? user.email
          : "Use a Firebase-authenticated identity for future workspace ownership and collaboration."}
      </p>

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      )}

      {user ? (
        <button
          className="button secondary"
          disabled={loading}
          onClick={logout}
          type="button"
        >
          Sign Out
        </button>
      ) : (
        <button
          className="button"
          disabled={loading}
          onClick={login}
          type="button"
        >
          {loading
            ? "Signing in…"
            : "Continue with Google"}
        </button>
      )}
    </section>
  );
}
