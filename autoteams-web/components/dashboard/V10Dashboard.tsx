"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { TeamPersona, listPersonas } from "@/lib/personas";
import { DashboardSidebar } from "./DashboardSidebar";

function completion(persona: TeamPersona) {
  const filled = persona.values.filter((value) => value.trim().length > 2).length;
  return Math.min(100, 35 + Math.round((filled / Math.max(persona.values.length, 1)) * 55));
}

const dna = [["Purpose",92],["Trust",88],["Collaboration",90],["Adaptability",85],["Performance",87]] as const;

export function V10Dashboard() {
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

  const name = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const average = useMemo(
    () => personas.length ? Math.round(personas.reduce((sum, persona) => sum + completion(persona), 0) / personas.length) : 0,
    [personas]
  );

  return (
    <div className="dashboard-product-shell">
      <DashboardSidebar />
      <div className="dashboard-content">
        <section className="v10-hero">
          <div>
            <small>Welcome back, {name} 👋</small>
            <h1>Build better teams.<br /><span>Faster. Smarter. Together.</span></h1>
            <p>Atlas-powered team intelligence to help you create high-performing, trusted and connected teams.</p>
            <div className="actions"><Link className="button" href="/team-canvas">Open Team Canvas</Link><Link className="button secondary" href="/atlas">Ask Atlas</Link></div>
          </div>
          <div className="hero-robot" aria-hidden="true">
            <div className="hero-robot-antenna" />
            <div className="hero-robot-head"><span className="hero-eye left" /><span className="hero-eye right" /><span className="hero-mouth" /></div>
            <div className="hero-robot-body"><span>⌁</span></div>
          </div>
        </section>

        <section className="v10-stats">
          <Stat icon="♟" label="Team Personas" value={String(personas.length)} note="Your active profiles" />
          <Stat icon="♙" label="Profile Completion" value={`${average}%`} note="Keep improving" />
          <Stat icon="♥" label="Matches Ready" value={personas.length ? "6" : "0"} note="Based on sample pool" />
          <Stat icon="◌" label="Team DNA Score" value={personas.length ? "92%" : "—"} note="Atlas enabled" />
          <Stat icon="ϟ" label="AI Insights" value="24" note="Available suggestions" />
        </section>

        <section className="v10-dashboard-grid">
          <div className="card activity-card">
            <div className="card-heading"><h3>Recent Activity</h3><Link href="/dashboard">View all</Link></div>
            {loading ? <p>Loading activity…</p> : (
              <div className="activity-list">
                {personas.slice(0,3).map((persona,index)=>(
                  <div className="activity-item" key={persona.id}>
                    <span className="activity-avatar">{persona.accountName.charAt(0)}</span>
                    <span><strong>{persona.teamType} Persona updated</strong><small>{index+1} hour{index ? "s" : ""} ago</small></span>
                    <em>Updated</em>
                  </div>
                ))}
                <div className="activity-item"><span className="activity-avatar robot">✦</span><span><strong>AI insight generated</strong><small>Today</small></span><em>Insight</em></div>
                <div className="activity-item"><span className="activity-avatar">M</span><span><strong>New match available</strong><small>Today</small></span><em>High match</em></div>
              </div>
            )}
          </div>

          <div className="card dna-overview">
            <div className="card-heading"><h3>Team DNA Overview</h3><Link href="/insights">View report</Link></div>
            <div className="radar-sim"><div className="radar-ring ring-1" /><div className="radar-ring ring-2" /><div className="radar-ring ring-3" /><div className="radar-shape" /></div>
            <div className="dna-labels">{dna.map(([label,score])=><span key={label}><strong>{label}</strong>{score}%</span>)}</div>
            <div className="dna-message"><span>◌</span><p><strong>Your Team DNA is strong.</strong><br />Keep nurturing trust and adaptability.</p></div>
          </div>

          <div className="dashboard-right-column">
            <div className="teamguide-widget">
              <div className="card-heading"><h3>✦ Ask Atlas</h3><Link href="/atlas">New conversation</Link></div>
              <p>Your AI strategist for team success.</p>
              {["How can I improve collaboration?","What makes a high-performing team?","Suggest team-building activities"].map((question)=><Link href="/atlas" key={question}>{question}<span>›</span></Link>)}
              <div className="teamguide-prompt">Ask anything about teams… <span>➜</span></div>
            </div>
            <div className="card quick-actions">
              <h3>ϟ Quick Actions</h3>
              <div>
                <QuickAction href="/team-builder" icon="＋" title="Create" text="New Team" />
                <QuickAction href="/register" icon="♙" title="Create" text="Persona" />
                <QuickAction href="/insights" icon="▥" title="Run" text="Team DNA" />
                <QuickAction href="/team-canvas" icon="◫" title="Open" text="Team Canvas" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, note }: { icon: string; label: string; value: string; note: string }) {
  return <div className="card v10-stat"><span className="stat-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong><em>{note}</em></span><i>⌁</i></div>;
}
function QuickAction({ href, icon, title, text }: { href: string; icon: string; title: string; text: string }) {
  return <Link href={href}><span>{icon}</span><strong>{title}</strong><small>{text}</small></Link>;
}
