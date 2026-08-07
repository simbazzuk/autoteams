"use client";

import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  getFirebaseFirestore,
} from "@/lib/firebase/client";
import {
  waitForFirebaseUser,
} from "@/lib/firebase/auth-ready";
import {
  lifecycleEventType,
} from "@/lib/firebase/recommendation-events";

export type RecommendationStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "archived";

export type RecommendationDecision = {
  status: RecommendationStatus;
  reviewerNote?: string;
};

export async function updateRecommendationDecision(
  recommendationId: string,
  decision: RecommendationDecision,
): Promise<void> {
  const user =
    await waitForFirebaseUser();

  if (!user) {
    throw new Error(
      "A Firebase-authenticated user is required to review recommendations.",
    );
  }

  const db =
    getFirebaseFirestore();

  const recommendationRef =
    doc(
      db,
      "recommendations",
      recommendationId,
    );

  const snapshot =
    await getDoc(
      recommendationRef,
    );

  if (!snapshot.exists()) {
    throw new Error(
      "Recommendation not found.",
    );
  }

  const current =
    snapshot.data();

  const currentStatus =
    (current.status ||
      "draft") as RecommendationStatus;

  const nextStatus =
    decision.status;

  validateTransition(
    currentStatus,
    nextStatus,
  );

  const eventRef =
    doc(
      collection(
        db,
        "recommendationEvents",
      ),
    );

  const batch =
    writeBatch(db);

  batch.update(
    recommendationRef,
    {
      status:
        nextStatus,
      reviewerNote:
        decision.reviewerNote || "",
      reviewedBy:
        user.uid,
      reviewedAt:
        serverTimestamp(),
      updatedAt:
        serverTimestamp(),
      ...(nextStatus === "approved"
        ? {
            approvedBy:
              user.uid,
            approvedAt:
              serverTimestamp(),
          }
        : {}),
      ...(nextStatus === "rejected"
        ? {
            rejectedBy:
              user.uid,
            rejectedAt:
              serverTimestamp(),
          }
        : {}),
      ...(nextStatus === "archived"
        ? {
            archivedBy:
              user.uid,
            archivedAt:
              serverTimestamp(),
          }
        : {}),
    },
  );

  batch.set(
    eventRef,
    {
      id:
        eventRef.id,
      recommendationId,
      workspaceId:
        current.workspaceId,
      type:
        lifecycleEventType(
          currentStatus,
          nextStatus,
        ),
      fromStatus:
        currentStatus,
      toStatus:
        nextStatus,
      actorId:
        user.uid,
      actorDisplayName:
        user.displayName || "",
      actorEmail:
        user.email || "",
      note:
        decision.reviewerNote || "",
      createdAt:
        serverTimestamp(),
      createdAtIso:
        new Date().toISOString(),
      schemaVersion:
        "v6.2.0",
    },
  );

  await batch.commit();
}

export function validateTransition(
  current: RecommendationStatus,
  next: RecommendationStatus,
): void {
  const allowed:
    Record<
      RecommendationStatus,
      RecommendationStatus[]
    > = {
      draft: [
        "submitted",
        "archived",
      ],
      submitted: [
        "approved",
        "rejected",
        "archived",
      ],
      approved: [
        "archived",
      ],
      rejected: [
        "submitted",
        "archived",
      ],
      archived: [],
    };

  if (
    !allowed[current].includes(
      next,
    )
  ) {
    throw new Error(
      `Recommendation cannot move from ${current} to ${next}.`,
    );
  }
}
