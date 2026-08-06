"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AccountMenu } from "./AccountMenu";
import { AtlasOrb } from "./AtlasOrb";

export function RobotLogo() {
  return (
    <span className="robot-logo" aria-hidden="true">
      <span className="robot-antenna" />
      <span className="robot-head">
        <span className="robot-eye left" />
        <span className="robot-eye right" />
        <span className="robot-smile" />
      </span>
    </span>
  );
}

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/getting-started", label: "Get Started" },
  { href: "/workspaces", label: "Workspaces" },
  { href: "/members", label: "Members" },
  { href: "/talent", label: "Talent" },
  { href: "/talent-pools", label: "Talent Pools" },
  { href: "/teams", label: "Teams" },
  { href: "/atlas", label: "Atlas", atlas: true },
  { href: "/team-dna", label: "My Team DNA" },
  { href: "/profile", label: "My Profile" },
  { href: "/insights", label: "Insights" },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container product-nav atlas-product-nav">
        <Link href="/" className="brand product-brand">
          <RobotLogo />
          <span className="commercial-brand-copy">
            <strong>AutoTeams</strong>
            <em>AI Team Intelligence</em>
          </span>
          <small>v13.0d</small>
        </Link>

        <nav className="product-nav-links atlas-nav-links" aria-label="Primary navigation">
          {primaryLinks.map((link) => {
            const active = isActivePath(pathname, link.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "active" : undefined}
                href={link.href}
                key={link.href}
              >
                {link.atlas && <AtlasOrb size="sm" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="product-nav-actions">
          <details className="nav-dropdown">
            <summary>
              Platform <span>⌄</span>
            </summary>
            <div className="nav-dropdown-menu">
              <Link href="/workspaces">Workspaces</Link>
              <Link href="/talent">Talent</Link>
              <Link href="/members">Members & Roles</Link>
              <Link href="/talent-pools">Talent Pools</Link>
              <Link href="/solutions">Solutions</Link>
              <Link href="/trust-centre">Trust Centre</Link>
              <Link href="/why-this-team">Explainability</Link>
              <Link href="/profile">My Profile</Link>
              <Link href="/profile/privacy">Profile Privacy</Link>
              <Link href="/profile/security">Profile Security</Link>
              <Link href="/profile/membership">Workspace Membership</Link>
              <Link href="/notifications">Notifications</Link>
              <Link href="/settings">Settings</Link>
              <Link href="/security">Security</Link>
              <Link href="/privacy">Privacy Centre</Link>
            </div>
          </details>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <RobotLogo />
            <span>AutoTeams</span>
          </div>
          <p className="muted">
            Helping organisations build stronger teams through explainable AI.
          </p>
        </div>

        <div className="footer-links">
          <Link href="/atlas">Atlas</Link>
          <Link href="/team-dna">Team DNA</Link>
          <Link href="/team-builder">Build with Atlas</Link>
          <Link href="/team-canvas">Team Canvas</Link>
          <Link href="/members">Members & Roles</Link>
          <Link href="/founding-members">Founding Members</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/about">About</Link>
          <Link href="/security">Security</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}
