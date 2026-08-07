"use client";

import Link from "next/link";
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
import {
  useAuth,
} from "@/components/AuthProvider";
import styles from "./AccountMenu.module.css";

export function AccountMenu() {
  const provider =
    readAuthProvider();

  if (provider === "firebase") {
    return <FirebaseAccountMenu />;
  }

  return <LocalAccountMenu />;
}

function FirebaseAccountMenu() {
  const [user, setUser] =
    useState<AutoTeamsAuthUser | null>(
      null,
    );
  const [ready, setReady] =
    useState(false);
  const [error, setError] =
    useState("");

  useEffect(() => {
    return subscribeToConfiguredAuth(
      (nextUser) => {
        setUser(nextUser);
        setReady(true);
      },
    );
  }, []);

  async function login() {
    setError("");

    try {
      const nextUser =
        await signInWithConfiguredProvider();

      setUser(nextUser);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in.",
      );
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

  if (!ready) {
    return (
      <div
        className={
          styles.loading
        }
        aria-label="Loading account"
      >
        <span />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        className={
          styles.signInButton
        }
        onClick={login}
        type="button"
      >
        <span
          className={
            styles.googleMark
          }
          aria-hidden="true"
        >
          G
        </span>

        <span>
          Sign in with Google
        </span>
      </button>
    );
  }

  return (
    <details
      className={
        styles.menu
      }
    >
      <summary
        className={
          styles.trigger
        }
      >
        <AccountAvatar
          displayName={
            user.displayName
          }
          photoURL={
            user.photoURL
          }
        />

        <span
          className={
            styles.identity
          }
        >
          <strong>
            {user.displayName}
          </strong>
          <small>
            Firebase Account
          </small>
        </span>

        <span
          className={
            styles.chevron
          }
          aria-hidden="true"
        >
          ⌄
        </span>
      </summary>

      <div
        className={
          styles.dropdown
        }
      >
        <div
          className={
            styles.profile
          }
        >
          <AccountAvatar
            displayName={
              user.displayName
            }
            photoURL={
              user.photoURL
            }
            large
          />

          <div>
            <strong>
              {user.displayName}
            </strong>
            <small>
              {user.email}
            </small>
            <span>
              Signed in with Google
            </span>
          </div>
        </div>

        <div
          className={
            styles.divider
          }
        />

        <Link href="/gemini-team-coach">
          Gemini Team Coach
        </Link>

        <Link href="/profile/privacy">
          Profile Privacy
        </Link>

        <Link href="/settings">
          Settings
        </Link>

        <div
          className={
            styles.divider
          }
        />

        <button
          onClick={logout}
          type="button"
        >
          Sign Out
        </button>

        {error && (
          <p
            className={
              styles.error
            }
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </details>
  );
}

function LocalAccountMenu() {
  const { user } = useAuth();

  const displayName =
    user?.displayName ||
    emailDisplayName(
      user?.email,
    ) ||
    "AutoTeams User";

  const email =
    user?.email || "";

  return (
    <details
      className={
        styles.menu
      }
    >
      <summary
        className={
          styles.trigger
        }
      >
        <AccountAvatar
          displayName={
            displayName
          }
        />

        <span
          className={
            styles.identity
          }
        >
          <strong>
            {displayName}
          </strong>
          <small>
            Team Member
          </small>
        </span>

        <span
          className={
            styles.chevron
          }
          aria-hidden="true"
        >
          ⌄
        </span>
      </summary>

      <div
        className={
          styles.dropdown
        }
      >
        <div
          className={
            styles.profile
          }
        >
          <AccountAvatar
            displayName={
              displayName
            }
            large
          />

          <div>
            <strong>
              {displayName}
            </strong>

            {email && (
              <small>
                {email}
              </small>
            )}

            <span>
              Local development account
            </span>
          </div>
        </div>

        <div
          className={
            styles.divider
          }
        />

        <Link href="/gemini-team-coach">
          Gemini Team Coach
        </Link>

        <Link href="/profile/privacy">
          Profile Privacy
        </Link>

        <Link href="/settings">
          Settings
        </Link>
      </div>
    </details>
  );
}

function AccountAvatar({
  displayName,
  photoURL,
  large = false,
}: {
  displayName: string;
  photoURL?: string;
  large?: boolean;
}) {
  const className =
    large
      ? `${styles.avatar} ${styles.largeAvatar}`
      : styles.avatar;

  if (photoURL) {
    return (
      <img
        alt=""
        className={
          className
        }
        referrerPolicy="no-referrer"
        src={photoURL}
      />
    );
  }

  return (
    <span
      className={
        className
      }
      aria-hidden="true"
    >
      {displayName
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function emailDisplayName(
  email?: string | null,
): string {
  return (email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();
}
