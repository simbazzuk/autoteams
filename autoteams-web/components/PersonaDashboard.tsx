"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  TeamPersona,
  listPersonas,
  removePersona,
} from "@/lib/personas";

export function PersonaDashboard() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<TeamPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    try {
      setPersonas(await listPersonas(user.uid));
    } catch (caught) {
      console.error(caught);
      setError("Unable to load your Team Personas.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function deleteItem(id: string) {
    if (!user || !window.confirm("Delete this Team Persona?")) return;

    try {
      await removePersona(user.uid, id);
      await refresh();
    } catch (caught) {
      console.error(caught);
      setError("Unable to delete the Team Persona.");
    }
  }

  if (loading) {
    return <div className="card">Loading your Team Personas…</div>;
  }

  if (error) {
    return (
      <div className="card">
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="button" onClick={() => void refresh()} type="button">
          Try again
        </button>
      </div>
    );
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
          <span className="eyebrow">Stored securely</span>
          <h2>
            {personas.length} Team Persona
            {personas.length === 1 ? "" : "s"}
          </h2>
          <p className="lead">
            Signed in as {user?.email || user?.displayName}.
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
              Created{" "}
              {persona.createdAt
                ? persona.createdAt.toLocaleDateString("en-GB")
                : "recently"}
            </div>

            <div className="persona-card-actions">
              <Link
                className="button secondary small"
                href={`/personas/${persona.id}/edit`}
              >
                Edit
              </Link>
              <Link className="button secondary small" href="/intelligence">
                Team DNA
              </Link>
              <Link className="button small" href="/matches">
                Find My Team
              </Link>
              <button
                className="button danger small"
                onClick={() => void deleteItem(persona.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
