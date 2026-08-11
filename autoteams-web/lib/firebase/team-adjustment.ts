"use client";

import {
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AdjustableTeam = {
  id: string;
  name: string;
  purpose?: string;
  ownerId?: string;
  workspaceId?: string;
  contextId?: string;
  contextName?: string;
  profileType?: string;
  memberIds: string[];
  personIds: string[];
};

function asString(
  value: unknown,
) {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : undefined;
}

function asStringArray(
  value: unknown,
) {
  return Array.isArray(value)
    ? value.filter(
        (
          item,
        ): item is string =>
          typeof item === "string" &&
          Boolean(item.trim()),
      )
    : [];
}

export async function loadTeamForAdjustment(
  teamId: string,
): Promise<AdjustableTeam | null> {
  const snapshot =
    await getDoc(
      doc(
        db,
        "teams",
        teamId,
      ),
    );

  if (!snapshot.exists()) {
    return null;
  }

  const data =
    snapshot.data();

  const ownerId =
    asString(
      data.ownerId,
    );

  const memberIds =
    asStringArray(
      data.memberIds,
    );

  const personIds =
    asStringArray(
      data.personIds,
    );

  const selectedPeople =
    personIds.length
      ? personIds
      : memberIds.filter(
          (id) =>
            id !== ownerId,
        );

  return {
    id:
      snapshot.id,

    name:
      asString(
        data.name,
      ) ??
      "Saved team",

    purpose:
      asString(
        data.purpose,
      ),

    ownerId,

    workspaceId:
      asString(
        data.workspaceId,
      ),

    contextId:
      asString(
        data.contextId,
      ),

    contextName:
      asString(
        data.contextName,
      ),

    profileType:
      asString(
        data.profileType,
      ),

    memberIds,

    personIds:
      selectedPeople,
  };
}
