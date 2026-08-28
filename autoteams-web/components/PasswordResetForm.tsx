"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { useAuth } from "./AuthProvider";

export function PasswordResetForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setError("");
    setMessage("");

    try {
      await resetPassword(email);
      setMessage("Password reset instructions have been sent if the account exists.");
    } catch (caught) {
      setError(
        caught instanceof FirebaseError
          ? caught.message
          : "Unable to send the reset email."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="auth-card card">
      <span className="eyebrow">Account recovery</span>
      <h2>Reset your password.</h2>
      <p className="lead">Enter the email address associated with TeamScience.ai.</p>

      <form className="auth-form" onSubmit={submit}>
        <label>
          Email address
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {message && <div className="form-success">{message}</div>}
        {error && <div className="form-error">{error}</div>}
        <button className="button auth-submit" disabled={working} type="submit">
          {working ? "Sending…" : "Send reset email"}
        </button>
      </form>

      <div className="auth-links">
        <Link href="/login">Return to login</Link>
      </div>
    </div>
  );
}
