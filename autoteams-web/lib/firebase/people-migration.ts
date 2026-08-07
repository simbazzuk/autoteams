"use client";

import {
  doc,
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
  loadPeople,
  type WorkspacePerson,
} from "@/lib/workspaces";

export type PeopleMigrationResult = {
  userId: string;
  localPeopleCount: number;
  migratedPeopleCount: number;
  skippedPeopleCount: number;
  workspaceCounts: Record<
    string,
    number
  >;
};

export async function migrateLocalPeopleToFirestore(): Promise<PeopleMigrationResult> {
  const user =
    await waitForFirebaseUser();

  if (!user) {
    throw new Error(
      "Sign in with Firebase before migrating people.",
    );
  }

  const people =
    loadPeople();

  const db =
    getFirebaseFirestore();

  let migratedPeopleCount = 0;

  const workspaceCounts:
    Record<string, number> = {};

  /*
   * IMPORTANT
   *
   * Do not call getDoc() before the write.
   *
   * For a new Firestore document there is no resource.data yet.
   * A read rule such as:
   *
   *   hasActiveMembership(resource.data.workspaceId)
   *
   * therefore cannot authorise a read of a document that does not exist.
   *
   * setDoc() allows Firestore to evaluate the CREATE rule against:
   *
   *   request.resource.data.workspaceId
   *
   * which is exactly what the Phase 4 rules are designed for.
   */
  for (const person of people) {
    await setDoc(
      doc(
        db,
        "people",
        person.id,
      ),
      {
        ...stripUndefined(
          person,
        ),
        migratedFrom:
          "localStorage",
        migrationVersion:
          "v4.0-phase4.1",
        migratedBy:
          user.uid,
        migratedAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    migratedPeopleCount += 1;

    workspaceCounts[
      person.workspaceId
    ] =
      (workspaceCounts[
        person.workspaceId
      ] || 0) + 1;
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
      peopleMigration:
        "complete",
      localPeopleCount:
        people.length,
      migratedPeopleCount,
      skippedPeopleCount: 0,
      peopleWorkspaceCounts:
        workspaceCounts,
      peoplePhase:
        "v4.0-phase4.1",
      peopleCompletedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  return {
    userId:
      user.uid,
    localPeopleCount:
      people.length,
    migratedPeopleCount,
    skippedPeopleCount: 0,
    workspaceCounts,
  };
}

function stripUndefined(
  person: WorkspacePerson,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(
      person,
    ).filter(
      ([, value]) =>
        value !== undefined,
    ),
  );
}
