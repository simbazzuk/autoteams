"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ContextualProfile,
  loadContextualProfiles,
} from "@/lib/contextual-profiles";
import {
  ProfilePrivacySettings,
  loadProfilePrivacy,
  upsertProfilePrivacy,
} from "@/lib/profile-privacy-security";

export function ProfilePrivacyDashboard() {
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [settings, setSettings] = useState<ProfilePrivacySettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loaded = loadContextualProfiles();
    setProfiles(loaded);
    const firstId = loaded[0]?.id || "";
    setSelectedId(firstId);

    if (firstId) {
      const profile = loaded[0];
      setSettings(
        loadProfilePrivacy(firstId, {
          allowMatching: profile.allowTeamMatching,
          allowAggregatedInsights: profile.allowAggregatedInsights,
          allowPhotoDisplay: profile.photoVisible,
          allowDiscovery: profile.allowDiscovery,
        }),
      );
    }
  }, []);

  const selectedProfile = useMemo(
    () => profiles.find((item) => item.id === selectedId) || null,
    [profiles, selectedId],
  );

  function selectProfile(profile: ContextualProfile) {
    setSelectedId(profile.id);
    setSettings(
      loadProfilePrivacy(profile.id, {
        allowMatching: profile.allowTeamMatching,
        allowAggregatedInsights: profile.allowAggregatedInsights,
        allowPhotoDisplay: profile.photoVisible,
        allowDiscovery: profile.allowDiscovery,
      }),
    );
    setSaved(false);
  }

  function update<K extends keyof ProfilePrivacySettings>(
    key: K,
    value: ProfilePrivacySettings[K],
  ) {
    setSettings((current) =>
      current ? { ...current, [key]: value } : current,
    );
    setSaved(false);
  }

  function save() {
    if (!settings) return;
    upsertProfilePrivacy({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  return (
    <main className="profile130b-page">
      <section className="profile130b-hero">
        <div className="container">
          <span className="eyebrow">Profile Privacy</span>
          <h1>Control each contextual profile separately.</h1>
          <p>
            Business, friendship, community, sports and education profiles can
            have different visibility, discovery and Atlas consent settings.
          </p>
        </div>
      </section>

      <section className="profile130b-body">
        <div className="container profile130b-layout">
          <aside className="profile130b-profile-selector">
            <span className="eyebrow">Context profiles</span>
            <h2>Choose a profile</h2>

            <div className="profile130b-profile-list">
              {profiles.map((profile) => (
                <button
                  className={profile.id === selectedId ? "active" : ""}
                  key={profile.id}
                  onClick={() => selectProfile(profile)}
                  type="button"
                >
                  <span>{modeIcon(profile.mode)}</span>
                  <div>
                    <strong>{profile.label}</strong>
                    <small>{profile.mode}</small>
                  </div>
                </button>
              ))}
            </div>

            <Link className="button secondary" href="/profile">
              Back to My Profile
            </Link>
          </aside>

          {selectedProfile && settings ? (
            <section className="profile130b-main">
              <article className="profile130b-panel">
                <div className="profile130b-heading">
                  <div>
                    <span className="eyebrow">Visibility</span>
                    <h2>{selectedProfile.label}</h2>
                    <p>
                      Select who can see this profile and whether it may appear
                      in an approved discovery experience.
                    </p>
                  </div>
                  <span className="profile130b-context-icon">
                    {modeIcon(selectedProfile.mode)}
                  </span>
                </div>

                <div className="profile130b-visibility-grid">
                  {[
                    {
                      value: "private",
                      title: "Private",
                      text: "Only you can access this profile.",
                    },
                    {
                      value: "workspace",
                      title: "Workspace only",
                      text: "Visible to approved users in the current workspace.",
                    },
                    {
                      value: "discovery",
                      title: "Approved discovery",
                      text: "Eligible for discovery where the profile context permits it.",
                    },
                  ].map((option) => (
                    <label
                      className={
                        settings.visibility === option.value
                          ? "selected"
                          : ""
                      }
                      key={option.value}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        checked={settings.visibility === option.value}
                        onChange={() =>
                          update(
                            "visibility",
                            option.value as ProfilePrivacySettings["visibility"],
                          )
                        }
                      />
                      <strong>{option.title}</strong>
                      <small>{option.text}</small>
                    </label>
                  ))}
                </div>
              </article>

              <article className="profile130b-panel">
                <span className="eyebrow">Atlas and data use</span>
                <h2>Choose how this profile may be used.</h2>

                <div className="profile130b-toggle-list">
                  <PrivacyToggle
                    title="Allow Atlas matching"
                    text="Include this profile in eligible team or group recommendations."
                    checked={settings.allowMatching}
                    onChange={(value) => update("allowMatching", value)}
                  />
                  <PrivacyToggle
                    title="Allow aggregated insights"
                    text="Use this profile in team-level analysis without exposing private answers."
                    checked={settings.allowAggregatedInsights}
                    onChange={(value) =>
                      update("allowAggregatedInsights", value)
                    }
                  />
                  <PrivacyToggle
                    title="Allow profile photo display"
                    text="The photo remains optional and is never used for Atlas scoring."
                    checked={settings.allowPhotoDisplay}
                    onChange={(value) =>
                      update("allowPhotoDisplay", value)
                    }
                  />
                  <PrivacyToggle
                    title="Allow discovery"
                    text="Make this profile eligible for approved friendship, community or sports discovery."
                    checked={settings.allowDiscovery}
                    onChange={(value) => update("allowDiscovery", value)}
                    disabled={selectedProfile.mode === "business"}
                  />
                  <PrivacyToggle
                    title="Allow research use"
                    text="Optional future use of de-identified information for product research."
                    checked={settings.allowResearch}
                    onChange={(value) => update("allowResearch", value)}
                  />
                  <PrivacyToggle
                    title="Make profile searchable"
                    text="Allow approved workspace users to find this profile by name."
                    checked={settings.searchable}
                    onChange={(value) => update("searchable", value)}
                  />
                </div>

                <div className="profile130b-sensitive-note">
                  <strong>Atlas protection</strong>
                  <p>
                    Atlas must not infer age, gender, ethnicity, religion,
                    health, sexual orientation or other sensitive
                    characteristics from names, photographs or written answers.
                  </p>
                </div>

                {saved && (
                  <div className="profile130b-success">
                    ✓ Privacy settings saved
                  </div>
                )}

                <button className="button" onClick={save} type="button">
                  Save Privacy Settings
                </button>
              </article>
            </section>
          ) : (
            <section className="profile130b-panel">
              <h2>No contextual profiles available.</h2>
              <p>Create a profile before configuring privacy controls.</p>
              <Link className="button" href="/profile">
                Create Profile
              </Link>
            </section>
          )}

          <aside className="profile130b-side">
            <article className="profile130b-panel">
              <span className="eyebrow">Privacy summary</span>
              <h2>Current controls</h2>

              {settings && (
                <div className="profile130b-summary-list">
                  <div>
                    <span>Visibility</span>
                    <strong>{settings.visibility}</strong>
                  </div>
                  <div>
                    <span>Atlas matching</span>
                    <strong>{settings.allowMatching ? "Allowed" : "Blocked"}</strong>
                  </div>
                  <div>
                    <span>Insights</span>
                    <strong>
                      {settings.allowAggregatedInsights ? "Allowed" : "Blocked"}
                    </strong>
                  </div>
                  <div>
                    <span>Discovery</span>
                    <strong>
                      {settings.allowDiscovery ? "Allowed" : "Blocked"}
                    </strong>
                  </div>
                </div>
              )}
            </article>

            <article className="profile130b-panel">
              <span className="eyebrow">Data controls</span>
              <h2>Your rights and actions</h2>

              <div className="profile130b-action-list">
                <Link href="/privacy">
                  <strong>Privacy Centre</strong>
                  <span>Export or remove locally stored profile data →</span>
                </Link>
                <Link href="/security">
                  <strong>Account Security</strong>
                  <span>Review email verification and MFA readiness →</span>
                </Link>
                <Link href="/terms">
                  <strong>Terms of Use</strong>
                  <span>Read the current early-access terms →</span>
                </Link>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}

function PrivacyToggle({
  title,
  text,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={disabled ? "disabled" : ""}>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <input
        type="checkbox"
        checked={disabled ? false : checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function modeIcon(mode: ContextualProfile["mode"]): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}
