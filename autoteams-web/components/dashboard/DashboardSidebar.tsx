import Link from "next/link";

const sections = [
  { title: "", links: [{ href: "/dashboard", icon: "⌂", label: "Overview" }] },
  { title: "TEAM MANAGEMENT", links: [
    { href: "/team-designer", icon: "◎", label: "My Teams" },
    { href: "/register", icon: "♙", label: "Team Personas" },
    { href: "/intelligence", icon: "◌", label: "Team DNA" },
  ]},
  { title: "DISCOVER", links: [
    { href: "/matches", icon: "♡", label: "Matches" },
    { href: "/solutions#community", icon: "♧", label: "Communities" },
    { href: "/solutions#events", icon: "□", label: "Events" },
  ]},
  { title: "AI INSIGHTS", links: [
    { href: "/teamguide", icon: "✦", label: "TeamGuide" },
    { href: "/intelligence", icon: "▥", label: "Intelligence Hub" },
    { href: "/why-this-team", icon: "⋇", label: "Recommendations" },
  ]},
];

export function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      {sections.map((section, sectionIndex) => (
        <div className="sidebar-section" key={`${section.title}-${sectionIndex}`}>
          {section.title && <span className="sidebar-title">{section.title}</span>}
          {section.links.map((link, index) => (
            <Link className={sectionIndex === 0 && index === 0 ? "active" : ""} href={link.href} key={link.href + link.label}>
              <span aria-hidden="true">{link.icon}</span>{link.label}
            </Link>
          ))}
        </div>
      ))}
      <div className="sidebar-upgrade">
        <span className="sidebar-upgrade-icon">♛</span><strong>AutoTeams Beta</strong>
        <p>Help shape the future of intelligent team formation.</p>
        <Link href="/teamguide">Explore TeamGuide →</Link>
      </div>
    </aside>
  );
}
