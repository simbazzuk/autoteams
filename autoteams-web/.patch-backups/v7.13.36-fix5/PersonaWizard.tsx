"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPersona } from "@/lib/personas";
import { useAuth } from "./AuthProvider";

const types = [
  ["Friendship", "🤝", "Meaningful local groups"],
  ["Business", "💼", "Project and innovation teams"],
  ["Sports", "⚽", "Balanced practical teams"],
  ["Education", "🎓", "Study and project groups"],
  ["Events", "🎟️", "Networking groups"],
  ["Community", "🌍", "Volunteer and local teams"],
] as const;

const prompts: Record<string, string[]> = {
  Friendship: [
    "Genuine local friendships",
    "Weekends",
    "Within 10 miles",
    "Technology, football, restaurants, travel",
    "4–6 people",
  ],
  Business: [
    "Principal AI Engineer",
    "Financial services",
    "AI architecture, GCP, platform engineering",
    "Collaborative and structured",
    "Balanced project team",
  ],
  Sports: [
    "Five-a-side football",
    "Intermediate",
    "Midfield",
    "Friendly but competitive",
    "Weekend mornings",
  ],
  Education: [
    "Computer Science",
    "Architecture, research, presentation",
    "Discussion and practical work",
    "Weekday afternoons",
    "Reliable study group",
  ],
  Events: [
    "AI and Cloud conference",
    "Agentic AI, GCP",
    "Meet collaborators",
    "Senior technical leaders",
    "4–6 people",
  ],
  Community: [
    "Homelessness support",
    "Technology, data, organising",
    "Weekends",
    "Leeds area",
    "Deliver local initiatives",
  ],
};

export function PersonaWizard() {
  // v7.13.36-fix4: read invite mode client-side without useSearchParams.
  // This keeps /register prerenderable in Next.js 16.
  const [inviteMode, setInviteMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInviteMode(Boolean(params.get("invite")));
  }, []);
const router = useRouter();
  const { user, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(user?.displayName || "");
  const [city, setCity] = useState("");
  const [type, setType] = useState("Friendship");
  const [values, setValues] = useState(prompts.Friendship);

  function choose(nextType: string) {
    setType(nextType);
    setValues(prompts[nextType]);
  }

  function update(index: number, value: string) {
    setValues((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  }

  async function persistPersona() {
    if (!user) {
      router.push("/login?next=/register");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createPersona(user.uid, {
        accountName: name || user.displayName || "Member",
        city: city || "Not specified",
        teamType: type,
        values,
      });
      setSaved(true);
      setStep(4);
    } catch (caught) {
      console.error(caught);
      setError("Unable to save your Team Persona. Check Firebase setup.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={inviteMode ? "wizard invite-mode" : "wizard"}>Checking your account…</div>;
  }

  if (!user) {
    return (
      <div className="wizard auth-required">
        <span className="eyebrow">Account required</span>
        <h2>Log in before creating a Team Persona.</h2>
        <p className="lead">
          Your persona will be saved securely and available across devices.
        </p>
        <div className="actions">
          <button
            className="button"
            onClick={() => router.push("/login?next=/register")}
            type="button"
          >
            Log in
          </button>
          <button
            className="button secondary"
            onClick={() => router.push("/signup?next=/register")}
            type="button"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={inviteMode ? "wizard invite-mode" : "wizard"}>
      <div className="wizard-progress">
        {[1, 2, 3, 4].map((number) => (
          <span className={number <= step ? "active" : ""} key={number} />
        ))}
      </div>

      {step === 1 && (
        <section>
          <span className="eyebrow">Step 1</span>
          <h2>Confirm your core profile</h2>
          <div className="form-grid">
            <label>
              Display name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              Email
              <input disabled value={user.email || ""} />
            </label>
            <label>
              City
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </label>
            <label>
              Account status
              <input
                disabled
                value={user.emailVerified ? "Email verified" : "Verification sent"}
              />
            </label>
          </div>
          <div className="wizard-actions end">
            <button className="button" onClick={() => setStep(2)} type="button">
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <span className="eyebrow">Step 2</span>
          <h2>What kind of team are you looking for?</h2>
          <div className="type-grid">
            {types.map(([teamType, icon, description]) => (
              <button
                className={`type-card ${type === teamType ? "selected" : ""}`}
                onClick={() => choose(teamType)}
                key={teamType}
                type="button"
              >
                <span>{icon}</span>
                <strong>{teamType}</strong>
                <small>{description}</small>
              </button>
            ))}
          </div>
          <div className="wizard-actions">
            <button
              className="button secondary"
              onClick={() => setStep(1)}
              type="button"
            >
              Back
            </button>
            <button className="button" onClick={() => setStep(3)} type="button">
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <span className="eyebrow">Step 3</span>
          <h2>Create your {type} Persona</h2>
          <p className="lead">
            Questions change based on the selected team experience.
          </p>
          <div className="form-grid">
            {values.map((value, index) => (
              <label key={index}>
                Matching signal {index + 1}
                <input
                  value={value}
                  onChange={(event) => update(index, event.target.value)}
                />
              </label>
            ))}
          </div>
          <div className="notice">
            Sensitive information should be optional and collected only where
            relevant, lawful and clearly explained.
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="wizard-actions">
            <button
              className="button secondary"
              onClick={() => setStep(2)}
              type="button"
            >
              Back
            </button>
            <button
              className="button"
              disabled={saving}
              onClick={() => void persistPersona()}
              type="button"
            >
              {saving ? "Saving…" : "Create Persona"}
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section>
          <span className="eyebrow">
            {saved ? "Persona saved to Firestore" : "Persona created"}
          </span>
          <h2>Your profile is ready for matching.</h2>
          <div className="persona">
            <div className="persona-head">
              <div className="persona-id">
                <span className="avatar">
                  {(name || "M").charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{name || "Member"}</strong>
                  <small>
                    {type} Persona • {city || "Not specified"}
                  </small>
                </span>
              </div>
              <span className="badge">Ready for matching</span>
            </div>
            <div className="chips">
              {values.map((value, index) => (
                <span className="chip" key={`${value}-${index}`}>
                  {value}
                </span>
              ))}
            </div>
          </div>
          <div className="wizard-actions">
            <button
              className="button secondary"
              onClick={() => setStep(2)}
              type="button"
            >
              Create another Persona
            </button>
            <button
              className="button"
              onClick={() => router.push("/dashboard")}
              type="button"
            >
              View Dashboard
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
