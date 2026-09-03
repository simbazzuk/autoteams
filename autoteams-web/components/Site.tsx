"use client";

import { appConfig } from "@/lib/app-config";

import { AtlasSupport } from "@/components/support/AtlasSupport";
import { AtlasProfileBanner } from "@/components/atlas-profile/AtlasProfileBanner";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AccountMenu } from "@/components/navigation/AccountMenu";
import { AtlasAiAllowanceBadge } from "@/components/navigation/AtlasAiAllowanceBadge";

import { MessagesNavIcon } from "@/components/messaging/MessagesNavIcon";
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
  { href: "/home", label: "Dashboard" },
  { href: "/people", label: "People" },
  { href: "/members#invite", label: "Invite", invite: true },
  { href: "/team-builder", label: "Build Team" },
  { href: "/teams", label: "My Teams" },
  {
    href: "/gemini-team-coach",
    label: "Team Insights",
    ai: true,
  },
  { href: "/messages", label: "Messages" },
];

function isActivePath(
  pathname: string,
  href: string,
): boolean {

  // AUTOTEAMS_V71360_ROOT_ROUTE_GUARD
  // The public landing page is not an application workflow.
  if (pathname === "/") {
    return false;
  }
  if (href === "/home") {
return (
pathname === "/home" ||
pathname.startsWith("/home/")
);
}

if (href === "/get-started") {
return (
pathname === "/get-started" ||
pathname.startsWith("/get-started/")
);
}

if (href === "/people") {
    return [
      "/people",
      "/talent",
      "/talent-pools",
    ].some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`),
    );
  }

  if (href === "/members#invite") {
    return (
      pathname === "/members" ||
      pathname.startsWith("/members/")
    );
  }

  if (href === "/team-builder") {
    return (
      pathname === "/team-builder" ||
      pathname.startsWith("/team-builder/")
    );
  }

  if (href === "/gemini-team-coach") {
    return [
      "/gemini-team-coach",
      "/team-coach",
      "/atlas",
      "/my-atlas-profile",
    ].some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`),
    );
  }

  if (href === "/teams") {
    return [
      "/teams",
      "/matches",
    ].some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`),
    );
  }

  if (href === "/academy") {
    return [
      "/academy",
            "/playbooks",
    ].some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`),
    );
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
        <>
      {/* AUTOTEAMS_V71369_FIX7_FRAGMENT */}
    <header className="site-header">
      <div className="container product-nav atlas-product-nav">
        <Link
          href="/"
          className="brand product-brand"
        >
          <RobotLogo />

          <span className="commercial-brand-copy">
            <strong className="teamscience-wordmark">AutoTeams</strong>
            <em>AI-powered team intelligence</em>
          </span>

</Link>

        <nav
          className="product-nav-links atlas-nav-links"
          aria-label="Primary navigation"
        >
          {primaryLinks.map((link) => {
            const active = isActivePath(
              pathname,
              link.href,
            );

            return (
              <Link
                aria-current={
                  active ? "page" : undefined
                }
                className={active ? "active" : undefined}
                href={link.href}
                key={link.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                {link.invite && (
                  <span
                    aria-hidden="true"
                    title="Invite people"
                    style={{
                      display: "inline-grid",
                      width: 25,
                      height: 25,
                      placeItems: "center",
                      borderRadius: 8,
                      background:
                        "linear-gradient(135deg, rgba(59,130,246,.24), rgba(168,85,247,.24))",
                      border: "1px solid rgba(129,140,248,.34)",
                      color: "#c4b5fd",
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M19 8v6" />
                      <path d="M22 11h-6" />
                    </svg>
                  </span>
                )}

                {link.ai && (
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-grid",
                      width: 24,
                      height: 24,
                      placeItems: "center",
                      borderRadius: 8,
                      background:
                        "linear-gradient(135deg, #a855f7, #4f8ef7)",
                      color: "#fff",
                      fontSize: 10,
                      boxShadow:
                        "0 8px 20px rgba(79,142,247,.25)",
                    }}
                  >
                    ✦
                  </span>
                )}

                <span>{link.href === "/messages" ? <MessagesNavIcon /> : link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div data-autoteams-workspace-trigger="true" className="product-nav-actions">
          {/* AUTOTEAMS_V715715227_WORKSPACE_SIMPLIFIED */}
{/* AUTOTEAMS_V7157152271_WORKSPACE_SIMPLIFIED */}
{/* AUTOTEAMS_V7157152272_WORKSPACE_STRUCTURAL_FIX */}
<details className="nav-dropdown">
            <summary>
              Workspace <span>⌄</span>
            </summary>

            <div className="nav-dropdown-menu">

              <Link href="/organisation">Manage My Group</Link>

              <hr />

              <Link href="/talent-pools">
                Saved People Groups
              </Link>

              <Link href="/trust-centre">
                Trust Centre
              </Link>

              <Link href="/demo">
                Demo Environment
              </Link>
            </div>
          </details>

          <AccountMenu />
        </div>
      </div>
    </header>
      <div
        className="atlas-ai-utility-strip"
        data-autoteams-ai-utility-strip="true"
      >
        <div className="container atlas-ai-utility-strip-inner">
          <AtlasAiAllowanceBadge />
        </div>
      </div>
    </>
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
            AI-powered team intelligence with human
            review at the centre.
          </p>
        </div>

        <div className="footer-links">
      <Link href="/">Product Overview</Link>
          <Link href="/people">People</Link>
          <Link href="/team-builder">
            Build Team
          </Link>
          <Link href="/gemini-team-coach">
            Gemini Team Coach
          </Link>
          <Link href="/pricing">Pricing</Link>
      <Link href="/trust-centre">
            Trust Centre
          </Link>

          
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
      <AtlasProfileBanner />
      <main>{children}

      <AtlasSupport /></main>
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

// AUTOTEAMS_V715715251_MESSAGE_ICON
