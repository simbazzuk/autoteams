"use client";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  getFirebaseFirestore,
} from "@/lib/firebase/client";
import {
  waitForFirebaseUser,
} from "@/lib/firebase/auth-ready";
import {
  loadWorkspaces,
} from "@/lib/workspaces";
import {
  FirebaseWorkspaceRepository,
} from "@/lib/repositories/firebase/firebase-workspace-repository";

export type WorkspaceCloudStatus = {
  localWorkspaceCount: number;
  cloudWorkspaceCount: number;
  membershipCount: number;
  activeCloudWorkspaceId: string;
  signedIn: boolean;
};

export async function getWorkspaceCloudStatus(): Promise<WorkspaceCloudStatus> {
  const user =
    await waitForFirebaseUser();

  const localWorkspaceCount =
    loadWorkspaces().length;

  if (!user) {
    return {
      localWorkspaceCount,
      cloudWorkspaceCount: 0,
      membershipCount: 0,
      activeCloudWorkspaceId: "",
      signedIn: false,
    };
  }

  const db =
    getFirebaseFirestore();

  const memberships =
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

  const repository =
    new FirebaseWorkspaceRepository();

  const cloudWorkspaces =
    await repository.list();

  const activeCloudWorkspaceId =
    await repository.getActiveId();

  return {
    localWorkspaceCount,
    cloudWorkspaceCount:
      cloudWorkspaces.length,
    membershipCount:
      memberships.size,
    activeCloudWorkspaceId,
    signedIn: true,
  };
}
