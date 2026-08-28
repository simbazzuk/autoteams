"use client";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

type Mode = "login" | "signup";

function authMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  }

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account already exists for this email.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/weak-password": "Use a stronger password.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  };

  return messages[error.code] || error.message;
}

function passwordScore(password: string): number {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, signUp } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const isSignUp = mode === "signup";
  const score = useMemo(() => passwordScore(password), [password]);

  async function finish(fromSignup = false) {
    const nextPath = searchParams.get("next");
    router.push(
      nextPath?.startsWith("/")
        ? nextPath
        : fromSignup
        ? "/onboarding"
        : "/dashboard",
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isSignUp && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (isSignUp && score < 4) {
      setError(
        "Use at least 10 characters with upper and lower case letters, a number and a symbol.",
      );
      return;
    }

    setWorking(true);

    try {
      if (isSignUp) {
        await signUp({
          displayName,
          email,
          password,
          ageConfirmed,
          termsAccepted,
          privacyAccepted,
          marketingConsent,
        });
        await finish(true);
      } else {
        await signIn(email, password);
        await finish(false);
      }
    } catch (caught) {
      setError(authMessage(caught));
    } finally {
      setWorking(false);
    }
  }

  async function googleSignIn() {
    setError("");
    setWorking(true);

    try {
      await signInWithGoogle();
      await finish(isSignUp);
    } catch (caught) {
      setError(authMessage(caught));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="auth-card card v115-auth-card">
      <div className="section-heading compact">
        <span className="eyebrow">
          {isSignUp ? "Secure registration" : "Welcome back"}
        </span>
        <h2>
          {isSignUp ? "Create your AutoTeams account." : "Log in to AutoTeams."}
        </h2>
        <p>
          {isSignUp
            ? "Register first, verify your email and then complete the profile appropriate to your workspace."
            : "Access your workspaces, Team DNA and Atlas recommendations."}
        </p>
      </div>

      <button
        className="button secondary auth-google"
        disabled={working}
        onClick={googleSignIn}
        type="button"
      >
        Continue with Google
      </button>

      <div className="auth-divider">
        <span>or use email</span>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {isSignUp && (
          <label>
            Display name
            <input
              autoComplete="name"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
        )}

        <label>
          Email address
          <input
            autoComplete="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={isSignUp ? 10 : 6}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {isSignUp && (
          <>
            <div className="v115-password-strength">
              <span>
                <i style={{ width: `${score * 20}%` }} />
              </span>
              <small>
                {score < 3
                  ? "Weak password"
                  : score < 5
                    ? "Good password"
                    : "Strong password"}
              </small>
            </div>

            <label>
              Confirm password
              <input
                autoComplete="new-password"
                minLength={10}
                required
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>

            <div className="v115-registration-consent">
              <label>
                <input
                  required
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(event) => setAgeConfirmed(event.target.checked)}
                />
                <span>I confirm that I am aged 18 or over.</span>
              </label>

              <label>
                <input
                  required
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />
                <span>
                  I accept the <Link href="/terms">Terms of Use</Link>.
                </span>
              </label>

              <label>
                <input
                  required
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                />
                <span>
                  I have read the <Link href="/privacy">Privacy Notice</Link>.
                </span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(event) => setMarketingConsent(event.target.checked)}
                />
                <span>
                  Send me optional product news and early-access updates.
                </span>
              </label>
            </div>
          </>
        )}

        {error && <div className="form-error">{error}</div>}

        <button className="button auth-submit" disabled={working} type="submit">
          {working
            ? "Please wait…"
            : isSignUp
              ? "Create secure account"
              : "Log in"}
        </button>
      </form>

      <div className="auth-links">
        {isSignUp ? (
          <span>
            Already registered? <Link href="/login">Log in</Link>
          </span>
        ) : (
          <>
            <Link href="/forgot-password">Forgot password?</Link>
            <span>
              New to AutoTeams? <Link href="/signup">Create account</Link>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
