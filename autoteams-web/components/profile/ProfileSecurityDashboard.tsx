"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  AccountSecurityState,
  SessionRecord,
  loadAccountSecurity,
  loadSessions,
  saveAccountSecurity,
  saveSessions,
} from "@/lib/profile-privacy-security";

export function ProfileSecurityDashboard() {
  const { user, resendVerification, reloadUser } = useAuth();
  const [security, setSecurity] = useState<AccountSecurityState | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setSecurity(loadAccountSecurity());
    setSessions(loadSessions());
  }, []);

  async function sendVerification() {
    setWorking(true);
    setMessage("");
    try {
      await resendVerification();
      setMessage("Verification email sent.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to send email.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function refreshVerification() {
    setWorking(true);
    await reloadUser();
    setMessage("Email-verification status refreshed.");
    setWorking(false);
  }

  function update<K extends keyof AccountSecurityState>(
    key: K,
    value: AccountSecurityState[K],
  ) {
    setSecurity((current) =>
      current ? { ...current, [key]: value } : current,
    );
    setMessage("");
  }

  function save() {
    if (!security) return;
    saveAccountSecurity({
      ...security,
      updatedAt: new Date().toISOString(),
    });
    setMessage("Security preferences saved.");
  }

  function endSession(id: string) {
    const updated = sessions.filter((session) => session.id !== id);
    setSessions(updated);
    saveSessions(updated);
  }

  return (
    <main className="security130b-page">
      <section className="security130b-hero">
        <div className="container">
          <span className="eyebrow">Profile Security</span>
          <h1>Protect your account and workspace access.</h1>
          <p>
            Review email verification, alerts, session preferences and the
            intended multi-factor authentication policy.
          </p>
        </div>
      </section>

      <section className="security130b-body">
        <div className="container security130b-layout">
          <section className="security130b-main">
            <article className="security130b-panel">
              <div className="security130b-panel-heading">
                <div>
                  <span className="eyebrow">Email verification</span>
                  <h2>Confirm ownership of your account email.</h2>
                </div>
                <span className={user?.emailVerified ? "success" : "warning"}>
                  {user?.emailVerified ? "Verified" : "Not verified"}
                </span>
              </div>

              <p>{user?.email}</p>

              <div className="actions">
                {!user?.emailVerified && (
                  <button
                    className="button"
                    disabled={working}
                    onClick={() => void sendVerification()}
                    type="button"
                  >
                    Resend Verification Email
                  </button>
                )}
                <button
                  className="button secondary"
                  disabled={working}
                  onClick={() => void refreshVerification()}
                  type="button"
                >
                  Refresh Status
                </button>
              </div>
            </article>

            <article className="security130b-panel">
              <div className="security130b-panel-heading">
                <div>
                  <span className="eyebrow">Multi-factor authentication</span>
                  <h2>MFA readiness and role policy.</h2>
                </div>
                <span className="planned">Not yet enabled</span>
              </div>

              <div className="security130b-method-grid">
                <article>
                  <span>01</span>
                  <strong>Authenticator application</strong>
                  <p>
                    Preferred method for Owners, Administrators and Team
                    Leaders.
                  </p>
                </article>
                <article>
                  <span>02</span>
                  <strong>SMS fallback</strong>
                  <p>
                    Consider only after reviewing Identity Platform and message
                    costs.
                  </p>
                </article>
              </div>

              <div className="security130b-warning">
                <strong>MFA is not being simulated.</strong>
                <p>
                  Real enrolment and enforcement remain disabled until Firebase
                  Authentication with Identity Platform has been configured.
                </p>
              </div>

              {security && (
                <SecurityToggle
                  title="Accept privileged-role MFA policy"
                  text="Require MFA for Workspace Owners and Administrators once technical enrolment is available."
                  checked={security.mfaPolicyAccepted}
                  onChange={(value) =>
                    update("mfaPolicyAccepted", value)
                  }
                />
              )}
            </article>

            <article className="security130b-panel">
              <span className="eyebrow">Sessions and devices</span>
              <h2>Review active access.</h2>

              <div className="security130b-session-list">
                {sessions.map((session) => (
                  <div key={session.id}>
                    <span>▣</span>
                    <div>
                      <strong>{session.device}</strong>
                      <small>
                        {session.browser} • {session.location}
                      </small>
                    </div>
                    <em>{session.current ? "Current session" : "Active"}</em>
                    {!session.current && (
                      <button
                        onClick={() => endSession(session.id)}
                        type="button"
                      >
                        End session
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="security130b-info">
                Production device history requires server-side session logging.
                This test release only records local session preferences.
              </div>
            </article>
          </section>

          <aside className="security130b-side">
            <article className="security130b-panel">
              <span className="eyebrow">Security preferences</span>
              <h2>Alerts and timeout.</h2>

              {security && (
                <>
                  <SecurityToggle
                    title="Sign-in alerts"
                    text="Notify me when a new browser or device signs in."
                    checked={security.signInAlerts}
                    onChange={(value) => update("signInAlerts", value)}
                  />
                  <SecurityToggle
                    title="Security emails"
                    text="Receive important account and permission updates."
                    checked={security.securityEmails}
                    onChange={(value) => update("securityEmails", value)}
                  />
                  <SecurityToggle
                    title="Trusted-device notifications"
                    text="Notify me when a device is trusted or removed."
                    checked={security.trustedDeviceNotifications}
                    onChange={(value) =>
                      update("trustedDeviceNotifications", value)
                    }
                  />

                  <label className="security130b-session-field">
                    Session timeout
                    <select
                      value={security.sessionTimeoutMinutes}
                      onChange={(event) =>
                        update(
                          "sessionTimeoutMinutes",
                          Number(event.target.value),
                        )
                      }
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={240}>4 hours</option>
                      <option value={480}>8 hours</option>
                    </select>
                  </label>
                </>
              )}

              {message && (
                <div className="security130b-success">{message}</div>
              )}

              <button className="button" onClick={save} type="button">
                Save Security Preferences
              </button>
            </article>

            <article className="security130b-panel">
              <span className="eyebrow">Quick links</span>
              <h2>Related controls.</h2>

              <div className="security130b-link-list">
                <Link href="/profile/privacy">
                  Profile Privacy <span>→</span>
                </Link>
                <Link href="/profile">
                  My Profile <span>→</span>
                </Link>
                <Link href="/members">
                  Members & Roles <span>→</span>
                </Link>
                <Link href="/trust-centre">
                  Trust Centre <span>→</span>
                </Link>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SecurityToggle({
  title,
  text,
  checked,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="security130b-toggle">
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}
