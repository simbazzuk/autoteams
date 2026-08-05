"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AtlasOrb } from "@/components/AtlasOrb";
import { TeamPersona, listPersonas } from "@/lib/personas";
import { loadNotifications } from "@/lib/notifications";
import { DashboardSidebar } from "./DashboardSidebar";
import { MetricTile, SectionHeader, Skeleton, StatusBadge } from "@/components/ui";

function profileCompletion(persona: TeamPersona): number {
  const filled = persona.values.filter((value) => value.trim().length > 2).length;
  const location = persona.city && persona.city !== "Not specified" ? 10 : 0;
  return Math.min(
    100,
    35 + Math.round((filled / Math.max(persona.values.length, 1)) * 55) + location,
  );
}

export function CommercialDashboard() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<TeamPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setPersonas(await listPersonas(user.uid));
    setUnread(loadNotifications().filter((notification) => !notification.read).length);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const averageCompletion = useMemo(
    () =>
      personas.length
        ? Math.round(
            personas.reduce(
              (sum, persona) => sum + profileCompletion(persona),
              0,
            ) / personas.length,
          )
        : 0,
    [personas],
  );

  const firstName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  const recommendations = personas.length ? Math.min(5, personas.length + 2) : 1;

  return (
    <div className="dashboard-product-shell commercial-dashboard-shell">
      <DashboardSidebar />

      <div className="dashboard-content commercial-dashboard">
        <section className="commercial-dashboard-hero">
          <div>
            <span className="eyebrow">{greeting}, {firstName}</span>
            <h1>Atlas has {recommendations} recommendation{recommendations === 1 ? "" : "s"} for you.</h1>
            <p>
              Review recent Team DNA, explore new matches and continue building
              balanced teams from one workspace.
            </p>
            <div className="actions">
              <Link className="button" href="/atlas">Ask Atlas</Link>
              <Link className="button secondary" href="/team-builder">Build a Team</Link>
            </div>
          </div>

          <div className="commercial-dashboard-atlas">
            <AtlasOrb size="xl" />
            <span>Atlas workspace</span>
            <strong>Ready</strong>
          </div>
        </section>

        <section className="commercial-dashboard-metrics">
          {loading ? (
            <>
              <Skeleton className="metric-skeleton" />
              <Skeleton className="metric-skeleton" />
              <Skeleton className="metric-skeleton" />
              <Skeleton className="metric-skeleton" />
              <Skeleton className="metric-skeleton" />
            </>
          ) : (
            <>
              <MetricTile icon="♙" label="Team DNA Profiles" value={String(personas.length)} note="Active profiles" />
              <MetricTile icon="◌" label="Profile Completion" value={`${averageCompletion}%`} note="Across all profiles" />
              <MetricTile icon="♡" label="Matches Ready" value={personas.length ? "6" : "0"} note="Sample candidate pool" />
              <MetricTile icon="◎" label="Team Confidence" value={personas.length ? "92%" : "—"} note="Latest composition" />
              <MetricTile icon="◔" label="Notifications" value={String(unread)} note="Unread updates" />
            </>
          )}
        </section>

        <section className="commercial-dashboard-grid">
          <div className="commercial-dashboard-main">
            <section className="commercial-surface">
              <SectionHeader
                eyebrow="Recent activity"
                title="Your latest work"
                text="Profiles, analyses and team activity across the workspace."
                action={<Link href="/notifications">View all</Link>}
              />

              <div className="commercial-activity-list">
                {loading ? (
                  <>
                    <Skeleton className="activity-skeleton" />
                    <Skeleton className="activity-skeleton" />
                    <Skeleton className="activity-skeleton" />
                  </>
                ) : (
                  <>
                    {personas.slice(0, 3).map((persona, index) => (
                      <Link href="/team-dna" className="commercial-activity-row" key={persona.id}>
                        <span className="avatar">{persona.accountName.charAt(0).toUpperCase()}</span>
                        <span>
                          <strong>{persona.teamType} Team DNA updated</strong>
                          <small>{persona.accountName} • {persona.city}</small>
                        </span>
                        <StatusBadge tone="success">Updated</StatusBadge>
                        <em>{index + 1}h ago</em>
                      </Link>
                    ))}

                    <Link href="/insights" className="commercial-activity-row">
                      <span className="commercial-atlas-activity"><AtlasOrb size="sm" /></span>
                      <span>
                        <strong>Atlas generated a new insight</strong>
                        <small>Collaboration and role recommendations</small>
                      </span>
                      <StatusBadge>Insight</StatusBadge>
                      <em>Today</em>
                    </Link>

                    <Link href="/matches" className="commercial-activity-row">
                      <span className="avatar">M</span>
                      <span>
                        <strong>New high-confidence match</strong>
                        <small>Business candidate scored above 90%</small>
                      </span>
                      <StatusBadge tone="success">High match</StatusBadge>
                      <em>Today</em>
                    </Link>
                  </>
                )}
              </div>
            </section>

            <section className="commercial-surface">
              <SectionHeader
                eyebrow="Team health"
                title="Latest Team DNA overview"
                text="A snapshot of the current sample team composition."
                action={<Link href="/insights">Open Insights</Link>}
              />

              <div className="commercial-health-grid">
                {[
                  ["Purpose", 92],
                  ["Trust", 88],
                  ["Collaboration", 90],
                  ["Adaptability", 85],
                  ["Performance", 87],
                  ["Creative balance", 72],
                ].map(([label, score]) => (
                  <div key={String(label)}>
                    <span><strong>{label}</strong><em>{score}%</em></span>
                    <div className="bar"><i style={{ width: `${score}%` }} /></div>
                  </div>
                ))}
              </div>

              <div className="commercial-atlas-recommendation">
                <AtlasOrb size="md" state="complete" />
                <p>
                  <strong>Atlas recommendation</strong>
                  Leadership and collaboration are well represented. Consider adding
                  a creative challenger to improve idea generation.
                </p>
                <Link href="/team-canvas">Review Team →</Link>
              </div>
            </section>
          </div>

          <aside className="commercial-dashboard-side">
            <section className="commercial-atlas-panel">
              <div className="commercial-atlas-panel-heading">
                <AtlasOrb size="lg" />
                <span>
                  <strong>Ask Atlas</strong>
                  <small>Your AI Team Strategist</small>
                </span>
              </div>

              <p>Continue a conversation or start a new team workflow.</p>

              <div className="commercial-atlas-prompts">
                <Link href="/atlas">Create a Team DNA profile <span>→</span></Link>
                <Link href="/team-builder">Build a delivery team <span>→</span></Link>
                <Link href="/matches">Compare two people <span>→</span></Link>
                <Link href="/insights">Review team risks <span>→</span></Link>
              </div>
            </section>

            <section className="commercial-surface">
              <SectionHeader title="Quick actions" />
              <div className="commercial-quick-actions">
                <Link href="/atlas"><span>✦</span><strong>Atlas</strong><small>Start conversation</small></Link>
                <Link href="/team-dna"><span>◌</span><strong>Team DNA</strong><small>Create profile</small></Link>
                <Link href="/team-builder"><span>◎</span><strong>Builder</strong><small>Create team</small></Link>
                <Link href="/team-canvas"><span>◫</span><strong>Canvas</strong><small>Refine team</small></Link>
              </div>
            </section>

            <section className="commercial-surface commercial-next-step">
              <span className="eyebrow">Recommended next step</span>
              <h3>{personas.length ? "Compare your strongest matches" : "Create your first Team DNA"}</h3>
              <p>
                {personas.length
                  ? "Review compatibility, collaboration strengths and potential tensions."
                  : "Atlas will ask five focused questions and create an explainable profile."}
              </p>
              <Link className="button" href={personas.length ? "/matches" : "/atlas"}>
                {personas.length ? "View Matches" : "Start with Atlas"}
              </Link>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}
