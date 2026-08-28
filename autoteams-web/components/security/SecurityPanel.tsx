"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  SecurityPreferences,
  defaultSecurityPreferences,
  loadSecurityPreferences,
  saveSecurityPreferences,
} from "@/lib/registration-profile";
import {
  TrustCard,
  TrustHero,
  TrustSectionHeading,
} from "@/components/trust/TrustComponents";

export function SecurityPanel() {
  const { user, resendVerification, reloadUser } = useAuth();
  const [preferences, setPreferences] = useState<SecurityPreferences>(
    defaultSecurityPreferences,
  );
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setPreferences(loadSecurityPreferences());
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
    setMessage("Verification status refreshed.");
    setWorking(false);
  }

  function save() {
    saveSecurityPreferences(preferences);
    setMessage("Security preferences saved.");
  }

  return (
    <main className="trust12-page">
      <TrustHero
        eyebrow="Security Centre"
        title="Protect every workspace and account."
        text="TeamScience.ai combines email verification, role-based permissions, session preferences and an MFA-ready design for higher-risk roles."
        primaryHref="/members"
        primaryLabel="Review Members & Roles"
        secondaryHref="/privacy"
        secondaryLabel="Privacy Centre"
      />

      <section className="trust12-section">
        <div className="container">
          <TrustSectionHeading
            eyebrow="Security foundations"
            title="Protection matched to role and risk."
            text="Owners and Administrators control more information, so they require stronger safeguards than ordinary Team Members."
          />

          <div className="trust12-card-grid">
            <TrustCard
              icon="✓"
              title="Email verification"
              text="Confirm ownership of the email address before using privileged workspace features."
            />
            <TrustCard
              icon="♙"
              title="Role-based access"
              text="Owners, Administrators, Team Leaders and Team Members receive different permissions."
            />
            <TrustCard
              icon="◇"
              title="MFA-ready design"
              text="Prepare for TOTP enrolment without pretending multi-factor authentication is already active."
            />
            <TrustCard
              icon="◔"
              title="Session controls"
              text="Set timeout and notification preferences appropriate to the workspace."
            />
          </div>
        </div>
      </section>

      <section className="trust12-section trust12-section-alt">
        <div className="container trust12-security-layout">
          <section className="trust12-panel">
            <div className="trust12-panel-heading">
              <div>
                <span className="eyebrow">Email verification</span>
                <h2>Confirm the account email.</h2>
              </div>
              <span className={user?.emailVerified ? "success" : "warning"}>
                {user?.emailVerified ? "Verified" : "Not verified"}
              </span>
            </div>

            <p className="trust12-panel-copy">{user?.email}</p>

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
          </section>

          <section className="trust12-panel">
            <div className="trust12-panel-heading">
              <div>
                <span className="eyebrow">MFA readiness</span>
                <h2>Prepare stronger sign-in protection.</h2>
              </div>
              <span className="planned">Configuration required</span>
            </div>

            <div className="trust12-method-grid">
              <article>
                <span>01</span>
                <strong>Authenticator application</strong>
                <p>
                  Preferred option for Owners, Administrators and Team Leaders.
                </p>
              </article>
              <article>
                <span>02</span>
                <strong>SMS fallback</strong>
                <p>
                  Consider only after reviewing cost, recovery and security risk.
                </p>
              </article>
            </div>

            <div className="trust12-warning">
              <strong>MFA is not being simulated.</strong>
              <p>
                The policy can be configured now, but real enrolment and
                enforcement require Firebase Authentication with Identity
                Platform.
              </p>
            </div>

            <SecurityToggle
              title="Require MFA for privileged roles"
              text="Target policy for Workspace Owners and Administrators."
              checked={preferences.requireMfaForPrivilegedRoles}
              onChange={(value) =>
                setPreferences((current) => ({
                  ...current,
                  requireMfaForPrivilegedRoles: value,
                }))
              }
            />
          </section>
        </div>
      </section>

      <section className="trust12-section">
        <div className="container trust12-security-layout">
          <section className="trust12-panel">
            <span className="eyebrow">Security preferences</span>
            <h2>Alerts and session controls.</h2>

            <SecurityToggle
              title="Sign-in alerts"
              text="Notify me when a new browser or device signs in."
              checked={preferences.signInAlerts}
              onChange={(value) =>
                setPreferences((current) => ({
                  ...current,
                  signInAlerts: value,
                }))
              }
            />

            <SecurityToggle
              title="Security emails"
              text="Receive important account and permission updates."
              checked={preferences.securityEmails}
              onChange={(value) =>
                setPreferences((current) => ({
                  ...current,
                  securityEmails: value,
                }))
              }
            />

            <label className="trust12-session-field">
              Session timeout
              <select
                value={preferences.sessionTimeoutMinutes}
                onChange={(event) =>
                  setPreferences((current) => ({
                    ...current,
                    sessionTimeoutMinutes: Number(event.target.value),
                  }))
                }
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={240}>4 hours</option>
                <option value={480}>8 hours</option>
              </select>
            </label>

            {message && <div className="trust12-success-message">{message}</div>}

            <button className="button" onClick={save} type="button">
              Save Security Preferences
            </button>
          </section>

          <section className="trust12-panel">
            <span className="eyebrow">Recommended role policy</span>
            <h2>Who should use MFA?</h2>

            <div className="trust12-role-list">
              <div><strong>Owner</strong><span>MFA required</span></div>
              <div><strong>Administrator</strong><span>MFA required</span></div>
              <div><strong>Team Leader</strong><span>Strongly encouraged</span></div>
              <div><strong>Team Member</strong><span>Available</span></div>
              <div><strong>Friendship discovery</strong><span>Recommended for all</span></div>
            </div>
          </section>
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
    <label className="trust12-toggle">
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
