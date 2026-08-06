import Link from "next/link";
import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function TeamsPage() {
  return (
    <PageShell><ProtectedRoute>
      <main className="v11-teams">
        <section className="v11-teams-hero"><div className="container"><span className="eyebrow">Teams</span><h1>Review teams created with Atlas.</h1><p>Saved teams remain connected to their workspace, Talent Pool and recommendation history.</p><Link className="button" href="/team-builder">Build a Team with Atlas</Link></div></section>
        <section className="v11-teams-body"><div className="container v11-team-grid">
          {["Project Phoenix","Customer Experience Squad"].map((name,index)=><article key={name}><span>Draft</span><h2>{name}</h2><p>{index===0?"Cross-functional digital delivery":"Improve customer journeys"}</p><div><em>{index===0?5:6} members</em><em>{index===0?92:88}% confidence</em></div><Link className="button secondary" href="/insights">View Atlas Insights</Link></article>)}
        </div></section>
      </main>
    </ProtectedRoute></PageShell>
  );
}
