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
import type {
  RecommendationStatus,
} from "@/lib/firebase/recommendation-management";
import type {
  RecommendationHistoryRecord,
} from "@/lib/firebase/recommendation-persistence";

export type RecommendationEventType =
  | "generated"
  | "submitted"
  | "approved"
  | "rejected"
  | "resubmitted"
  | "archived";

export type RecommendationEventRecord = {
  id: string;
  recommendationId: string;
  workspaceId: string;
  type: RecommendationEventType;
  fromStatus?: RecommendationStatus;
  toStatus: RecommendationStatus;
  actorId: string;
  actorDisplayName?: string;
  actorEmail?: string;
  note?: string;
  createdAt?: unknown;
  createdAtIso: string;
  schemaVersion: "v6.2.0";
};

export async function listRecommendationEvents(
  recommendationId: string,
): Promise<RecommendationEventRecord[]> {
  const user =
    await waitForFirebaseUser();

  if (!user) {
    return [];
  }

  const db =
    getFirebaseFirestore();

  const snapshot =
    await getDocs(
      query(
        collection(
          db,
          "recommendationEvents",
        ),
        where(
          "recommendationId",
          "==",
          recommendationId,
        ),
      ),
    );

  return snapshot.docs
    .map(
      (item) =>
        item.data() as RecommendationEventRecord,
    )
    .sort(
      (a, b) =>
        Date.parse(
          a.createdAtIso || "",
        ) -
        Date.parse(
          b.createdAtIso || "",
        ),
    );
}

export function buildGeneratedEvent(
  recommendation: RecommendationHistoryRecord,
): RecommendationEventRecord {
  return {
    id:
      `generated-${recommendation.id}`,
    recommendationId:
      recommendation.id,
    workspaceId:
      recommendation.workspaceId,
    type:
      "generated",
    toStatus:
      "draft",
    actorId:
      recommendation.createdBy,
    createdAtIso:
      recommendation.createdAtIso,
    schemaVersion:
      "v6.2.0",
  };
}

export function lifecycleEventType(
  current: RecommendationStatus,
  next: RecommendationStatus,
): RecommendationEventType {
  if (
    current === "rejected" &&
    next === "submitted"
  ) {
    return "resubmitted";
  }

  switch (next) {
    case "submitted":
      return "submitted";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "archived":
      return "archived";
    default:
      return "submitted";
  }
}
