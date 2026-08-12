"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadPeople } from "@/lib/workspaces";

type ProfileMode =
  | "all"
  | "business"
  | "sports"
  | "friendship"
  | "community"
  | "education";

type DirectoryPerson = ReturnType<typeof loadPeople>[number];

const contexts: Array<{
  id: ProfileMode;
  label: string;
  icon: string;
}> = [
  { id: "all", label: "All people", icon: "◎" },
  { id: "business", label: "Work", icon: "⌂" },
  { id: "sports", label: "Sport", icon: "◉" },
  { id: "friendship", label: "Friendship", icon: "♡" },
  { id: "community", label: "Community", icon: "♙" },
  { id: "education", label: "Education", icon: "▥" },
];

function normaliseContext(person: DirectoryPerson): ProfileMode | undefined {
  const raw = person as unknown as Record<string, unknown>;

  const value = String(
    raw.profileContext ??
      raw.profileType ??
      raw.context ??
      raw.mode ??
      "",
  ).toLowerCase();

  if (["business", "work", "organisation"].includes(value)) {
    return "business";
  }

  if (["sports", "sport"].includes(value)) {
    return "sports";
  }

  if (["friendship", "friends_family", "personal"].includes(value)) {
    return "friendship";
  }

  if (value === "community") {
    return "community";
  }

  if (value === "education") {
    return "education";
  }

  return undefined;
}

function personStrengths(person: DirectoryPerson): string[] {
  const raw = person as unknown as Record<string, unknown>;
  const strengths = raw.strengths;

  return Array.isArray(strengths)
    ? strengths.filter((item): item is string => typeof item === "string")
    : [];
}

function profileReady(person: DirectoryPerson) {
  const raw = person as unknown as Record<string, unknown>;

  return Boolean(
    raw.teamDnaStatus === "complete" ||
      raw.teamDnaStatus === "completed" ||
      raw.profileStatus === "complete" ||
      raw.profileStatus === "completed" ||
      raw.atlasStatus === "complete" ||
      raw.atlasStatus === "completed" ||
      personStrengths(person).length > 0,
  );
}

function secondaryLine(person: DirectoryPerson) {
  const raw = person as unknown as Record<string, unknown>;

  return [
    raw.jobTitle,
    raw.department,
    raw.location,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .slice(0, 2)
    .join(" · ");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PeopleDirectory() {
  const [people, setPeople] = useState<DirectoryPerson[]>([]);
  const [context, setContext] = useState<ProfileMode>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPeople(loadPeople());
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return people.filter((person) => {
      const personContext = normaliseContext(person);

      // Legacy people may not yet carry an explicit profile context.
      // Keep them discoverable under All people rather than inventing one.
      if (context !== "all" && personContext !== context) {
        return false;
      }

      if (!query) {
        return true;
      }

      const strengths = personStrengths(person).join(" ");
      const raw = person as unknown as Record<string, unknown>;

      return [
        person.name,
        person.email,
        raw.jobTitle,
        raw.department,
        raw.location,
        strengths,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [people, context, search]);

  const readyCount = people.filter(profileReady).length;
  const knownContextCount = new Set(
    people
      .map(normaliseContext)
      .filter((value): value is Exclude<ProfileMode, "all"> => Boolean(value)),
  ).size;

  const selectedContext =
    contexts.find((item) => item.id === context) ?? contexts[0];

  return (
    <main className="people38-page">
      <section className="people38-hero">
        <div className="container people38-hero-grid">
          <div>
            <span className="eyebrow">People directory</span>
            <h1>Your AutoTeams network.</h1>
            <p>
              See the people you can build teams with, understand what they
              bring and move directly from discovery into team building.
            </p>

            <div className="people38-hero-actions">
              <Link className="button" href="/members#invite">
                Invite people
              </Link>
              <Link className="button secondary" href="/team-builder">
                Build a team
              </Link>
            </div>
          </div>

          <aside className="people38-atlas-card">
            <span className="eyebrow">Powered by Atlas</span>
            <h2>Find the right mix of people.</h2>
            <p>
              Profiles, strengths and context help AutoTeams explain who may
              complement the team you are trying to build.
            </p>
            <div>
              <span>✦ Search strengths</span>
              <span>◎ Filter by profile</span>
              <span>→ Move into Team Builder</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="container people38-body">
        <div className="people38-stats">
          <article>
            <small>People in network</small>
            <strong>{people.length}</strong>
          </article>
          <article>
            <small>Atlas-ready</small>
            <strong>{readyCount}</strong>
          </article>
          <article>
            <small>Profile contexts</small>
            <strong>{knownContextCount || "—"}</strong>
          </article>
          <article>
            <small>Showing now</small>
            <strong>{filtered.length}</strong>
          </article>
        </div>

        <section className="people38-controls">
          <div>
            <span className="eyebrow">Explore people</span>
            <h2>Who could contribute?</h2>
            <p>
              Filter by profile context or search by name, role, location or
              strengths.
            </p>
          </div>

          <label className="people38-search">
            <span>Search people</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, role, location or strength..."
              type="search"
              value={search}
            />
          </label>
        </section>

        <div className="people38-contexts" aria-label="Profile context filter">
          {contexts.map((item) => {
            const active = item.id === context;

            return (
              <button
                className={active ? "active" : ""}
                key={item.id}
                onClick={() => setContext(item.id)}
                type="button"
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        <section className="people38-directory">
          <div className="people38-directory-heading">
            <div>
              <span className="eyebrow">{selectedContext.label}</span>
              <h2>{filtered.length} people available</h2>
            </div>
            <Link className="button secondary" href="/members#invite">
              + Invite someone
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="people38-empty">
              <div>◎</div>
              <h3>No people found in this profile context.</h3>
              <p>
                Invite someone new, or choose All people to see legacy
                connections that do not yet have a profile context.
              </p>
              <Link className="button" href="/members#invite">
                Invite people
              </Link>
            </div>
          ) : (
            <div className="people38-grid">
              {filtered.map((person) => {
                const strengths = personStrengths(person);
                const personContext = normaliseContext(person);
                const contextInfo = contexts.find(
                  (item) => item.id === personContext,
                );

                return (
                  <article className="people38-card" key={person.id}>
                    <div className="people38-card-top">
                      <div className="people38-avatar">
                        {initials(person.name || "AT")}
                      </div>
                      <div className="people38-person-title">
                        <h3>{person.name}</h3>
                        <p>{secondaryLine(person) || person.email}</p>
                      </div>
                      <span
                        className={
                          profileReady(person)
                            ? "people38-ready ready"
                            : "people38-ready"
                        }
                      >
                        {profileReady(person)
                          ? "Atlas ready"
                          : "Profile developing"}
                      </span>
                    </div>

                    <div className="people38-meta">
                      {contextInfo && (
                        <span>
                          {contextInfo.icon} {contextInfo.label}
                        </span>
                      )}
                      {person.email && <span>{person.email}</span>}
                    </div>

                    <div className="people38-strengths">
                      <small>Strengths</small>
                      <div>
                        {strengths.length ? (
                          strengths.slice(0, 4).map((strength) => (
                            <span key={strength}>{strength}</span>
                          ))
                        ) : (
                          <em>Atlas profile not completed yet</em>
                        )}
                      </div>
                    </div>

                    <div className="people38-actions">
                      <Link
                        className="button small"
                        href={`/team-builder?person=${encodeURIComponent(
                          person.id,
                        )}${
                          personContext
                            ? `&profile=${encodeURIComponent(personContext)}`
                            : ""
                        }`}
                      >
                        Add to team
                      </Link>
                      <Link
                        className="button secondary small"
                        href={`/people/${encodeURIComponent(person.id)}`}
                      >
                        View profile
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="people38-explainer">
          <div>
            <span className="eyebrow">Simple product model</span>
            <h2>People are your network, not another admin screen.</h2>
          </div>
          <div className="people38-flow">
            <span><strong>Profiles</strong><small>Who I am</small></span>
            <b>→</b>
            <span><strong>Invite</strong><small>Bring people in</small></span>
            <b>→</b>
            <span><strong>People</strong><small>Discover the network</small></span>
            <b>→</b>
            <span><strong>Build Team</strong><small>Create the right mix</small></span>
          </div>
        </section>
      </section>
    </main>
  );
}
