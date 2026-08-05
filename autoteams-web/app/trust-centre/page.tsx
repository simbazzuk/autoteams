import { PageShell } from "@/components/Site";
import { ProductPage } from "@/components/ProductPage";

const principles = [
  ["Privacy by design","Collect only the information needed for a clear team purpose.","🔐"],
  ["Explainable AI","Show the signals, scores and reasons behind recommendations.","🧠"],
  ["Human control","Users and authorised reviewers can accept, adjust or reject outcomes.","👤"],
  ["Configurable trust","Apply the appropriate level of verification for each use case.","✓"],
];

const levels = [
  ["Level 1","Email authentication","Internal pilots and lower-risk groups"],
  ["Level 2","Email and phone","Events, clubs and local communities"],
  ["Level 3","Verified identity","Higher-trust real-world meetups"],
  ["Level 4","Enterprise identity","Entra ID, Google Workspace or Okta"],
];

export default function TrustCentrePage() {
  return (
    <PageShell>
      <ProductPage
        eyebrow="AutoTeams Trust Centre"
        title="Trust is part of the product."
        text="See how AutoTeams approaches privacy, verification, AI explainability and responsible team recommendations."
      >
        <div className="v2-trust-grid">
          {principles.map(([title,text,icon])=>(
            <article className="v2-trust-card" key={title}>
              <span>{icon}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>

        <section className="v2-trust-architecture">
          <div>
            <span className="eyebrow">Privacy architecture</span>
            <h2>Separate identity from matching wherever possible.</h2>
            <p>
              The matching engine should use relevant traits, goals and constraints
              without exposing unnecessary identity data.
            </p>
          </div>
          <div className="v2-architecture-flow">
            <div><span>1</span><strong>Identity service</strong><small>Name, email and verification result</small></div>
            <i>→</i>
            <div><span>2</span><strong>Pseudonymised profile</strong><small>Internal reference and matching features</small></div>
            <i>→</i>
            <div><span>3</span><strong>Team intelligence</strong><small>Explainable matching and recommendations</small></div>
          </div>
        </section>

        <section className="v2-trust-levels">
          <div className="section-heading wide">
            <span className="eyebrow">Configurable assurance</span>
            <h2>Choose the right trust level.</h2>
          </div>
          <div className="v2-level-grid">
            {levels.map(([level,title,text])=>(
              <article key={level}><span>{level}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
          <div className="notice">
            This is an MVP product statement, not a final legal privacy notice,
            security certification or psychological assessment.
          </div>
        </section>
      </ProductPage>
    </PageShell>
  );
}
