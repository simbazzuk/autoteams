"use client";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getFirebaseFirestore,
} from "@/lib/firebase/client";
import {
  waitForFirebaseUser,
} from "@/lib/firebase/auth-ready";
import {
  loadActiveWorkspaceId,
  loadWorkspaces,
  type Workspace,
} from "@/lib/workspaces";
import {
  ensureWorkspaceOwnerMembership,
} from "@/lib/firebase/workspace-membership";

export type WorkspaceMigrationResult = {
  userId: string;
  workspaceCount: number;
  migratedWorkspaceIds: string[];
  activeWorkspaceId: string;
  skipped: number;
};

export async function migrateLocalWorkspacesToFirestore(): Promise<WorkspaceMigrationResult> {
  const user =
    await waitForFirebaseUser();

  if (!user) {
    throw new Error(
      "Sign in with Firebase before migrating workspaces.",
    );
  }

  const workspaces =
    loadWorkspaces();

  const activeWorkspaceId =
    loadActiveWorkspaceId();

  const db =
    getFirebaseFirestore();

  const migratedWorkspaceIds:
    string[] = [];

  let skipped = 0;

  for (
    const workspace
    of workspaces
  ) {
    const workspaceRef =
      doc(
        db,
        "workspaces",
        workspace.id,
      );

    const existing =
      await getDoc(
        workspaceRef,
      );

    if (
      existing.exists() &&
      existing.data().ownerId &&
      existing.data().ownerId !==
        user.uid
    ) {
      skipped += 1;
      continue;
    }

    await setDoc(
      workspaceRef,
      {
        ...stripUndefined(
          workspace,
        ),
        ownerId:
          user.uid,
        migratedFrom:
          "localStorage",
        migrationVersion:
          "v4.0-phase3.1",
        updatedAt:
          serverTimestamp(),
        ...(existing.exists()
          ? {}
          : {
              cloudCreatedAt:
                serverTimestamp(),
            }),
      },
      {
        merge: true,
      },
    );

    await ensureWorkspaceOwnerMembership({
      workspaceId:
        workspace.id,
      userId:
        user.uid,
    });

    migratedWorkspaceIds.push(
      workspace.id,
    );
  }

  if (
    activeWorkspaceId &&
    migratedWorkspaceIds.includes(
      activeWorkspaceId,
    )
  ) {
    await setDoc(
      doc(
        db,
        "userPreferences",
        user.uid,
      ),
      {
        userId:
          user.uid,
        activeWorkspaceId,
        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      },
    );
  }

  await setDoc(
    doc(
      db,
      "migrationStatus",
      user.uid,
    ),
    {
      userId:
        user.uid,
      workspaceMigration:
        "complete",
      workspaceCount:
        migratedWorkspaceIds.length,
      skipped,
      phase:
        "v4.0-phase3.1",
      completedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  return {
    userId:
      user.uid,
    workspaceCount:
      migratedWorkspaceIds.length,
    migratedWorkspaceIds,
    activeWorkspaceId:
      activeWorkspaceId || "",
    skipped,
  };
}

function stripUndefined(
  workspace: Workspace,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(
      workspace,
    ).filter(
      ([, value]) =>
        value !== undefined,
    ),
  );
}
