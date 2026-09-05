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

        <Link
          className={styles.menuItem}
          href="/gemini-team-coach"
        >
          <span
            className={`${styles.menuIcon} ${styles.coachIcon}`}
            aria-hidden="true"
          >
            AI
          </span>
          <span className={styles.menuCopy}>
            <strong>Gemini Team Coach</strong>
            <small>AI-powered team insights and advice</small>
          </span>
          <span className={styles.menuArrow} aria-hidden="true">
            &gt;
          </span>
        </Link>

        {/* AUTOTEAMS_V7157152242_CV_CAREER */}
        <Link
          className={`${styles.menuItem} ${styles.cvCareerLink}`}
          href="/profile/cv"
        >
          <span
            className={`${styles.menuIcon} ${styles.cvIcon}`}
            aria-hidden="true"
          >
            CV
          </span>
          <span className={styles.menuCopy}>
            <strong>CV &amp; Career</strong>
            <small>Review or replace your CV</small>
          </span>
          <span className={styles.menuArrow} aria-hidden="true">
            &gt;
          </span>
        </Link>
        <Link
          className={styles.menuItem}
          href="/profile/privacy"
        >
          <span
            className={`${styles.menuIcon} ${styles.privacyIcon}`}
            aria-hidden="true"
          >
            P
          </span>
          <span className={styles.menuCopy}>
            <strong>Profile Privacy</strong>
            <small>Control profile visibility and consent</small>
          </span>
          <span className={styles.menuArrow} aria-hidden="true">
            &gt;
          </span>
        </Link>

                {/* AUTOTEAMS_V7157152521_ACADEMY_ACCOUNT_MENU */}
        <Link
          className={styles.academyMenuItem}
          href="/academy"
        >
          <span
            className={styles.academyMenuIcon}
            aria-hidden="true"
          >
            A
          </span>

          <span className={styles.academyMenuLabel}>
            TeamScience Academy
          </span>

          <span
            className={styles.academyMenuChevron}
            aria-hidden="true"
          >
            &gt;
          </span>
        </Link>

<Link
          className={styles.menuItem}
          href="/settings"
        >
          <span
            className={`${styles.menuIcon} ${styles.settingsIcon}`}
            aria-hidden="true"
          >
            S
          </span>
          <span className={styles.menuCopy}>
            <strong>Settings</strong>
            <small>Manage your account and preferences</small>
          </span>
          <span className={styles.menuArrow} aria-hidden="true">
            &gt;
          </span>
        </Link>

        <Link
            className={styles.menuItem}
            href="/feedback"
          >
            <span
              className={`${styles.menuIcon} ${styles.settingsIcon}`}
              aria-hidden="true"
            >
              F
            </span>
            <span className={styles.menuCopy}>
              <strong>Feedback & Ideas</strong>
              <small>Share ideas, suggestions and product feedback</small>
            </span>
            <span className={styles.menuArrow} aria-hidden="true">
              &gt;
            </span>
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

        <Link
          className={styles.menuItem}
          href="/gemini-team-coach"
        >
          <span
            className={`${styles.menuIcon} ${styles.coachIcon}`}
            aria-hidden="true"
          >
            AI
          </span>
          <span className={styles.menuCopy}>
            <strong>Gemini Team Coach</strong>
            <small>AI-powered team insights and advice</small>
          </span>
          <span className={styles.menuArrow} aria-hidden="true">
            &gt;
          </span>
        </Link>

        {/* AUTOTEAMS_V7157152242_CV_CAREER */}
        <Link
          className={`${styles.menuItem} ${styles.cvCareerLink}`}
          href="/profile/cv"
        >
          <span
            className={`${styles.menuIcon} ${styles.cvIcon}`}
            aria-hidden="true"
          >
            CV
          </span>
          <span className={styles.menuCopy}>
            <strong>CV &amp; Career</strong>
            <small>Review or replace your CV</small>
          </span>
          <span className={styles.menuArrow} aria-hidden="true">
            &gt;
          </span>
        </Link>
        <Link
          className={styles.menuItem}
          href="/profile/privacy"
        >
          <span
            className={`${styles.menuIcon} ${styles.privacyIcon}`}
            aria-hidden="true"
          >
            P
          </span>
          <span className={styles.menuCopy}>
            <strong>Profile Privacy</strong>
            <small>Control profile visibility and consent</small>
          </span>
          <span className={styles.menuArrow} aria-hidden="true">
            &gt;
          </span>
        </Link>

                {/* AUTOTEAMS_V7157152521_ACADEMY_ACCOUNT_MENU */}
        <Link
          className={styles.academyMenuItem}
          href="/academy"
        >
          <span
            className={styles.academyMenuIcon}
            aria-hidden="true"
          >
            A
          </span>

          <span className={styles.academyMenuLabel}>
            TeamScience Academy
          </span>

          <span
            className={styles.academyMenuChevron}
            aria-hidden="true"
          >
            &gt;
          </span>
        </Link>

<Link
          className={styles.menuItem}
          href="/settings"
        >
          <span
            className={`${styles.menuIcon} ${styles.settingsIcon}`}
            aria-hidden="true"
          >
            S
          </span>
          <span className={styles.menuCopy}>
            <strong>Settings</strong>
            <small>Manage your account and preferences</small>
          </span>
          <span className={styles.menuArrow} aria-hidden="true">
            &gt;
          </span>
        </Link>

        <Link
            className={styles.menuItem}
            href="/feedback"
          >
            <span
              className={`${styles.menuIcon} ${styles.settingsIcon}`}
              aria-hidden="true"
            >
              F
            </span>
            <span className={styles.menuCopy}>
              <strong>Feedback & Ideas</strong>
              <small>Share ideas, suggestions and product feedback</small>
            </span>
            <span className={styles.menuArrow} aria-hidden="true">
              &gt;
            </span>
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
