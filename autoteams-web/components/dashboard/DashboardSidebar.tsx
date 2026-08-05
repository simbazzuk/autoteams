"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "",
    links: [{ href: "/dashboard", icon: "⌂", label: "Overview" }],
  },
  {
    title: "BUILD",
    links: [
      { href: "/team-builder", icon: "◎", label: "Team Builder" },
      { href: "/team-canvas", icon: "◫", label: "Team Canvas" },
      { href: "/register", icon: "♙", label: "Team Personas" },
    ],
  },
  {
    title: "INTELLIGENCE",
    links: [
      { href: "/atlas", icon: "✦", label: "Atlas" },
      { href: "/team-dna", icon: "◌", label: "Team DNA" },
      { href: "/matches", icon: "♡", label: "Matches" },
      { href: "/insights", icon: "▥", label: "Insights" },
    ],
  },
  {
    title: "WORKSPACE",
    links: [
      { href: "/notifications", icon: "◔", label: "Notifications" },
      { href: "/settings", icon: "⚙", label: "Settings" },
      { href: "/trust-centre", icon: "◇", label: "Trust Centre" },
    ],
  },
];

function activePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      {sections.map((section, sectionIndex) => (
        <div className="sidebar-section" key={`${section.title}-${sectionIndex}`}>
          {section.title && <span className="sidebar-title">{section.title}</span>}

          {section.links.map((link) => {
            const active = activePath(pathname, link.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "active" : undefined}
                href={link.href}
                key={link.href}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="sidebar-upgrade">
        <span className="sidebar-upgrade-icon">✦</span>
        <strong>Commercial Edition</strong>
        <p>A complete workspace for explainable team decisions.</p>
        <Link href="/atlas">Start with Atlas →</Link>
      </div>
    </aside>
  );
}
