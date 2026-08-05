import Link from "next/link";
import type { ReactNode } from "react";
import { AccountMenu } from "./AccountMenu";

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
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/teamguide", label: "TeamGuide", icon: "✦" },
  { href: "/team-designer", label: "Team Designer", icon: "◎" },
  { href: "/matches", label: "Matches", icon: "◉" },
  { href: "/intelligence", label: "Intelligence", icon: "◌" },
];

export function Navbar() {
  return (
    <header className="site-header">
      <div className="container product-nav">
        <Link href="/" className="brand product-brand">
          <RobotLogo />
          <span>AutoTeams</span>
          <small>v1.0</small>
        </Link>
        <nav className="product-nav-links" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              <span aria-hidden="true">{link.icon}</span>{link.label}
            </Link>
          ))}
        </nav>
        <div className="product-nav-actions">
          <details className="nav-dropdown">
            <summary>Solutions <span>⌄</span></summary>
            <div className="nav-dropdown-menu">
              <Link href="/solutions">All solutions</Link>
              <Link href="/team-engine">AI Team Engine</Link>
              <Link href="/why-this-team">Why this team?</Link>
              <Link href="/trust-centre">Trust Centre</Link>
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
          <div className="brand"><RobotLogo /><span>AutoTeams</span></div>
          <p className="muted">AI-powered team intelligence for life, work and community.</p>
        </div>
        <div className="footer-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/teamguide">TeamGuide</Link>
          <Link href="/team-designer">Team Designer</Link>
          <Link href="/trust-centre">Trust Centre</Link>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <><Navbar /><main>{children}</main><Footer /></>;
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <section className="page-hero"><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></section>;
}
