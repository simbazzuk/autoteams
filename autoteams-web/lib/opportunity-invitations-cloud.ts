"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export type OpportunityInvitationStatus =
  | "pending"
  | "accepted"
  | "declined";

export type OpportunityInvitation = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  interestId: string;
  ownerId: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  teamId?: string;
  status: OpportunityInvitationStatus;
  createdAt: string;
  updatedAt: string;
};

function db() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!config.projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured.");
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  return getFirestore(app);
}

function invitationId(opportunityId: string, recipientId: string) {
  return `${opportunityId}_${recipientId}`;
}

export async function createOpportunityInvitation(input: {
  opportunityId: string;
  opportunityTitle: string;
  interestId: string;
  ownerId: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  teamId?: string;
}) {
  const id = invitationId(input.opportunityId, input.recipientId);
  const now = new Date().toISOString();

  const invitation: OpportunityInvitation = {
    id,
    opportunityId: input.opportunityId,
    opportunityTitle: input.opportunityTitle,
    interestId: input.interestId,
    ownerId: input.ownerId,
    recipientId: input.recipientId,
    recipientName: input.recipientName,
    recipientEmail: input.recipientEmail,
    ...(input.teamId ? { teamId: input.teamId } : {}),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(
    doc(db(), "opportunityInvitations", id),
    invitation,
    { merge: true },
  );

  return invitation;
}

export async function loadOpportunityInvitationsForUser(
  uid: string,
): Promise<OpportunityInvitation[]> {
  const q = query(
    collection(db(), "opportunityInvitations"),
    where("recipientId", "==", uid),
  );

  const snap = await getDocs(q);

  return snap.docs
    .map(
      d =>
        ({
          id: d.id,
          ...d.data(),
        }) as OpportunityInvitation,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function respondToOpportunityInvitation(
  invitation: OpportunityInvitation,
  response: "accepted" | "declined",
) {
  const now = new Date().toISOString();

  await updateDoc(
    doc(db(), "opportunityInvitations", invitation.id),
    {
      status: response,
      respondedAt: now,
      updatedAt: now,
    },
  );

  await updateDoc(
    doc(db(), "opportunityInterests", invitation.interestId),
    {
      status: response,
      updatedAt: now,
    },
  );
}

export async function attachTeamToOpportunityInvitations(
  opportunityId: string,
  teamId: string,
  ownerId: string,
) {
  const q = query(
    collection(db(), "opportunityInvitations"),
    where("opportunityId", "==", opportunityId),
    where("ownerId", "==", ownerId),
  );

  const snap = await getDocs(q);

  await Promise.all(
    snap.docs.map(d =>
      updateDoc(d.ref, {
        teamId,
        updatedAt: new Date().toISOString(),
      }),
    ),
  );
}
