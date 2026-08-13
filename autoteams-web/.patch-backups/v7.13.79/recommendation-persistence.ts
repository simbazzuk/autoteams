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
import {
  waitForFirebaseUser,
} from "@/lib/firebase/auth-ready";
import type {
  GeminiTeamRecommendation,
} from "@/lib/ai/recommendation-types";
import type {
  RecommendationStatus,
} from "@/lib/firebase/recommendation-management";

export type RecommendationRequirementSnapshot = {
  name: string;
  purpose: string;
  size: number;
  skills: string[];
  location: string;
  workingStyle: string;
};

export type RecommendationCandidateSnapshot = {
  id: string;
  name: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  strengths?: string[];
  profileReady?: boolean;
};

export type PersistRecommendationInput = {
  workspaceId: string;
  requirement: RecommendationRequirementSnapshot;
  candidates: RecommendationCandidateSnapshot[];
  result: GeminiTeamRecommendation;
};

export type RecommendationHistoryRecord = {
  id: string;
  workspaceId: string;
  createdBy: string;
  requirement: RecommendationRequirementSnapshot;
  candidates: RecommendationCandidateSnapshot[];
  recommendedPersonIds: string[];
  confidence: number;
  summary: string;
  rankedPeople: GeminiTeamRecommendation["rankedPeople"];
  teamStrengths: string[];
  skillGaps: string[];
  risks: string[];
  source: "gemini" | "fallback";
  model?: string;
  telemetry?: GeminiTeamRecommendation["telemetry"];
  status: RecommendationStatus;
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: unknown;
  approvedBy?: string;
  approvedAt?: unknown;
  rejectedBy?: string;
  rejectedAt?: unknown;
  archivedBy?: string;
  archivedAt?: unknown;
  createdAt?: unknown;
  createdAtIso: string;
  schemaVersion: "v6.0.0";
};

export async function persistRecommendation(
  input: PersistRecommendationInput,
): Promise<string | null> {
  const user =
    await waitForFirebaseUser();

  if (!user) {
    console.warn(
      "Recommendation history was not saved because no Firebase user is signed in.",
    );
    return null;
  }

  const db =
    getFirebaseFirestore();

  const recommendationRef =
    doc(
      collection(
        db,
        "recommendations",
      ),
    );

  const record: RecommendationHistoryRecord = {
    id:
      recommendationRef.id,
    workspaceId:
      input.workspaceId,
    createdBy:
      user.uid,
    requirement:
      sanitiseRequirement(
        input.requirement,
      ),
    candidates:
      input.candidates.map(
        sanitiseCandidate,
      ),
    recommendedPersonIds:
      input.result.recommendedPersonIds,
    confidence:
      input.result.confidence,
    summary:
      input.result.summary,
    rankedPeople:
      input.result.rankedPeople,
    teamStrengths:
      input.result.teamStrengths,
    skillGaps:
      input.result.skillGaps,
    risks:
      input.result.risks,
    source:
      input.result.source,
    model:
      input.result.model,
    telemetry:
      sanitiseTelemetry(
        input.result.telemetry,
      ),
    status:
      "draft",
    createdAtIso:
      new Date().toISOString(),
    createdAt:
      serverTimestamp(),
    schemaVersion:
      "v6.0.0",
  };

  await setDoc(
    recommendationRef,
    removeUndefinedDeep(
      record,
    ),
  );

  return recommendationRef.id;
}

export async function listRecommendationsForWorkspace(
  workspaceId: string,
): Promise<RecommendationHistoryRecord[]> {
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
          "recommendations",
        ),
        where(
          "workspaceId",
          "==",
          workspaceId,
        ),
      ),
    );

  return snapshot.docs
    .map(
      (item) =>
        item.data() as RecommendationHistoryRecord,
    )
    .map(
      (record) => ({
        ...record,
        status:
          record.status ||
          "draft",
      }),
    )
    .sort(
      (a, b) =>
        Date.parse(
          b.createdAtIso || "",
        ) -
        Date.parse(
          a.createdAtIso || "",
        ),
    );
}

function sanitiseRequirement(
  requirement: RecommendationRequirementSnapshot,
): RecommendationRequirementSnapshot {
  return {
    name:
      requirement.name || "",
    purpose:
      requirement.purpose || "",
    size:
      Number(
        requirement.size || 0,
      ),
    skills:
      Array.isArray(
        requirement.skills,
      )
        ? requirement.skills
        : [],
    location:
      requirement.location || "Any",
    workingStyle:
      requirement.workingStyle ||
      "Balanced",
  };
}

function sanitiseCandidate(
  candidate: RecommendationCandidateSnapshot,
): RecommendationCandidateSnapshot {
  return removeUndefinedDeep({
    id:
      candidate.id,
    name:
      candidate.name,
    jobTitle:
      candidate.jobTitle,
    department:
      candidate.department,
    location:
      candidate.location,
    strengths:
      candidate.strengths || [],
    profileReady:
      candidate.profileReady,
  }) as RecommendationCandidateSnapshot;
}

function sanitiseTelemetry(
  telemetry: GeminiTeamRecommendation["telemetry"],
): GeminiTeamRecommendation["telemetry"] {
  if (!telemetry) {
    return undefined;
  }

  return removeUndefinedDeep(
    telemetry,
  ) as GeminiTeamRecommendation["telemetry"];
}

function removeUndefinedDeep<T>(
  value: T,
): T {
  if (Array.isArray(value)) {
    return value
      .map(
        (item) =>
          removeUndefinedDeep(
            item,
          ),
      ) as T;
  }

  if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date)
  ) {
    return Object.fromEntries(
      Object.entries(
        value as Record<
          string,
          unknown
        >,
      )
        .filter(
          ([, item]) =>
            item !== undefined,
        )
        .map(
          ([key, item]) => [
            key,
            removeUndefinedDeep(
              item,
            ),
          ],
        ),
    ) as T;
  }

  return value;
}
