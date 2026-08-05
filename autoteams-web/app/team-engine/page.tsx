import { PageHero, PageShell } from "@/components/Site";

export default function TeamEnginePage() {
  const steps = [
    ["1", "Build the person profile", "Collect personality signals, interests, skills, demographics, experience, availability, location and goals."],
    ["2", "Define the team purpose", "Apply the correct model for friendship, business, sports, events, education or community."],
    ["3", "Optimise the whole group", "Balance strengths, gaps, diversity and practical constraints across the group."],
    ["4", "Explain and learn", "Show the rationale, capture outcomes and improve future recommendations."],
  ];

  return (
    <PageShell>
      <PageHero eyebrow="AI Team Engine" title="From person data to stronger teams." text="Structured data, natural-language conversations, configurable rules and optimisation combine to recommend balanced groups." />
      <section className="section tight"><div className="container two-grid">
        {steps.map(([n,t,x]) => <article className="card" key={n}><span className="number">{n}</span><h3>{t}</h3><p>{x}</p></article>)}
      </div></section>
      <section className="section"><div className="container feature-grid">
        <div><span className="eyebrow">Team optimisation</span><h2>The strongest team is not always the most similar team.</h2><p className="lead">AutoTeams can create complementary role balance across leadership, planning, creativity, technical delivery and communication.</p></div>
        <div className="dark-panel">
          {["Leadership — Balanced","Skills coverage — Complete","Communication — Complementary","Availability — Aligned","Trust level — Configured"].map(x => <div className="dark-row" key={x}>{x}</div>)}
        </div>
      </div></section>
    </PageShell>
  );
}
