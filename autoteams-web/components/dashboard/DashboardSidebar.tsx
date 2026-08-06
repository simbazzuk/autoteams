"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  NavigationRole,
  canAccessAdministration,
  canBuildTeams,
  canManageWorkspace,
  resolveNavigationRole,
} from "@/lib/navigation-role";

type NavigationLink = {
  href: string;
  icon: string;
  label: string;
};

type NavigationSection = {
  id: string;
  title: string;
  icon: string;
  links: NavigationLink[];
};

function buildSections(role: NavigationRole): NavigationSection[] {
  const sections: NavigationSection[] = [
    {
      id: "home",
      title: "Home",
      icon: "⌂",
      links: [
        { href: "/home", icon: "⌂", label: "Home" },
        { href: "/notifications", icon: "◔", label: "Notifications" },
      ],
    },
    {
      id: "me",
      title: "My AutoTeams",
      icon: "♙",
      links: [
        { href: "/profile", icon: "♙", label: "My Profile" },
        { href: "/atlas", icon: "✦", label: "Atlas Interview" },
        { href: "/team-dna", icon: "◌", label: "My Team DNA" },
        { href: "/teams", icon: "▥", label: "My Teams" },
      ],
    },
  ];

  if (canManageWorkspace(role) || canBuildTeams(role)) {
    sections.push({
      id: "workspace",
      title: "Workspace",
      icon: "◇",
      links: [
        { href: "/workspaces", icon: "◇", label: "Workspaces" },
        { href: "/profile/membership", icon: "♙", label: "Membership" },
        { href: "/members", icon: "◉", label: "Members" },
        { href: "/talent", icon: "◌", label: "Talent Directory" },
        { href: "/talent-pools", icon: "◎", label: "Talent Pools" },
      ],
    });
  }

  if (canBuildTeams(role)) {
    sections.push({
      id: "atlas-tools",
      title: "Atlas",
      icon: "✦",
      links: [
        { href: "/team-builder", icon: "✦", label: "Build Team" },
        { href: "/matches", icon: "♡", label: "Recommendations" },
        { href: "/team-canvas", icon: "◫", label: "Team Canvas" },
        { href: "/insights", icon: "▥", label: "Atlas Insights" },
      ],
    });
  }

  sections.push({
    id: "learn",
    title: "Learn",
    icon: "▤",
    links: [
      { href: "/learning-centre", icon: "▤", label: "Learning Centre" },
      { href: "/playbooks", icon: "▥", label: "Playbooks" },
      { href: "/trust-centre", icon: "◇", label: "Trust Centre" },
    ],
  });

  if (canAccessAdministration(role)) {
    sections.push({
      id: "administration",
      title: "Administration",
      icon: "⚙",
      links: [
        { href: "/settings", icon: "⚙", label: "Settings" },
        { href: "/profile/privacy", icon: "◇", label: "Privacy" },
        { href: "/profile/security", icon: "✓", label: "Security" },
        { href: "/demo", icon: "◈", label: "Demo Environment" },
      ],
    });
  }

  return sections;
}

function activePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function sectionForPath(
  pathname: string,
  sections: NavigationSection[],
): string {
  return (
    sections.find((section) =>
      section.links.some((link) => activePath(pathname, link.href)),
    )?.id || "home"
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [role, setRole] = useState<NavigationRole>("member");

  useEffect(() => {
    setRole(resolveNavigationRole(user?.email));
  }, [user?.email, pathname]);

  const sections = useMemo(() => buildSections(role), [role]);

  const [openSection, setOpenSection] = useState("home");

  useEffect(() => {
    setOpenSection(sectionForPath(pathname, sections));
  }, [pathname, sections]);

  function toggleSection(sectionId: string) {
    setOpenSection((current) =>
      current === sectionId ? "" : sectionId,
    );
  }

  return (
    <aside className="dashboard-sidebar compact-sidebar">
      <nav aria-label="Main navigation">
        {sections.map((section) => {
          const open = openSection === section.id;
          const sectionActive = section.links.some((link) =>
            activePath(pathname, link.href),
          );

          return (
            <div
              className={`compact-nav-section ${
                sectionActive ? "section-active" : ""
              }`}
              key={section.id}
            >
              <button
                aria-expanded={open}
                className="compact-nav-heading"
                onClick={() => toggleSection(section.id)}
                type="button"
              >
                <span aria-hidden="true">{section.icon}</span>
                <strong>{section.title}</strong>
                <em aria-hidden="true">{open ? "−" : "+"}</em>
              </button>

              {open && (
                <div className="compact-nav-children">
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
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-role-summary">
        <span>{roleIcon(role)}</span>
        <div>
          <small>Current access</small>
          <strong>{roleLabel(role)}</strong>
        </div>
      </div>
    </aside>
  );
}

function roleIcon(role: NavigationRole): string {
  return {
    owner: "★",
    admin: "✓",
    leader: "♙",
    member: "◌",
  }[role];
}

function roleLabel(role: NavigationRole): string {
  return {
    owner: "Workspace Owner",
    admin: "Administrator",
    leader: "Team Leader",
    member: "Team Member",
  }[role];
}
