import Link from "next/link";
import type { ReactNode } from "react";

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

export function Navbar() {
  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand"><RobotLogo />AutoTeams</Link>
        <nav className="nav-links">
          <Link href="/team-engine">AI Team Engine</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/trust-centre">Trust Centre</Link>
          <Link href="/why-this-team">Why This Team?</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <Link className="button small" href="/register">Build a Team</Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand"><RobotLogo />AutoTeams</div>
          <p className="muted">AI-powered team formation for life, work and community.</p>
        </div>
        <div className="footer-links">
          <Link href="/team-engine">AI Team Engine</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/trust-centre">Trust Centre</Link>
          <Link href="/why-this-team">Why This Team?</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <><Navbar /><main>{children}</main><Footer /></>;
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
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
