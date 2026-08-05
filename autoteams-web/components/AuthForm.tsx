"use client";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

type Mode = "login" | "signup";

function authMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return "Something went wrong. Please try again.";
  }

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account already exists for this email.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/weak-password": "Use a password with at least six characters.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  };

  return messages[error.code] || error.message;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, signUp } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const isSignUp = mode === "signup";

  async function finish() {
    const nextPath = searchParams.get("next");
    router.push(nextPath?.startsWith("/") ? nextPath : "/dashboard");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setWorking(true);

    try {
      if (isSignUp) {
        await signUp({ displayName, city, email, password });
      } else {
        await signIn(email, password);
      }
      await finish();
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
      await finish();
    } catch (caught) {
      setError(authMessage(caught));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="auth-card card">
      <div className="section-heading compact">
        <span className="eyebrow">
          {isSignUp ? "Create your account" : "Welcome back"}
        </span>
        <h2>{isSignUp ? "Join AutoTeams." : "Log in to AutoTeams."}</h2>
        <p>
          {isSignUp
            ? "Create Team Personas and access them securely from any device."
            : "Access your saved Team Personas and dashboard."}
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
          <>
            <label>
              Display name
              <input
                autoComplete="name"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </label>
            <label>
              Town or city
              <input
                autoComplete="address-level2"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </label>
          </>
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
            minLength={6}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <button className="button auth-submit" disabled={working} type="submit">
          {working
            ? "Please wait…"
            : isSignUp
              ? "Create account"
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
