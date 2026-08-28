import Link from "next/link";
import { PageShell } from "@/components/Site";

const releases = [
  {
    version: "v8.0",
    status: "Available",
    title: "Atlas Experience",
    items: [
      "Atlas identity and guided Team DNA",
      "Professional dashboard",
      "Founding Members programme",
      "Public About and Roadmap pages",
    ],
  },
  {
    version: "v8.5",
    status: "Planned",
    title: "Organisation Health",
    items: [
      "Team health indicators",
      "Leadership and collaboration coverage",
      "Skill and role gap analysis",
      "Team trends over time",
    ],
  },
  {
    version: "v9.0",
    status: "Planned",
    title: "Organisation Workspaces",
    items: [
      "Invite members",
      "Shared Team Canvas",
      "Saved teams and version history",
      "Workspace administration",
    ],
  },
  {
    version: "v9.5",
    status: "Future",
    title: "Collaboration",
    items: [
      "Comments and review workflows",
      "Team recommendations",
      "Shared reports",
      "Improved notifications",
    ],
  },
  {
    version: "v10.0",
    status: "Future",
    title: "Commercial Launch",
    items: [
      "Free and Pro plans",
      "Business workspaces",
      "Billing and account controls",
      "Commercial support model",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <PageShell>
      <section className="roadmap-hero">
        <div className="container">
          <span className="eyebrow">Public roadmap</span>
          <h1>Building AutoTeams in the open.</h1>
          <p>
            The roadmap will evolve through Founding Member feedback and
            real-world product validation.
          </p>
        </div>
      </section>

      <section className="roadmap-section">
        <div className="container roadmap-list">
          {releases.map((release) => (
            <article key={release.version}>
              <div className="roadmap-release-meta">
                <span>{release.version}</span>
                <em>{release.status}</em>
              </div>
              <div>
                <h2>{release.title}</h2>
                <ul>
                  {release.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-cta">
        <div className="container">
          <div>
            <span className="eyebrow">Influence the roadmap</span>
            <h2>Become a Founding Member.</h2>
          </div>
          <Link className="button" href="/founding-members">Join Free</Link>
        </div>
      </section>
    </PageShell>
  );
}
