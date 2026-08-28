"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { TeamPersona, listPersonas, removePersona } from "@/lib/personas";

function completeness(persona: TeamPersona) {
  const populated = persona.values.filter((value) => value.trim().length > 2).length;
  const location = persona.city && persona.city !== "Not specified" ? 15 : 0;
  return Math.min(100, 30 + Math.round((populated / Math.max(persona.values.length, 1)) * 55) + location);
}

export function SmartDashboard() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<TeamPersona[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setPersonas(await listPersonas(user.uid));
    setLoading(false);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const average = useMemo(
    () => personas.length
      ? Math.round(personas.reduce((sum, persona) => sum + completeness(persona), 0) / personas.length)
      : 0,
    [personas]
  );

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  async function remove(id: string) {
    if (!user || !window.confirm("Delete this Team Persona?")) return;
    await removePersona(user.uid, id);
    await refresh();
  }

  if (loading) return <div className="card">Loading your dashboard…</div>;

  return (
    <div className="smart-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">Your TeamScience.ai workspace</span>
          <h1>Welcome back, {firstName} 👋</h1>
          <p>Build your Team DNA, improve your profiles and create teams around a real purpose.</p>
        </div>
        <Link className="button" href="/teamguide">Talk to TeamGuide</Link>
      </section>

      <section className="dashboard-kpis">
        <div className="card dashboard-kpi"><span>Team Personas</span><strong>{personas.length}</strong><small>Reusable profiles</small></div>
        <div className="card dashboard-kpi"><span>Profile completeness</span><strong>{average}%</strong><small>Across all personas</small></div>
        <div className="card dashboard-kpi"><span>AI capability</span><strong>Live</strong><small>Gemini Team DNA</small></div>
        <div className="card dashboard-kpi"><span>Trust model</span><strong>Level 1</strong><small>Email authenticated</small></div>
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-primary">
          <div className="dashboard-section-heading">
            <div><span className="eyebrow">Your profiles</span><h2>Team Personas</h2></div>
            <Link className="button secondary small" href="/register">Create Persona</Link>
          </div>

          {personas.length === 0 ? (
            <div className="card dashboard-empty">
              <span className="icon">👤</span><h3>Create your first Team Persona</h3>
              <p>Separate friendship, business, sport or community goals while keeping one account.</p>
              <Link className="button" href="/register">Get started</Link>
            </div>
          ) : (
            <div className="dashboard-persona-list">
              {personas.map((persona) => {
                const score = completeness(persona);
                return (
                  <article className="card dashboard-persona" key={persona.id}>
                    <div className="dashboard-persona-top">
                      <div className="persona-id">
                        <span className="avatar">{persona.accountName.charAt(0).toUpperCase()}</span>
                        <span><strong>{persona.teamType} Persona</strong><small>{persona.accountName} • {persona.city}</small></span>
                      </div>
                      <span className="badge">{score}% complete</span>
                    </div>
                    <div className="bar dashboard-completion"><span style={{ width: `${score}%` }} /></div>
                    <div className="chips">{persona.values.slice(0,4).map((value,index)=><span className="chip" key={`${persona.id}-${index}`}>{value}</span>)}</div>
                    <div className="dashboard-persona-actions">
                      <Link className="button secondary small" href={`/personas/${persona.id}/edit`}>Edit</Link>
                      <Link className="button secondary small" href="/intelligence">Team DNA</Link>
                      <Link className="button small" href="/matches">Find matches</Link>
                      <button className="button danger small" onClick={() => void remove(persona.id)} type="button">Delete</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="dashboard-side">
          <div className="card next-action-card">
            <span className="eyebrow">Recommended next action</span><span className="icon">🧠</span>
            <h3>Create a richer Team DNA</h3>
            <p>Let TeamGuide ask a short series of questions and turn your answers into an explainable profile.</p>
            <Link className="button" href="/teamguide">Start AI interview</Link>
          </div>
          <div className="card">
            <span className="eyebrow">Build a complete team</span><h3>AI Team Designer</h3>
            <p>Define a purpose, roles and team size. AutoTeams proposes a balanced design.</p>
            <Link className="button secondary" href="/team-designer">Design a team</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
