import { PageHero, PageShell } from "@/components/Site";

export default function TrustCentrePage() {
  const levels = [
    ["📧","Level 1 — Basic","Email verification for internal or lower-risk groups."],
    ["📱","Level 2 — Trusted","Email and phone verification for events and clubs."],
    ["🪪","Level 3 — Verified Identity","Government ID, selfie and liveness for real-world meetups."],
    ["🏢","Level 4 — Enterprise","Corporate identity through Entra ID, Google Workspace or Okta."],
  ];

  return (
    <PageShell>
      <PageHero eyebrow="AutoTeams Trust Centre" title="Privacy and trust are part of the platform." text="Understand how AutoTeams protects identity, configures verification and explains AI-powered recommendations." />
      <section className="section tight"><div className="container">
        <div className="section-heading"><span className="eyebrow">Privacy by design</span><h2>Your identity and matching profile are different.</h2><p>The AI does not need unnecessary identifiers to recommend a strong team.</p></div>
        <div className="architecture">
          <div className="card center"><span className="icon">🪪</span><h3>Identity Service</h3><p>Name, email and verification result</p></div><span>→</span>
          <div className="card center"><span className="icon">🔐</span><h3>Pseudonymisation</h3><p>Internal reference replaces identity</p></div><span>→</span>
          <div className="card center"><span className="icon">🧠</span><h3>Team Intelligence</h3><p>Relevant traits, skills and constraints</p></div>
        </div>
      </div></section>
      <section className="section"><div className="container">
        <div className="section-heading"><span className="eyebrow">Configurable Trust</span><h2>Choose the appropriate level of assurance.</h2></div>
        <div className="two-grid">{levels.map(([i,t,x]) => <article className="card" key={t}><span className="icon">{i}</span><h3>{t}</h3><p>{x}</p></article>)}</div>
        <div className="notice">This prototype describes intended product principles. It is not a final legal privacy notice or security certification.</div>
      </div></section>
    </PageShell>
  );
}
