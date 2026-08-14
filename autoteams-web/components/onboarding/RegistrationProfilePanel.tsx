"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  ContextMode,
  ContextualProfile,
  contextLabel,
  createContextualProfile,
  loadActiveContextualProfileId,
  loadContextualProfiles,
  saveActiveContextualProfileId,
  saveContextualProfiles,
} from "@/lib/contextual-profiles";

const modes: Array<{
  id: ContextMode;
  title: string;
  text: string;
}> = [
  {
    id: "business",
    title: "Business",
    text: "Work, organisations, delivery, skills and professional Team DNA.",
  },
  {
    id: "friendship",
    title: "Friendship",
    text: "Friendships, social groups, shared interests and compatibility.",
  },
  {
    id: "community",
    title: "Community",
    text: "Community groups, volunteering, causes, contribution and commitment.",
  },
  {
    id: "sports",
    title: "Sports",
    text: "Sports, clubs, participation roles, experience and teamwork style.",
  },
  {
    id: "education",
    title: "Education",
    text: "Education, study groups, learning preferences and project roles.",
  },
];

export function RegistrationProfilePanel() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [activeId, setActiveId] = useState("");
  const [interests, setInterests] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loaded = loadContextualProfiles();

    if (loaded.length === 0) {
      setProfiles([]);
      setActiveId("");
      setInterests("");
      return;
    }

    const requestedId = loadActiveContextualProfileId();
    const selectedId =
      loaded.find((item) => item.id === requestedId)?.id ||
      loaded[0].id;

    setProfiles(loaded);
    setActiveId(selectedId);
    setInterests(
      loaded.find((item) => item.id === selectedId)?.interests.join(", ") || "",
    );
  }, [user]);

  const profile = useMemo(
    () => profiles.find((item) => item.id === activeId) || null,
    [activeId, profiles],
  );

  function replaceProfile(next: ContextualProfile) {
    setProfiles((current) =>
      current.map((item) => (item.id === next.id ? next : item)),
    );
    setSaved(false);
  }

  function update<K extends keyof ContextualProfile>(
    key: K,
    value: ContextualProfile[K],
  ) {
    if (!profile) return;
    replaceProfile({ ...profile, [key]: value });
  }

  function updateField(
    key: string,
    value: string | string[] | boolean,
  ) {
    if (!profile) return;
    replaceProfile({
      ...profile,
      fields: { ...profile.fields, [key]: value },
    });
  }

  function addProfile(mode: ContextMode) {
    const existing =
      profiles.find(
        (item) =>
          item.mode === mode,
      );

    if (existing) {
      selectProfile(existing.id);
      return;
    }

    const next =
      createContextualProfile(
        mode,
        user?.displayName || "",
      );

    const updated = [
      ...profiles,
      next,
    ];

    setProfiles(updated);
    saveContextualProfiles(updated);
    setActiveId(next.id);
    saveActiveContextualProfileId(next.id);
    setInterests("");
    setSaved(false);
  }

  function selectProfile(id: string) {
    setActiveId(id);
    saveActiveContextualProfileId(id);
    setInterests(
      profiles.find((item) => item.id === id)?.interests.join(", ") || "",
    );
    setSaved(false);
  }

  function removeProfile(id: string) {
    if (profiles.length === 1) return;
    const updated = profiles.filter((item) => item.id !== id);
    setProfiles(updated);
    saveContextualProfiles(updated);
    selectProfile(updated[0].id);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    const updatedProfile: ContextualProfile = {
      ...profile,
      interests: interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    const updated = profiles.map((item) =>
      item.id === profile.id ? updatedProfile : item,
    );
    setProfiles(updated);
    saveContextualProfiles(updated);
    saveActiveContextualProfileId(profile.id);
    setSaved(true);
  }

  if (!profile) {
    return (
      <main className="context125-page">
        <section className="context125-hero">
          <div className="container">
            <span className="eyebrow">Create your first Atlas Profile</span>
            <h1>Which part of your life do you want Atlas to understand first?</h1>
            <p>
              Choose one profile context to begin. You can add the other
              contexts later from My Profile.
            </p>
          </div>
        </section>

        <section className="context125-body">
          <div
            className="container"
            style={{
              display: "grid",
              gap: 18,
              paddingTop: 24,
              paddingBottom: 36,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    addProfile(mode.id)
                  }
                  type="button"
                  style={{
                    display: "grid",
                    gap: 10,
                    minHeight: 150,
                    padding: 20,
                    textAlign: "left",
                    color: "#f8fafc",
                    background:
                      "linear-gradient(145deg, rgba(79,70,229,.10), rgba(15,23,42,.92))",
                    border:
                      "1px solid rgba(129,140,248,.28)",
                    borderRadius: 16,
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: "grid",
                      width: 42,
                      height: 42,
                      placeItems: "center",
                      borderRadius: 12,
                      background:
                        "rgba(99,102,241,.16)",
                      color: "#c7d2fe",
                      fontSize: 20,
                    }}
                  >
                    {modeIcon(mode.id)}
                  </span>

                  <strong
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {mode.title}
                  </strong>

                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {mode.text}
                  </span>

                  <span
                    style={{
                      color: "#c4b5fd",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Create {mode.title} Profile →
                  </span>
                </button>
              ))}
            </div>

            <p
              style={{
                margin: 0,
                color: "#8794aa",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              AutoTeams uses five canonical Atlas Profile contexts:
              Business, Friendship, Community, Sports and Education.
              Volunteering is included within Community.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="context125-page">
      <section className="context125-hero">
        <div className="container">
          <span className="eyebrow">Contextual profiles</span>
          <h1>Use a different Team DNA for each part of your life.</h1>
          <p>
            A person may behave differently at work, with friends, in a sports
            team or while volunteering. AutoTeams keeps those contexts separate.
          </p>
        </div>
      </section>

      <section className="context125-body">
        <form className="container context125-layout" onSubmit={submit}>
          <aside className="context125-profile-list">
            <span className="eyebrow">My Atlas Profiles</span>
            <h2>Select a profile context</h2>

            <div className="context125-tabs">
              {profiles.map((item) => (
                <button
                  className={item.id === activeId ? "active" : ""}
                  key={item.id}
                  onClick={() => selectProfile(item.id)}
                  type="button"
                >
                  <span>{modeIcon(item.mode)}</span>
                  <div>
                    <strong>{item.label || contextLabel(item.mode)}</strong>
                    <small>{contextLabel(item.mode)}</small>
                  </div>
                </button>
              ))}
            </div>

            <details className="context125-add-profile">
              <summary>＋ Add another profile</summary>
              <div>
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => addProfile(mode.id)}
                    type="button"
                  >
                    {mode.title}
                  </button>
                ))}
              </div>
            </details>

            {profiles.length > 1 && (
              <button
                className="button secondary"
                onClick={() => removeProfile(profile.id)}
                type="button"
              >
                Remove This Profile
              </button>
            )}
          </aside>

          <section className="context125-main">
            <div className="context125-panel">
              <div className="context125-heading">
                <div>
                  <span className="eyebrow">Profile context</span>
                  <h2>{contextLabel(profile.mode)}</h2>
                  <p>
                    These fields and Atlas questions are specific to this
                    context.
                  </p>
                </div>
                <span className="context125-mode-icon">
                  {modeIcon(profile.mode)}
                </span>
              </div>

              <label>
                Profile name
                <input
                  value={profile.label}
                  onChange={(event) => update("label", event.target.value)}
                  placeholder={contextLabel(profile.mode)}
                />
              </label>

              <div className="context125-form-grid">
                <label>
                  Preferred name
                  <input
                    required
                    value={profile.preferredName}
                    onChange={(event) =>
                      update("preferredName", event.target.value)
                    }
                  />
                </label>

                <label>
                  General location
                  <input
                    value={profile.generalLocation}
                    onChange={(event) =>
                      update("generalLocation", event.target.value)
                    }
                    placeholder="Town, city or region"
                  />
                </label>

                <label>
                  Availability
                  <input
                    value={profile.availability}
                    onChange={(event) =>
                      update("availability", event.target.value)
                    }
                    placeholder="For example: weekdays, evenings"
                  />
                </label>

                <label className="context125-wide">
                  Interests or relevant skills
                  <textarea
                    value={interests}
                    onChange={(event) => setInterests(event.target.value)}
                    placeholder={interestPlaceholder(profile.mode)}
                  />
                  <small>Separate items with commas.</small>
                </label>
              </div>
            </div>

            <div className="context125-panel">
              <span className="eyebrow">Context details</span>
              <h2>{contextHeading(profile.mode)}</h2>
              <ContextFields profile={profile} updateField={updateField} />
            </div>
          </section>

          <aside className="context125-consent">
            <div className="context125-panel">
              <span className="eyebrow">Privacy and consent</span>
              <h2>Control this profile separately.</h2>

              <Consent
                title="Visible in this workspace"
                text="Approved users can see that this contextual profile is available."
                checked={profile.profileVisible}
                onChange={(value) => update("profileVisible", value)}
              />
              <Consent
                title="Allow Atlas matching"
                text="Atlas may include this profile in recommendations for this context."
                checked={profile.allowTeamMatching}
                onChange={(value) => update("allowTeamMatching", value)}
              />
              <Consent
                title="Allow aggregated insights"
                text="Use this profile in group-level analysis."
                checked={profile.allowAggregatedInsights}
                onChange={(value) =>
                  update("allowAggregatedInsights", value)
                }
              />
              <Consent
                title="Show profile photo"
                text="The photo remains optional and is never used for matching."
                checked={profile.photoVisible}
                onChange={(value) => update("photoVisible", value)}
              />
              {profile.mode !== "business" && (
                <Consent
                  title="Allow discovery"
                  text="Allow this profile to appear in approved discovery experiences."
                  checked={profile.allowDiscovery}
                  onChange={(value) => update("allowDiscovery", value)}
                />
              )}

              <div className="context125-boundary">
                <strong>Context boundary</strong>
                <p>
                  Answers from this profile will not be used for a different
                  workspace context.
                </p>
              </div>

              {saved && (
                <div className="context125-saved">
                  ✓ Contextual profile saved
                </div>
              )}

              <button className="button" type="submit">
                Save {contextLabel(profile.mode)}
              </button>
              <Link className="button secondary" href="/atlas">
                Continue to Atlas Questions
              </Link>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}

function ContextFields({
  profile,
  updateField,
}: {
  profile: ContextualProfile;
  updateField: (
    key: string,
    value: string | string[] | boolean,
  ) => void;
}) {
  const field = (key: string) => String(profile.fields[key] || "");

  if (profile.mode === "business") {
    return (
      <div className="context125-form-grid">
        <TextField label="Job title" value={field("jobTitle")} onChange={(v) => updateField("jobTitle", v)} />
        <TextField label="Department" value={field("department")} onChange={(v) => updateField("department", v)} />
        <SelectField label="Experience level" value={field("experienceLevel")} options={["","Early career","Experienced","Senior","Leadership"]} onChange={(v) => updateField("experienceLevel", v)} />
        <TextField label="Time zone" value={field("timezone")} onChange={(v) => updateField("timezone", v)} />
      </div>
    );
  }

  if (profile.mode === "friendship") {
    return (
      <div className="context125-form-grid">
        <SelectField label="Age range" value={field("ageRange")} options={["","18–24","25–34","35–44","45–54","55–64","65+"]} onChange={(v) => updateField("ageRange", v)} />
        <SelectField label="Gender" value={field("gender")} options={["Prefer not to say","Woman","Man","Non-binary","Self-describe privately"]} onChange={(v) => updateField("gender", v)} />
        <SelectField label="Preferred group size" value={field("socialGroupSize")} options={["","One-to-one","Small group","Large group","No preference"]} onChange={(v) => updateField("socialGroupSize", v)} />
        <SelectField label="Planning style" value={field("planningStyle")} options={["","Plan in advance","Flexible plans","Spontaneous","No preference"]} onChange={(v) => updateField("planningStyle", v)} />
      </div>
    );
  }

  if (profile.mode === "community") {
    return (
      <div className="context125-form-grid">
        <TextField label="Community or cause" value={field("cause")} onChange={(v) => updateField("cause", v)} />
        <TextField label="Relevant experience" value={field("relevantExperience")} onChange={(v) => updateField("relevantExperience", v)} />
        <label className="context125-wide">
          Accessibility requirements
          <textarea value={field("accessibilityRequirements")} onChange={(e) => updateField("accessibilityRequirements", e.target.value)} placeholder="Optional and private" />
        </label>
      </div>
    );
  }

  if (profile.mode === "sports") {
    return (
      <div className="context125-form-grid">
        <TextField label="Sport" value={field("sport")} onChange={(v) => updateField("sport", v)} />
        <TextField label="Playing or participation role" value={field("participationRole")} onChange={(v) => updateField("participationRole", v)} />
        <SelectField label="Experience level" value={field("experienceLevel")} options={["","Beginner","Developing","Experienced","Advanced"]} onChange={(v) => updateField("experienceLevel", v)} />
        <TextField label="Preferred position or role" value={field("preferredPosition")} onChange={(v) => updateField("preferredPosition", v)} />
        <SelectField label="Competitive preference" value={field("competitivePreference")} options={["","Recreational","Balanced","Competitive"]} onChange={(v) => updateField("competitivePreference", v)} />
        <SelectField label="Leadership interest" value={field("leadershipInterest")} options={["","Prefer to support","Occasional leadership","Interested in captaincy"]} onChange={(v) => updateField("leadershipInterest", v)} />
      </div>
    );
  }

  return (
    <div className="context125-form-grid">
      <SelectField label="Education level" value={field("educationLevel")} options={["","Further education","Undergraduate","Postgraduate","Professional learning"]} onChange={(v) => updateField("educationLevel", v)} />
      <TextField label="Course or subject" value={field("subject")} onChange={(v) => updateField("subject", v)} />
      <TextField label="Project experience" value={field("projectExperience")} onChange={(v) => updateField("projectExperience", v)} />
      <SelectField label="Presentation confidence" value={field("presentationConfidence")} options={["","Developing","Comfortable","Confident"]} onChange={(v) => updateField("presentationConfidence", v)} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Choose an option"}
          </option>
        ))}
      </select>
    </label>
  );
}

function Consent({
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
    <label className="context125-consent-row">
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function modeIcon(mode: ContextMode): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}

function contextHeading(mode: ContextMode): string {
  return {
    business: "Workplace details",
    friendship: "Social preferences",
    community: "Community contribution",
    sports: "Sports participation",
    education: "Study and project preferences",
  }[mode];
}

function interestPlaceholder(mode: ContextMode): string {
  return {
    business: "Delivery, data, facilitation, product management",
    friendship: "Walking, travel, food, music, events",
    community: "Volunteering, fundraising, events, practical support",
    sports: "Training, coaching, competition, team activities",
    education: "Research, writing, presenting, analysis",
  }[mode];
}
