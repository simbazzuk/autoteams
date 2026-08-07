"use client";

import {
  doc,
  getDoc,
} from "firebase/firestore";
import {
  getFirebaseFirestore,
} from "@/lib/firebase/client";
import {
  waitForFirebaseUser,
} from "@/lib/firebase/auth-ready";
import type {
  RecommendationHistoryRecord,
} from "@/lib/firebase/recommendation-persistence";

export async function getRecommendationById(
  recommendationId: string,
): Promise<RecommendationHistoryRecord | null> {
  const user =
    await waitForFirebaseUser();

  if (!user) {
    return null;
  }

  const db =
    getFirebaseFirestore();

  const snapshot =
    await getDoc(
      doc(
        db,
        "recommendations",
        recommendationId,
      ),
    );

  if (!snapshot.exists()) {
    return null;
  }

  const record =
    snapshot.data() as RecommendationHistoryRecord;

  return {
    ...record,
    status:
      record.status ||
      "draft",
  };
}
