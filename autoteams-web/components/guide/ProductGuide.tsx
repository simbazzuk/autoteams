import Link from "next/link";

const journey = [
  {
    number: "01",
    title: "Create your account",
    text: "Register, verify your email and review account security.",
    href: "/signup",
  },
  {
    number: "02",
    title: "Create or join a workspace",
    text: "The workspace is the private boundary for people, profiles and recommendations.",
    href: "/workspaces",
  },
  {
    number: "03",
    title: "Create a contextual profile",
    text: "Choose Business, Friendship, Community, Sports or Education.",
    href: "/profile",
  },
  {
    number: "04",
    title: "Complete the Atlas interview",
    text: "Answer the reusable core questions once, then only the selected context questions.",
    href: "/atlas",
  },
  {
    number: "05",
    title: "Review Team DNA",
    text: "Understand confidence, freshness, strengths and development themes.",
    href: "/team-dna",
  },
  {
    number: "06",
    title: "Define eligible Talent",
    text: "Use the Talent Directory and Talent Pools to control who Atlas may consider.",
    href: "/talent-pools",
  },
  {
    number: "07",
    title: "Build and review the team",
    text: "Describe the need, review explanations and make the final human decision.",
    href: "/matches",
  },
];

const concepts = [
  {
    title: "Workspace",
    text: "The private organisational or group boundary. Atlas never recommends outside it.",
  },
  {
    title: "Talent",
    text: "People in a workspace who may be eligible for teams or groups.",
  },
  {
    title: "Talent Pool",
    text: "A focused subset of Talent selected for a particular recommendation.",
  },
  {
    title: "Contextual Profile",
    text: "A separate Business, Friendship, Community, Sports or Education profile.",
  },
  {
    title: "Team DNA",
    text: "The explainable collaboration profile created from the Atlas interview.",
  },
  {
    title: "Atlas",
    text: "The assistant that interviews users, assesses balance and explains recommendations.",
  },
];

export function ProductGuide() {
  return (
    <main className="ux14-guide">
      <section className="ux14-guide-hero">
        <div className="container">
          <span className="eyebrow">Product Guide</span>
          <h1>AutoTeams, explained from start to finish.</h1>
          <p>
            Learn the seven-step journey, understand the core concepts and see
            which features each role uses.
          </p>
          <div className="actions">
            <Link className="button" href="/home">Go to Home</Link>
            <Link className="button secondary" href="/demo">Load Demo Data</Link>
          </div>
        </div>
      </section>

      <section className="ux14-guide-body">
        <div className="container">
          <section className="ux14-guide-section">
            <div className="ux14-guide-heading">
              <span className="eyebrow">The complete journey</span>
              <h2>Seven steps from profile to team.</h2>
              <p>
                Each step has one purpose and leads directly to the next.
              </p>
            </div>

            <div className="ux14-guide-timeline">
              {journey.map((item) => (
                <Link href={item.href} key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <em>Open →</em>
                </Link>
              ))}
            </div>
          </section>

          <section className="ux14-guide-section">
            <div className="ux14-guide-heading">
              <span className="eyebrow">Core concepts</span>
              <h2>The six terms every user should understand.</h2>
            </div>

            <div className="ux14-concept-grid">
              {concepts.map((concept, index) => (
                <article key={concept.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{concept.title}</h3>
                  <p>{concept.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="ux14-guide-section">
            <div className="ux14-guide-heading">
              <span className="eyebrow">Roles</span>
              <h2>What each person does.</h2>
            </div>

            <div className="ux14-role-grid">
              <RoleCard
                title="Owner"
                text="Creates the workspace and controls governance, roles and access."
                actions={["Workspaces", "Membership", "Privacy", "Security"]}
              />
              <RoleCard
                title="Administrator"
                text="Invites people, manages membership and maintains the Talent Directory."
                actions={["Members", "Talent", "Talent Pools", "Notifications"]}
              />
              <RoleCard
                title="Team Leader"
                text="Describes the team requirement and reviews Atlas recommendations."
                actions={["Team Builder", "Matches", "Teams", "Insights"]}
              />
              <RoleCard
                title="Team Member"
                text="Manages personal profiles, completes Atlas and participates in teams."
                actions={["My Profile", "Atlas", "My Team DNA", "Notifications"]}
              />
            </div>
          </section>

          <section className="ux14-guide-cta">
            <div>
              <span className="eyebrow">Start here</span>
              <h2>Use Home as your guide.</h2>
              <p>
                Home shows progress, workspace health and the single next action
                that matters most.
              </p>
            </div>
            <Link className="button" href="/home">Open Home</Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function RoleCard({
  title,
  text,
  actions,
}: {
  title: string;
  text: string;
  actions: string[];
}) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{text}</p>
      <div>
        {actions.map((action) => <span key={action}>{action}</span>)}
      </div>
    </article>
  );
}
