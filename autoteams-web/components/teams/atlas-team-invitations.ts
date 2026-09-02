"use client";

export const ATLAS_TEAM_INVITE_KEY =
  "autoteams-atlas-candidate-invitations-v71571515";

export const SAVED_TEAM_KEY =
  "autoteams-v20-saved-teams";

export type AtlasTeamInvitationStatus =
  | "pending"
  | "accepted"
  | "declined";

export type AtlasTeamInvitation = {
  id: string;
  teamId: string;
  teamName: string;
  personId: string;
  personName: string;
  personEmail?: string;
  score?: number;
  source: "atlas-candidate-matching";
  status: AtlasTeamInvitationStatus;
  createdAt: string;
  respondedAt?: string;
};

export function loadAtlasTeamInvitations(): AtlasTeamInvitation[] {
  try {
    const raw = localStorage.getItem(ATLAS_TEAM_INVITE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAtlasTeamInvitations(
  invitations: AtlasTeamInvitation[],
) {
  localStorage.setItem(
    ATLAS_TEAM_INVITE_KEY,
    JSON.stringify(invitations),
  );

  window.dispatchEvent(
    new Event("autoteams:atlas-team-invitations-changed"),
  );
}

function loadTeams(): Array<Record<string, unknown>> {
  try {
    const raw = localStorage.getItem(SAVED_TEAM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function stringIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map(item => String(item || "").trim())
        .filter(Boolean)
    : [];
}

export function acceptAtlasTeamInvitation(
  invitationId: string,
) {
  const invitations = loadAtlasTeamInvitations();
  const invitation = invitations.find(item => item.id === invitationId);

  if (!invitation) {
    throw new Error("This team invitation could not be found.");
  }

  if (invitation.status !== "pending") {
    return invitation;
  }

  const teams = loadTeams();
  let foundTeam = false;

  const nextTeams = teams.map(team => {
    if (String(team.id || "") !== invitation.teamId) {
      return team;
    }

    foundTeam = true;

    const personIds = new Set([
      ...stringIds(team.personIds),
      ...stringIds(team.memberIds),
    ]);

    personIds.add(invitation.personId);

    const openPlaces =
      typeof team.openPlaces === "number"
        ? Math.max(0, Number(team.openPlaces) - 1)
        : 0;

    return {
      ...team,
      personIds: [...personIds],
      openPlaces,
      status:
        openPlaces > 0
          ? "recruiting"
          : "formed",
      lifecycleUpdatedAt: new Date().toISOString(),
    };
  });

  if (!foundTeam) {
    throw new Error(
      "The team linked to this invitation is no longer available.",
    );
  }

  localStorage.setItem(
    SAVED_TEAM_KEY,
    JSON.stringify(nextTeams),
  );

  const respondedAt = new Date().toISOString();

  const nextInvitations = invitations.map(item =>
    item.id === invitationId
      ? {
          ...item,
          status: "accepted" as const,
          respondedAt,
        }
      : item,
  );

  saveAtlasTeamInvitations(nextInvitations);

  window.dispatchEvent(
    new Event("autoteams:team-lifecycle-changed"),
  );

  return nextInvitations.find(item => item.id === invitationId)!;
}

export function declineAtlasTeamInvitation(
  invitationId: string,
) {
  const invitations = loadAtlasTeamInvitations();
  const respondedAt = new Date().toISOString();

  const next = invitations.map(item =>
    item.id === invitationId && item.status === "pending"
      ? {
          ...item,
          status: "declined" as const,
          respondedAt,
        }
      : item,
  );

  saveAtlasTeamInvitations(next);

  return next.find(item => item.id === invitationId);
}
