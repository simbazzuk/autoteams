import Link from "next/link";

const sections = [
  { title: "", links: [{ href: "/dashboard", icon: "⌂", label: "Overview" }] },
  { title: "BUILD", links: [
    { href: "/team-builder", icon: "◎", label: "Team Builder" },
    { href: "/team-canvas", icon: "◫", label: "Team Canvas" },
    { href: "/register", icon: "♙", label: "Team Personas" },
  ]},
  { title: "INTELLIGENCE", links: [
    { href: "/atlas", icon: "✦", label: "Atlas" },
    { href: "/insights", icon: "◌", label: "Team DNA" },
    { href: "/matches", icon: "♡", label: "Matches" },
  ]},
  { title: "WORKSPACE", links: [
    { href: "/notifications", icon: "◔", label: "Notifications" },
    { href: "/settings", icon: "⚙", label: "Settings" },
    { href: "/trust-centre", icon: "◇", label: "Trust Centre" },
  ]},
];

export function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      {sections.map((section, sectionIndex) => (
        <div className="sidebar-section" key={`${section.title}-${sectionIndex}`}>
          {section.title && <span className="sidebar-title">{section.title}</span>}
          {section.links.map((link, index) => (
            <Link
              className={sectionIndex === 0 && index === 0 ? "active" : ""}
              href={link.href}
              key={link.href}
            >
              <span aria-hidden="true">{link.icon}</span>{link.label}
            </Link>
          ))}
        </div>
      ))}

      <div className="sidebar-upgrade">
        <span className="sidebar-upgrade-icon">✦</span>
        <strong>AutoTeams v7.0</strong>
        <p>Atlas, Team DNA, Team Builder and explainable team workflows.</p>
        <Link href="/team-canvas">Open Team Canvas →</Link>
      </div>
    </aside>
  );
}
