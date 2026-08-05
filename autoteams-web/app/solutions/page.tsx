import { PageHero, PageShell } from "@/components/Site";

const items = [
  ["consumer","🤝","Consumer","Friendship groups, new-to-city circles and travel groups.","Interests • Personality • Location • Availability • Verified identity"],
  ["enterprise","💼","Enterprise","Project teams, onboarding cohorts and innovation squads.","Skills • Experience • Working style • Role balance • Enterprise SSO"],
  ["education","🎓","Education","Study teams, project groups and peer support.","Subject strengths • Learning style • Availability • Institution login"],
  ["sports","⚽","Sports","Balanced teams based on ability and practical availability.","Ability • Position • Fitness • Competitiveness • Location"],
  ["events","🎟️","Events","Networking tables and breakout groups.","Industry • Objectives • Seniority • Topics • Ticket verification"],
  ["community","🌍","Community","Volunteer and local groups matched around shared purpose.","Skills • Causes • Geography • Availability • Role checks"],
];

export default function SolutionsPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Solutions" title="One platform. Multiple team experiences." text="Each solution uses the same core engine with different signals, constraints and trust levels." />
      <section className="section tight"><div className="container solution-list">
        {items.map(([id,icon,title,text,signals],i) => (
          <article className={`solution-detail ${i%2 ? "reverse" : ""}`} id={id} key={id}>
            <div><span className="eyebrow">{title}</span><h2>{text}</h2><p className="lead">AutoTeams configures matching around the specific outcome required.</p></div>
            <div className="card"><span className="icon">{icon}</span><h3>Typical matching signals</h3><div className="chips">{signals.split(" • ").map(s => <span className="chip" key={s}>{s}</span>)}</div></div>
          </article>
        ))}
      </div></section>
    </PageShell>
  );
}
