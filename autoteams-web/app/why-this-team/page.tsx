import { PageHero, PageShell } from "@/components/Site";

export default function WhyThisTeamPage() {
  const scores = [["Shared goals",96],["Communication balance",92],["Skills coverage",94],["Diversity of thinking",87],["Availability",90],["Delivery reliability",89]];
  const people = [["S","Sukh","Architecture • leadership • AI","Lead"],["A","Amara","Product • facilitation • customer focus","Connect"],["J","James","Engineering • delivery • reliability","Build"],["M","Maya","Data • analysis • critical thinking","Analyse"]];

  return (
    <PageShell>
      <PageHero eyebrow="Explainable team formation" title="Why this Team?" text="See why a recommendation was made, which signals mattered and what information was not used." />
      <section className="section tight"><div className="container feature-grid">
        <div><span className="eyebrow">Recommended Team</span><h2>Project Atlas</h2><p className="lead">A four-person project team balancing leadership, analytical thinking, delivery and communication.</p><div className="chips"><span className="chip">4 people</span><span className="chip">Business project</span><span className="chip">91% confidence</span></div></div>
        <div className="card">{people.map(([a,n,s,r]) => <div className="person" key={n}><span className="avatar">{a}</span><span><strong>{n}</strong><small>{s}</small></span><span className="badge">{r}</span></div>)}</div>
      </div></section>
      <section className="section"><div className="container"><div className="section-heading"><span className="eyebrow">Team DNA</span><h2>A clear view of the recommendation.</h2></div><div className="two-grid">
        {scores.map(([label,value]) => <div className="card score" key={label}><div><strong>{label}</strong><strong>{value}%</strong></div><div className="bar"><span style={{width:`${value}%`}} /></div></div>)}
      </div><div className="notice"><strong>Human review remains available.</strong> AI recommends; authorised people can review, adjust or reject the team.</div></div></section>
    </PageShell>
  );
}
