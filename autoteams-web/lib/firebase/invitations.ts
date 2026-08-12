"use client";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WorkspaceInvitation } from "@/lib/workspace-access";

export type StoredInvitation = WorkspaceInvitation & {
  ownerId: string;
  inviterName?: string;
  inviterEmail?: string;
  emailStatus?: "not_sent" | "sent" | "failed";
};

export async function persistInvitation(
  invitation: WorkspaceInvitation,
  ownerId: string,
  inviter?: {
    name?: string | null;
    email?: string | null;
  },
): Promise<void> {
  await setDoc(
    doc(db, "invitations", invitation.token),
    {
      ...invitation,
      ownerId,
      inviterName: inviter?.name ?? null,
      inviterEmail: inviter?.email ?? null,
      emailStatus: "not_sent",
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateInvitationEmailStatus(
  token: string,
  status: "sent" | "failed",
): Promise<void> {
  await setDoc(
    doc(db, "invitations", token),
    {
      emailStatus: status,
      emailSentAt:
        status === "sent" ? serverTimestamp() : null,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function loadInvitationByToken(
  token: string,
): Promise<StoredInvitation | null> {
  const snapshot = await getDoc(
    doc(db, "invitations", token),
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as StoredInvitation;
}
