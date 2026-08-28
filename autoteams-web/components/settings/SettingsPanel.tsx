"use client";

import { useEffect, useState } from "react";
import {
  UiPreferences,
  defaultPreferences,
  loadPreferences,
  savePreferences,
} from "@/lib/ui-preferences";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export function SettingsPanel() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UiPreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  function update<K extends keyof UiPreferences>(key: K, value: UiPreferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function persist() {
    savePreferences(preferences);
    setSaved(true);
  }

  return (
    <div className="settings-layout">
      <aside className="settings-sidebar">
        <span className="eyebrow">Account settings</span>
        <h2>Personalise TeamScience.ai</h2>
        <p>Control appearance, notifications and the experience used across your workspace.</p>
      </aside>

      <section className="settings-content">
        <div className="settings-card">
          <div className="settings-heading">
            <div><h3>Profile</h3><p>Your authenticated TeamScience.ai identity.</p></div>
            <span className="badge">Firebase</span>
          </div>
          <div className="settings-profile">
            <span className="account-avatar">
              {(user?.displayName || user?.email || "M").charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user?.displayName || "TeamScience.ai Member"}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-heading">
            <div><h3>Appearance</h3><p>Choose how the application looks and feels.</p></div>
          </div>
          <div className="settings-option-grid">
            <button
              className={preferences.appearance === "light" ? "selected" : ""}
              onClick={() => update("appearance", "light")}
              type="button"
            >
              <span>☀</span><strong>Light</strong><small>Bright professional workspace</small>
            </button>
            <button
              className={preferences.appearance === "dark" ? "selected" : ""}
              onClick={() => update("appearance", "dark")}
              type="button"
            >
              <span>◐</span><strong>Dark</strong><small>Reduced-glare interface</small>
            </button>
          </div>

          <Toggle
            title="Compact layout"
            text="Reduce spacing to display more information."
            checked={preferences.compactMode}
            onChange={(checked) => update("compactMode", checked)}
          />
        </div>

        <div className="settings-card">
          <div className="settings-heading">
            <div><h3>Notifications</h3><p>Choose which product updates should reach you.</p></div>
          </div>
          <Toggle
            title="Email notifications"
            text="Receive important TeamScience.ai account updates."
            checked={preferences.emailNotifications}
            onChange={(checked) => update("emailNotifications", checked)}
          />
          <Toggle
            title="New matches"
            text="Be notified when a strong candidate or team match is available."
            checked={preferences.matchNotifications}
            onChange={(checked) => update("matchNotifications", checked)}
          />
          <Toggle
            title="AI insights"
            text="Receive new Team DNA and collaboration recommendations."
            checked={preferences.aiInsightNotifications}
            onChange={(checked) => update("aiInsightNotifications", checked)}
          />
        </div>

        <div className="settings-card">
          <div className="settings-heading">
            <div>
              <h3>Privacy and security</h3>
              <p>Review your workspace profile, consent and account protection.</p>
            </div>
          </div>
          <div className="actions">
            <Link className="button secondary" href="/profile">
              My Profile
            </Link>
            <Link className="button secondary" href="/demo">
              Demo Environment
            </Link>
            <Link className="button secondary" href="/profile/security">
              Account Security
            </Link>
            <Link className="button secondary" href="/profile/privacy">
              Privacy Centre
            </Link>
          </div>
        </div>

        <div className="settings-save">
          {saved && <span>✓ Settings saved</span>}
          <button className="button" onClick={persist} type="button">Save settings</button>
        </div>
      </section>
    </div>
  );
}

function Toggle({
  title,
  text,
  checked,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="settings-toggle">
      <span><strong>{title}</strong><small>{text}</small></span>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <i />
    </label>
  );
}
