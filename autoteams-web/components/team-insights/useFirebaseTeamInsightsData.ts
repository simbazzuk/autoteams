"use client";

import {
  collection,
  getDocs,
  query,
  where,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";

export type FirebaseInsightTeam = {
  id: string;
  name: string;
  sourceCollection: string;
  contextId?: string;
  contextName?: string;
  profileType?: string;
  memberCount?: number;
};

export type FirebaseInsightProfile = {
  id: string;
  label: string;
  type: string;
};

type Result = {
  teams: FirebaseInsightTeam[];
  profiles: FirebaseInsightProfile[];
  loading: boolean;
  error: string;
};

const TEAM_COLLECTIONS = [
  "teams",
  "savedTeams",
];

const PROFILE_COLLECTIONS = [
  "profiles",
  "personas",
];

function stringValue(
  value: unknown,
) {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : undefined;
}

function normaliseProfileType(
  value?: string,
) {
  const raw =
    (value ?? "")
      .toLowerCase()
      .trim();

  if (
    [
      "business",
      "work",
      "professional",
    ].includes(raw)
  ) {
    return "work";
  }

  if (
    [
      "sports",
      "sport",
    ].includes(raw)
  ) {
    return "sport";
  }

  if (
    [
      "friendship",
      "personal",
      "friends",
      "friends & family",
    ].includes(raw)
  ) {
    return "friendship";
  }

  if (raw === "community") {
    return "community";
  }

  if (raw === "education") {
    return "education";
  }

  return raw || "work";
}

function inferReaderProfileType(
  data: DocumentData,
) {
  const explicit =
    stringValue(
      data.profileType ??
        data.contextType ??
        data.teamType ??
        data.workspaceType ??
        data.groupType,
    );

  if (explicit) {
    return normaliseProfileType(
      explicit,
    );
  }

  const context =
    stringValue(
      data.workspaceId ??
        data.contextId ??
        data.workspaceName ??
        data.contextName,
    )
      ?.toLowerCase();

  if (!context) {
    return "work";
  }

  if (context.includes("community")) {
    return "community";
  }

  if (
    context.includes("sport") ||
    context.includes("football") ||
    context.includes("rugby")
  ) {
    return "sport";
  }

  if (context.includes("friend")) {
    return "friendship";
  }

  if (
    context.includes("education") ||
    context.includes("school") ||
    context.includes("study")
  ) {
    return "education";
  }

  return "work";
}

function profileLabel(
  type: string,
) {
  const labels:
    Record<string, string> = {
      work: "Work",
      sport: "Sport",
      friendship:
        "Friendship",
      community:
        "Community",
      education:
        "Education",
    };

  return (
    labels[type] ??
    type.replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    )
  );
}

function memberId(
  value: unknown,
) {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const record =
      value as
        Record<
          string,
          unknown
        >;

    return stringValue(
      record.uid ??
        record.userId ??
        record.memberId ??
        record.personId ??
        record.id,
    );
  }

  return undefined;
}

function includesUser(
  data: DocumentData,
  uid: string,
) {
  const direct = [
    data.ownerId,
    data.createdBy,
    data.createdByUid,
    data.userId,
    data.teamLeaderId,
    data.leaderId,
  ]
    .map(stringValue)
    .filter(Boolean);

  if (
    direct.includes(uid)
  ) {
    return true;
  }

  const collections = [
    data.members,
    data.people,
    data.memberIds,
    data.personIds,
    data.userIds,
    data.personIds,
    data.players,
  ];

  return collections.some(
    (values) =>
      Array.isArray(values) &&
      values
        .map(memberId)
        .includes(uid),
  );
}

function mapTeam(
  id: string,
  data: DocumentData,
  sourceCollection: string,
): FirebaseInsightTeam | null {
  const name =
    stringValue(
      data.name ??
        data.teamName ??
        data.title ??
        data.label,
    );

  if (!name) {
    return null;
  }

  const members =
    data.members ??
    data.people ??
    data.memberIds ??
    data.personIds ??
    data.userIds ??
    data.players;

  return {
    id,
    name,
    sourceCollection,
    contextId:
      stringValue(
        data.contextId ??
          data.workspaceId ??
          data.groupId ??
          data.organisationId ??
          data.organizationId,
      ),
    contextName:
      stringValue(
        data.contextName ??
          data.workspaceName ??
          data.groupName ??
          data.organisationName ??
          data.organizationName,
      ),
    profileType:
      inferReaderProfileType(
        data,
      ),

    memberCount:
      Array.isArray(members)
        ? members.length
        : typeof data.memberCount ===
            "number"
          ? data.memberCount
          : typeof data.peopleCount ===
              "number"
            ? data.peopleCount
            : undefined,
  };
}

function mapProfile(
  id: string,
  data: DocumentData,
): FirebaseInsightProfile | null {
  const rawType =
    stringValue(
      data.profileType ??
        data.type ??
        data.contextType ??
        data.personaType,
    );

  if (!rawType) {
    return null;
  }

  const type =
    normaliseProfileType(
      rawType,
    );

  return {
    id,
    type,
    label:
      profileLabel(type),
  };
}

async function queryCollection(
  collectionName: string,
  constraints:
    QueryConstraint[],
) {
  const reference =
    collection(
      db,
      collectionName,
    );

  return getDocs(
    constraints.length
      ? query(
          reference,
          ...constraints,
        )
      : reference,
  );
}

async function loadTeams(
  uid: string,
) {
  const found =
    new Map<
      string,
      FirebaseInsightTeam
    >();

  const queryPlans:
    QueryConstraint[][] = [
      [
        where(
          "ownerId",
          "==",
          uid,
        ),
      ],
      [
        where(
          "createdBy",
          "==",
          uid,
        ),
      ],
      [
        where(
          "userId",
          "==",
          uid,
        ),
      ],
      [
        where(
          "memberIds",
          "array-contains",
          uid,
        ),
      ],
      [
        where(
          "userIds",
          "array-contains",
          uid,
        ),
      ],
      [
        where(
          "members",
          "array-contains",
          uid,
        ),
      ],
    ];

  for (
    const collectionName
    of TEAM_COLLECTIONS
  ) {
    for (
      const plan
      of queryPlans
    ) {
      try {
        const snapshot =
          await queryCollection(
            collectionName,
            plan,
          );

        snapshot.docs.forEach(
          (document) => {
            const mapped =
              mapTeam(
                document.id,
                document.data(),
                collectionName,
              );

            if (mapped) {
              found.set(
                `${collectionName}:${document.id}`,
                mapped,
              );
            }
          },
        );
      } catch {
        // Different collections may use different schemas/rules.
      }
    }

    /*
     * Development-friendly fallback: if rules allow reading the collection,
     * filter client-side by ownership/membership. This also supports member
     * arrays containing objects rather than raw uid strings.
     */
    try {
      const snapshot =
        await queryCollection(
          collectionName,
          [],
        );

      snapshot.docs.forEach(
        (document) => {
          const data =
            document.data();

          if (
            !includesUser(
              data,
              uid,
            )
          ) {
            return;
          }

          const mapped =
            mapTeam(
              document.id,
              data,
              collectionName,
            );

          if (mapped) {
            found.set(
              `${collectionName}:${document.id}`,
              mapped,
            );
          }
        },
      );
    } catch {}
  }

  return [
    ...found.values(),
  ];
}

async function loadProfiles(
  uid: string,
) {
  const found =
    new Map<
      string,
      FirebaseInsightProfile
    >();

  const queryFields = [
    "userId",
    "uid",
    "ownerId",
  ];

  for (
    const collectionName
    of PROFILE_COLLECTIONS
  ) {
    for (
      const field
      of queryFields
    ) {
      try {
        const snapshot =
          await queryCollection(
            collectionName,
            [
              where(
                field,
                "==",
                uid,
              ),
            ],
          );

        snapshot.docs.forEach(
          (document) => {
            const mapped =
              mapProfile(
                document.id,
                document.data(),
              );

            if (mapped) {
              found.set(
                mapped.type,
                mapped,
              );
            }
          },
        );
      } catch {}
    }
  }

  return [
    ...found.values(),
  ];
}

export function useFirebaseTeamInsightsData(): Result {
  const auth =
    useAuth() as unknown as {
      user?: {
        uid?: string;
      } | null;
    };

  const uid =
    auth.user?.uid;

  const [
    teams,
    setTeams,
  ] =
    useState<
      FirebaseInsightTeam[]
    >([]);

  const [
    profiles,
    setProfiles,
  ] =
    useState<
      FirebaseInsightProfile[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      if (!uid) {
        if (active) {
          setTeams([]);
          setProfiles([]);
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError("");

      try {
        const [
          nextTeams,
          nextProfiles,
        ] =
          await Promise.all([
            loadTeams(uid),
            loadProfiles(uid),
          ]);

        if (!active) {
          return;
        }

        setTeams(
          nextTeams,
        );

        console.info(
          "[AutoTeams] Firebase Team Insights loaded",
          {
            teamCount:
              nextTeams.length,
            profileCount:
              nextProfiles.length,
          },
        );

        setProfiles(
          nextProfiles,
        );
      } catch (
        caught
      ) {
        if (!active) {
          return;
        }

        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load Team Insights data from Firebase.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    function refreshTeams() {
      void load();
    }

    window.addEventListener(
      "autoteams:firebase-team-persisted",
      refreshTeams,
    );

    return () => {
      active = false;

      window.removeEventListener(
        "autoteams:firebase-team-persisted",
        refreshTeams,
      );
    };
  }, [uid]);

  return useMemo(
    () => ({
      teams,
      profiles,
      loading,
      error,
    }),
    [
      teams,
      profiles,
      loading,
      error,
    ],
  );
}
