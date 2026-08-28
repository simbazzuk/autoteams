"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadActiveWorkspaceId } from "@/lib/workspaces";

type SavedTeamSummary = {
  id: string;
  workspaceId?: string;
  name: string;
  purpose?: string;
  createdAt?: string;
};

const STORAGE_KEY = "autoteams-v20-saved-teams";
const FREE_LIMIT = 5;

function readSavedTeams(): SavedTeamSummary[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : "",
        workspaceId: typeof item.workspaceId === "string" ? item.workspaceId : undefined,
        name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Saved team",
        purpose: typeof item.purpose === "string" ? item.purpose : undefined,
        createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
      }))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

export function SavedTeamsAllowanceDropdown() {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<SavedTeamSummary[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  function refresh() {
    setTeams(readSavedTeams());
  }

  useEffect(() => {
    refresh();

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === STORAGE_KEY) refresh();
    };

    const onSaved = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener("autoteams:firebase-team-persisted", onSaved);
    window.addEventListener("autoteams:saved-team-updated", onSaved);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("autoteams:firebase-team-persisted", onSaved);
      window.removeEventListener("autoteams:saved-team-updated", onSaved);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const activeWorkspaceId =
    typeof window !== "undefined" ? loadActiveWorkspaceId() : "";

  const visibleTeams = useMemo(() => {
    const scoped = activeWorkspaceId
      ? teams.filter(
          (team) => !team.workspaceId || team.workspaceId === activeWorkspaceId,
        )
      : teams;

    return [...scoped].sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || ""),
    );
  }, [teams, activeWorkspaceId]);

  const used = Math.min(visibleTeams.length, FREE_LIMIT);

  return (
    <div
      ref={rootRef}
      className="teamscience-saved-teams-dropdown-v7157101"
      data-teamscience-saved-teams-dropdown-v7157101="true"
    >
      <button
        className="teamscience-saved-teams-trigger-v7157101"
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          refresh();
          setOpen((current) => !current);
        }}
      >
        <span>Saved teams</span>
        <strong>{used}/{FREE_LIMIT}</strong>
        <span aria-hidden="true">{open ? "^" : "v"}</span>
      </button>

      {open && (
        <section
          className="teamscience-saved-teams-panel-v7157101"
          role="dialog"
          aria-label="Saved teams"
        >
          <header>
            <div>
              <small>SAVED TEAMS</small>
              <strong>Your saved teams</strong>
            </div>
            <button
              type="button"
              aria-label="Close saved teams"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          {visibleTeams.length ? (
            <div className="teamscience-saved-teams-list-v7157101">
              {visibleTeams.slice(0, FREE_LIMIT).map((team) => (
                <article key={team.id}>
                  <div>
                    <strong>{team.name}</strong>
                    {team.purpose ? <small>{team.purpose}</small> : null}
                  </div>
                  <Link href="/teams" onClick={() => setOpen(false)}>
                    View →
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="teamscience-saved-teams-empty-v7157101">
              <strong>No saved teams yet</strong>
              <span>Teams you save in Build Team will appear here.</span>
            </div>
          )}

          <footer>
            <span>
              <strong>{used}</strong> of <strong>{FREE_LIMIT}</strong> saved-team credits used
            </span>
            <Link href="/teams" onClick={() => setOpen(false)}>
              View all saved teams →
            </Link>
          </footer>
        </section>
      )}
    </div>
  );
}
