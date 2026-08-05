"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type StoredPersona = {
  id: string;
  accountName: string;
  city: string;
  teamType: string;
  values: string[];
  createdAt: string;
};

const STORAGE_KEY = "autoteams-personas";

export function loadPersonas(): StoredPersona[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredPersona[]) : [];
  } catch {
    return [];
  }
}

export function savePersona(persona: StoredPersona): void {
  const existing = loadPersonas();
  const updated = [persona, ...existing.filter((item) => item.id !== persona.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deletePersona(id: string): void {
  const updated = loadPersonas().filter((persona) => persona.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function PersonaDashboard() {
  const [personas, setPersonas] = useState<StoredPersona[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPersonas(loadPersonas());
    setLoaded(true);
  }, []);

  function removePersona(id: string) {
    deletePersona(id);
    setPersonas(loadPersonas());
  }

  if (!loaded) {
    return <div className="card">Loading your Team Personas…</div>;
  }

  if (personas.length === 0) {
    return (
      <div className="dashboard-empty">
        <div className="card">
          <span className="icon">👤</span>
          <h2>No Team Personas yet.</h2>
          <p>
            Create your first Friendship, Business, Sports, Education, Events
            or Community Persona.
          </p>
          <Link className="button" href="/register">
            Create a Team Persona
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-toolbar">
        <div>
          <span className="eyebrow">Saved locally</span>
          <h2>{personas.length} Team Persona{personas.length === 1 ? "" : "s"}</h2>
          <p className="lead">
            These profiles are currently stored only in this browser.
          </p>
        </div>
        <Link className="button" href="/register">
          Create another Persona
        </Link>
      </div>

      <div className="persona-grid">
        {personas.map((persona) => (
          <article className="card persona-card" key={persona.id}>
            <div className="persona-card-heading">
              <div className="persona-id">
                <span className="avatar">
                  {persona.accountName.charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{persona.teamType} Persona</strong>
                  <small>
                    {persona.accountName} • {persona.city}
                  </small>
                </span>
              </div>
              <span className="badge">Ready</span>
            </div>

            <div className="chips">
              {persona.values.slice(0, 5).map((value, index) => (
                <span className="chip" key={`${persona.id}-${index}`}>
                  {value}
                </span>
              ))}
            </div>

            <div className="persona-card-meta">
              Created {new Date(persona.createdAt).toLocaleDateString("en-GB")}
            </div>

            <div className="persona-card-actions">
              <Link className="button small" href="/why-this-team">
                Find My Team
              </Link>
              <button
                className="button secondary small"
                type="button"
                onClick={() => removePersona(persona.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="notice">
        <strong>Prototype storage:</strong> clearing browser data or using a
        different device will remove these personas. A future version will save
        them securely against an authenticated account.
      </div>
    </>
  );
}
