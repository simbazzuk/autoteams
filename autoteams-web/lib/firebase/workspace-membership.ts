"use client";

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import {
  getFirebaseFirestore,
} from "@/lib/firebase/client";

export type WorkspaceRole =
  | "owner"
  | "admin"
  | "member";

export type WorkspaceMembership = {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  status: "active" | "invited";
};

export async function ensureWorkspaceOwnerMembership(input: {
  workspaceId: string;
  userId: string;
}): Promise<void> {
  const db =
    getFirebaseFirestore();

  const id =
    `${input.workspaceId}_${input.userId}`;

  await setDoc(
    doc(
      db,
      "workspaceMemberships",
      id,
    ),
    {
      id,
      workspaceId:
        input.workspaceId,
      userId:
        input.userId,
      role: "owner",
      status: "active",
      updatedAt:
        serverTimestamp(),
      createdAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

export async function listMembershipsForUser(
  userId: string,
): Promise<WorkspaceMembership[]> {
  const db =
    getFirebaseFirestore();

  const snapshot =
    await getDocs(
      query(
        collection(
          db,
          "workspaceMemberships",
        ),
        where(
          "userId",
          "==",
          userId,
        ),
      ),
    );

  return snapshot.docs.map(
    (item) =>
      item.data() as WorkspaceMembership,
  );
}
