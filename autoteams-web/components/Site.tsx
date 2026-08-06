"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AccountMenu } from "@/components/navigation/AccountMenu";
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
  { href: "/home", label: "Home" },
  { href: "/profile", label: "People" },
  { href: "/workspaces", label: "Workspace" },
  { href: "/atlas-workspace", label: "Atlas", atlas: true },
  { href: "/learning-centre", label: "Learn" },
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

          <small>v15.1</small>
        </Link>

        <nav
          className="product-nav-links atlas-nav-links"
          aria-label="Primary navigation"
        >
          {primaryLinks.map((link) => {
            const active = isActivePath(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {link.atlas && <AtlasOrb size="sm" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Account */}
        <div className="product-nav-actions">
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
          <Link href="/learning-centre">Learning Centre</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/about">About</Link>
          <Link href="/security">Security</Link>
          <Link href="/privacy">Privacy</Link>
        </div>

      </div>
    </footer>
  );
}

export function PageShell({
  children,
}: {
  children: ReactNode;
}) {
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