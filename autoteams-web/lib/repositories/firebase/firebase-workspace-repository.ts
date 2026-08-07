"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  getFirebaseFirestore,
} from "@/lib/firebase/client";
import {
  waitForFirebaseUser,
} from "@/lib/firebase/auth-ready";
import type {
  Workspace,
} from "@/lib/workspaces";
import type {
  WorkspaceRepository,
} from "@/lib/repositories/types";

type WorkspaceMembershipRecord = {
  id: string;
  workspaceId: string;
  userId: string;
  role:
    | "owner"
    | "admin"
    | "member";
  status:
    | "active"
    | "invited";
};

export class FirebaseWorkspaceRepository
  implements WorkspaceRepository
{
  async list(): Promise<Workspace[]> {
    const user =
      await requireCurrentUser();

    const db =
      getFirebaseFirestore();

    const membershipSnapshot =
      await getDocs(
        query(
          collection(
            db,
            "workspaceMemberships",
          ),
          where(
            "userId",
            "==",
            user.uid,
          ),
          where(
            "status",
            "==",
            "active",
          ),
        ),
      );

    const memberships =
      membershipSnapshot.docs.map(
        (item) =>
          item.data() as WorkspaceMembershipRecord,
      );

    const workspaces =
      await Promise.all(
        memberships.map(
          async (membership) => {
            const snapshot =
              await getDoc(
                doc(
                  db,
                  "workspaces",
                  membership.workspaceId,
                ),
              );

            if (!snapshot.exists()) {
              return undefined;
            }

            return snapshot.data() as Workspace;
          },
        ),
      );

    return workspaces.filter(
      (
        workspace,
      ): workspace is Workspace =>
        Boolean(workspace),
    );
  }

  async save(
    workspaces: Workspace[],
  ): Promise<void> {
    const user =
      await requireCurrentUser();

    const db =
      getFirebaseFirestore();

    await Promise.all(
      workspaces.map(
        async (workspace) => {
          const workspaceId =
            workspace.id;

          const membershipId =
            `${workspaceId}_${user.uid}`;

          await setDoc(
            doc(
              db,
              "workspaces",
              workspaceId,
            ),
            {
              ...stripUndefined(
                workspace,
              ),
              ownerId:
                user.uid,
              updatedAt:
                new Date().toISOString(),
            },
            {
              merge: true,
            },
          );

          await setDoc(
            doc(
              db,
              "workspaceMemberships",
              membershipId,
            ),
            {
              id:
                membershipId,
              workspaceId,
              userId:
                user.uid,
              role:
                "owner",
              status:
                "active",
              updatedAt:
                new Date().toISOString(),
            },
            {
              merge: true,
            },
          );
        },
      ),
    );
  }

  async getActiveId(): Promise<string> {
    const user =
      await requireCurrentUser();

    const db =
      getFirebaseFirestore();

    const snapshot =
      await getDoc(
        doc(
          db,
          "userPreferences",
          user.uid,
        ),
      );

    if (!snapshot.exists()) {
      return "";
    }

    const value =
      snapshot.data()
        .activeWorkspaceId;

    return typeof value === "string"
      ? value
      : "";
  }

  async setActiveId(
    workspaceId: string,
  ): Promise<void> {
    const user =
      await requireCurrentUser();

    const db =
      getFirebaseFirestore();

    await setDoc(
      doc(
        db,
        "userPreferences",
        user.uid,
      ),
      {
        userId:
          user.uid,
        activeWorkspaceId:
          workspaceId,
        updatedAt:
          new Date().toISOString(),
      },
      {
        merge: true,
      },
    );
  }
}

async function requireCurrentUser() {
  const user =
    await waitForFirebaseUser();

  if (!user) {
    throw new Error(
      "A Firebase-authenticated user is required to access Firestore workspaces.",
    );
  }

  return user;
}

function stripUndefined<T extends object>(
  value: T,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) =>
        item !== undefined,
    ),
  );
}
