"use client";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  useEffect,
  useRef,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";

type RecordLike =
  Record<string, unknown>;

const TEAM_KEY_PATTERN =
  /team|savedteam|recommendation/i;

const DELETED_TEAMS_KEY =
  "autoteams-deleted-team-ids-v71317";

function deletedTeamIds() {
  try {
    const raw = localStorage.getItem(DELETED_TEAMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set<string>(
      Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

function isRecord(
  value: unknown,
): value is RecordLike {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  );
}

function stringValue(
  value: unknown,
) {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : undefined;
}

function normaliseProfileType(
  value?: string,
) {
  const raw =
    (value ?? "")
      .toLowerCase()
      .trim();

  if (
    [
      "business",
      "work",
      "professional",
    ].includes(raw)
  ) {
    return "work";
  }

  if (
    [
      "sport",
      "sports",
    ].includes(raw)
  ) {
    return "sport";
  }

  if (
    [
      "friendship",
      "personal",
      "friends",
      "friends & family",
    ].includes(raw)
  ) {
    return "friendship";
  }

  if (raw === "community") {
    return "community";
  }

  if (raw === "education") {
    return "education";
  }

  return raw || "work";
}

function inferProfileType(
  team: RecordLike,
) {
  const explicit =
    stringValue(
      team.profileType ??
        team.contextType ??
        team.teamType ??
        team.workspaceType ??
        team.groupType,
    );

  if (explicit) {
    return normaliseProfileType(
      explicit,
    );
  }

  const context =
    stringValue(
      team.workspaceId ??
        team.contextId ??
        team.workspaceName ??
        team.contextName,
    )
      ?.toLowerCase();

  if (!context) {
    return "work";
  }

  if (
    context.includes("community")
  ) {
    return "community";
  }

  if (
    context.includes("sport") ||
    context.includes("football") ||
    context.includes("rugby")
  ) {
    return "sport";
  }

  if (
    context.includes("friend")
  ) {
    return "friendship";
  }

  if (
    context.includes("education") ||
    context.includes("school") ||
    context.includes("study")
  ) {
    return "education";
  }

  return "work";
}

function personId(
  value: unknown,
) {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    isRecord(value)
  ) {
    return stringValue(
      value.uid ??
        value.userId ??
        value.memberId ??
        value.personId ??
        value.id,
    );
  }

  return undefined;
}

function looksLikePerson(
  value: RecordLike,
) {
  const personSignals = [
    "email",
    "displayName",
    "firstName",
    "lastName",
    "jobTitle",
    "teamDnaStatus",
    "profileReady",
  ];

  return personSignals.some(
    (key) => key in value,
  );
}

function looksLikeTeam(
  value: RecordLike,
) {
  if (
    looksLikePerson(value)
  ) {
    return false;
  }

  const name =
    stringValue(
      value.name ??
        value.teamName ??
        value.title ??
        value.label,
    );

  if (!name) {
    return false;
  }

  const explicitSignals = [
    "teamId",
    "savedTeamId",
    "teamName",
    "teamType",
    "recommendationId",
  ];

  if (
    explicitSignals.some(
      (key) => key in value,
    )
  ) {
    return true;
  }

  const members = [
    value.members,
    value.people,
    value.memberIds,
    value.personIds,
    value.userIds,
    value.players,
  ];

  return members.some(
    Array.isArray,
  );
}

function flattenTeams(
  value: unknown,
): RecordLike[] {
  if (
    Array.isArray(value)
  ) {
    return value.flatMap(
      flattenTeams,
    );
  }

  if (
    !isRecord(value)
  ) {
    return [];
  }

  const found:
    RecordLike[] = [];

  if (
    looksLikeTeam(value)
  ) {
    found.push(value);
  }

  for (
    const [
      key,
      nested,
    ] of Object.entries(
      value,
    )
  ) {
    if (
      /team|result|recommend|item/i.test(
        key,
      )
    ) {
      found.push(
        ...flattenTeams(
          nested,
        ),
      );
    }
  }

  return found;
}

function stableHash(
  value: string,
) {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^=
      value.charCodeAt(
        index,
      );

    hash =
      Math.imul(
        hash,
        16777619,
      );
  }

  return (
    hash >>> 0
  ).toString(36);
}

function safeDocumentId(
  value: string,
) {
  return value
    .replace(
      /[\/\\#?]/g,
      "-",
    )
    .replace(
      /\s+/g,
      "-",
    )
    .replace(
      /-+/g,
      "-",
    )
    .slice(0, 120);
}

function memberIdsFrom(
  value: RecordLike,
) {
  const members =
    value.memberIds ??
    value.userIds ??
    value.personIds ??
    value.members ??
    value.people ??
    value.players;

  if (
    !Array.isArray(members)
  ) {
    return [];
  }

  return [
    ...new Set(
      members
        .map(personId)
        .filter(
          (
            id,
          ): id is string =>
            Boolean(id),
        ),
    ),
  ];
}

function teamDocument(
  team: RecordLike,
  ownerId: string,
  sourceKey: string,
) {
  const name =
    stringValue(
      team.name ??
        team.teamName ??
        team.title ??
        team.label,
    );

  if (!name) {
    return null;
  }

  const contextId =
    stringValue(
      team.contextId ??
        team.workspaceId ??
        team.groupId ??
        team.organisationId ??
        team.organizationId,
    );

  const contextName =
    stringValue(
      team.contextName ??
        team.workspaceName ??
        team.groupName ??
        team.organisationName ??
        team.organizationName,
    );

  const rawId =
    stringValue(
      team.teamId ??
        team.savedTeamId ??
        team.id,
    );

  let adjustment:
    {
      teamId?: string;
      name?: string;
      workspaceId?: string | null;
    } | null =
    null;

  try {
    const rawAdjustment =
      localStorage.getItem(
        "autoteams-adjust-team-v7136",
      );

    adjustment =
      rawAdjustment
        ? JSON.parse(
            rawAdjustment,
          )
        : null;
  } catch {
    adjustment = null;
  }

  const adjustmentMatches =
    Boolean(
      adjustment?.teamId &&
      adjustment?.name &&
      adjustment.name ===
        name &&
      (
        !adjustment.workspaceId ||
        adjustment.workspaceId ===
          (
            stringValue(
              team.workspaceId,
            ) ??
            contextId ??
            null
          )
      ),
    );

  const derivedKey =
    [
      ownerId,
      contextId ?? "",
      name,
      sourceKey,
    ].join("|");

  const id =
    safeDocumentId(
      adjustmentMatches
        ? adjustment!.teamId!
        : rawId ??
          `team-${stableHash(
            derivedKey,
          )}`,
    );

  const existingMembers =
    memberIdsFrom(team);

  const memberIds =
    existingMembers.includes(
      ownerId,
    )
      ? existingMembers
      : [
          ownerId,
          ...existingMembers,
        ];

  const profileType =
    inferProfileType(
      team,
    );

  return {
    id,
    data: {
      id,
      name,
      purpose:
        stringValue(
          team.purpose,
        ) ?? null,

      ownerId,

      workspaceId:
        stringValue(
          team.workspaceId,
        ) ??
        contextId ??
        null,

      contextId:
        contextId ?? null,

      contextName:
        contextName ?? null,

      profileType,

      memberIds,
      personIds:
        memberIds.filter(
          (memberId) =>
            memberId !== ownerId,
        ),

      memberCount:
        memberIds.length,

      confidence:
        typeof team.confidence ===
        "number"
          ? team.confidence
          : null,

      recommendation:
        isRecord(
          team.recommendation,
        )
          ? team.recommendation
          : null,

      sourceCreatedAt:
        stringValue(
          team.createdAt,
        ) ?? null,

      status:
        stringValue(
          team.status,
        ) ?? "active",

      source:
        "autoteams-v20-saved-teams",

      sourceKey,

      legacyId:
        rawId ?? null,

      updatedAt:
        serverTimestamp(),
    },
  };
}

async function persistCandidate(
  team: RecordLike,
  ownerId: string,
  sourceKey: string,
) {
  const mapped =
    teamDocument(
      team,
      ownerId,
      sourceKey,
    );

  if (!mapped) {
    return;
  }

  // v7.13.17: legacy localStorage may still contain a team after the
  // Firestore document is deleted. A tombstone is authoritative and stops
  // this migration bridge from recreating that team.
  if (deletedTeamIds().has(mapped.id)) {
    return;
  }

  await setDoc(
    doc(
      db,
      "teams",
      mapped.id,
    ),
    {
      ...mapped.data,
      migratedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  window.dispatchEvent(
    new CustomEvent(
      "autoteams:firebase-team-persisted",
      {
        detail: {
          teamId:
            mapped.id,
          name:
            mapped.data.name,
        },
      },
    ),
  );

  try {
    const rawAdjustment =
      localStorage.getItem(
        "autoteams-adjust-team-v7136",
      );

    if (rawAdjustment) {
      const adjustment =
        JSON.parse(
          rawAdjustment,
        );

      if (
        adjustment?.teamId ===
          mapped.id
      ) {
        localStorage.removeItem(
          "autoteams-adjust-team-v7136",
        );

        window.dispatchEvent(
          new CustomEvent(
            "autoteams:team-adjustment-completed",
            {
              detail: {
                teamId:
                  mapped.id,
                name:
                  mapped.data.name,
              },
            },
          ),
        );
      }
    }
  } catch {}
}

async function persistRawValue(
  key: string,
  raw: string,
  ownerId: string,
) {
  if (
    !TEAM_KEY_PATTERN.test(
      key,
    )
  ) {
    return;
  }

  let parsed:
    unknown;

  try {
    parsed =
      JSON.parse(raw);
  } catch {
    return;
  }

  const candidates =
    flattenTeams(parsed);

  for (
    const candidate
    of candidates
  ) {
    try {
      await persistCandidate(
        candidate,
        ownerId,
        key,
      );
    } catch (
      error
    ) {
      console.warn(
        "[AutoTeams] Firebase team persistence failed:",
        error,
      );

      window.dispatchEvent(
        new CustomEvent(
          "autoteams:firebase-team-persist-failed",
          {
            detail: {
              message:
                error instanceof Error
                  ? error.message
                  : "Couldn’t save this team. Please try again.",
            },
          },
        ),
      );
    }
  }
}

async function scanExistingTeams(
  ownerId: string,
) {
  for (
    let index = 0;
    index <
      localStorage.length;
    index += 1
  ) {
    const key =
      localStorage.key(
        index,
      );

    if (!key) {
      continue;
    }

    const raw =
      localStorage.getItem(
        key,
      );

    if (
      !key ||
      !raw
    ) {
      continue;
    }

    await persistRawValue(
      key,
      raw,
      ownerId,
    );
  }
}

export function TeamPersistenceBridge() {
  const auth =
    useAuth() as unknown as {
      user?: {
        uid?: string;
      } | null;
    };

  const uid =
    auth.user?.uid;

  const originalSetItemRef =
    useRef<
      typeof Storage.prototype.setItem
      | null
    >(null);

  useEffect(() => {
    if (!uid) {
      return;
    }

    /*
     * Capture the narrowed uid in a definite string.
     * TypeScript does not preserve the uid narrowing inside nested callbacks.
     */
    const ownerId: string = uid;

    let active = true;

    void scanExistingTeams(
      ownerId,
    );

    const originalSetItem =
      Storage.prototype.setItem;

    originalSetItemRef.current =
      originalSetItem;

    Storage.prototype.setItem =
      function (
        key: string,
        value: string,
      ) {
        originalSetItem.call(
          this,
          key,
          value,
        );

        if (
          active &&
          this ===
            window.localStorage
        ) {
          void persistRawValue(
            key,
            value,
            ownerId,
          );
        }
      };

    function rescan() {
      if (active) {
        void scanExistingTeams(
      ownerId,
    );
      }
    }

    window.addEventListener(
      "focus",
      rescan,
    );

    document.addEventListener(
      "visibilitychange",
      rescan,
    );

    return () => {
      active = false;

      window.removeEventListener(
        "focus",
        rescan,
      );

      document.removeEventListener(
        "visibilitychange",
        rescan,
      );

      if (
        originalSetItemRef.current
      ) {
        Storage.prototype.setItem =
          originalSetItemRef.current;
      }
    };
  }, [uid]);

  return null;
}
