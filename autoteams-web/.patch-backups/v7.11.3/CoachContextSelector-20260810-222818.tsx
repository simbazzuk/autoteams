"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import styles from "./CoachContextSelector.module.css";

type CoachContext = {
  id: string;
  name: string;
  type?: string;
  peopleCount?: number;
  teamCount?: number;
};

type Props = {
  fallbackName?: string;
};

const SELECTED_KEY =
  "autoteams-coach-context-v710";

const SELECTED_OBJECT_KEY =
  "autoteams-coach-context-object-v7101";

function titleCase(
  value?: string,
) {
  if (!value) {
    return "Group";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  );
}

function looksLikePerson(
  value: Record<string, unknown>,
) {
  const personSignals = [
    "displayName",
    "email",
    "jobTitle",
    "department",
    "strengths",
    "teamDnaStatus",
    "profileType",
    "profileReady",
    "firstName",
    "lastName",
  ];

  return personSignals.some(
    (key) =>
      key in value,
  );
}

function looksLikeGroup(
  value: Record<string, unknown>,
) {
  const hardSignals = [
    "workspaceId",
    "groupId",
    "workspaceType",
    "groupType",
    "organisationId",
    "organizationId",
  ];

  if (
    hardSignals.some(
      (key) =>
        key in value,
    )
  ) {
    return true;
  }

  const collectionSignals = [
    value.members,
    value.people,
    value.personIds,
    value.teams,
    value.teamIds,
  ];

  const hasCollections =
    collectionSignals.some(
      Array.isArray,
    );

  const hasName =
    typeof (
      value.name ??
      value.title ??
      value.label
    ) === "string";

  return (
    hasName &&
    hasCollections &&
    !looksLikePerson(
      value,
    )
  );
}

function contextFromObject(
  value: Record<string, unknown>,
  index: number,
): CoachContext | null {
  if (
    !looksLikeGroup(
      value,
    )
  ) {
    return null;
  }

  const rawName =
    value.name ??
    value.title ??
    value.label;

  if (
    typeof rawName !== "string" ||
    !rawName.trim()
  ) {
    return null;
  }

  const rawId =
    value.workspaceId ??
    value.groupId ??
    value.id ??
    `${rawName}-${index}`;

  const rawType =
    value.workspaceType ??
    value.groupType ??
    value.type ??
    value.contextType;

  const people =
    value.people ??
    value.members ??
    value.personIds;

  const teams =
    value.teams ??
    value.teamIds;

  return {
    id: String(rawId),
    name: rawName.trim(),
    type:
      typeof rawType ===
      "string"
        ? rawType
        : undefined,
    peopleCount:
      Array.isArray(people)
        ? people.length
        : typeof value.peopleCount ===
            "number"
          ? value.peopleCount
          : typeof value.memberCount ===
              "number"
            ? value.memberCount
            : undefined,
    teamCount:
      Array.isArray(teams)
        ? teams.length
        : typeof value.teamCount ===
            "number"
          ? value.teamCount
          : undefined,
  };
}

function flattenCandidates(
  parsed: unknown,
): Record<string, unknown>[] {
  if (
    Array.isArray(parsed)
  ) {
    return parsed.filter(
      isRecord,
    );
  }

  if (
    isRecord(parsed)
  ) {
    const nested = [
      parsed.workspaces,
      parsed.groups,
      parsed.organisations,
      parsed.organizations,
      parsed.items,
    ];

    for (
      const value of nested
    ) {
      if (
        Array.isArray(value)
      ) {
        return value.filter(
          isRecord,
        );
      }
    }

    return [parsed];
  }

  return [];
}

function discoverContexts(): CoachContext[] {
  const discovered:
    CoachContext[] = [];

  try {
    for (
      let index = 0;
      index <
      localStorage.length;
      index += 1
    ) {
      const key =
        localStorage.key(
          index,
        );

      if (!key) {
        continue;
      }

      if (
        !/workspace|group|organisation|organization/i.test(
          key,
        )
      ) {
        continue;
      }

      const raw =
        localStorage.getItem(
          key,
        );

      if (!raw) {
        continue;
      }

      let parsed:
        unknown;

      try {
        parsed =
          JSON.parse(raw);
      } catch {
        continue;
      }

      const values =
        flattenCandidates(
          parsed,
        );

      values.forEach(
        (item, itemIndex) => {
          const context =
            contextFromObject(
              item,
              itemIndex,
            );

          if (context) {
            discovered.push(
              context,
            );
          }
        },
      );
    }
  } catch {}

  const unique =
    new Map<
      string,
      CoachContext
    >();

  for (
    const context of discovered
  ) {
    const key =
      `${context.id}:${context.name}`;

    if (
      !unique.has(key)
    ) {
      unique.set(
        key,
        context,
      );
    }
  }

  return [
    ...unique.values(),
  ];
}

function persistContext(
  context: CoachContext,
) {
  try {
    localStorage.setItem(
      SELECTED_KEY,
      context.id,
    );

    localStorage.setItem(
      SELECTED_OBJECT_KEY,
      JSON.stringify({
        contextId:
          context.id,
        contextName:
          context.name,
        contextType:
          context.type ??
          "group",
        peopleCount:
          context.peopleCount,
        teamCount:
          context.teamCount,
      }),
    );

    window.dispatchEvent(
      new CustomEvent(
        "autoteams:coach-context-changed",
        {
          detail: {
            contextId:
              context.id,
            contextName:
              context.name,
            contextType:
              context.type ??
              "group",
          },
        },
      ),
    );
  } catch {}
}

function clearInvalidPersistedContext() {
  try {
    localStorage.removeItem(
      SELECTED_KEY,
    );

    localStorage.removeItem(
      SELECTED_OBJECT_KEY,
    );
  } catch {}
}

export function CoachContextSelector({
  fallbackName =
    "Current group",
}: Props) {
  const [
    contexts,
    setContexts,
  ] =
    useState<CoachContext[]>(
      [],
    );

  const [
    selectedId,
    setSelectedId,
  ] =
    useState("");

  useEffect(() => {
    const found =
      discoverContexts();

    setContexts(found);

    try {
      const saved =
        localStorage.getItem(
          SELECTED_KEY,
        );

      const selected =
        found.find(
          (context) =>
            context.id ===
            saved,
        );

      if (selected) {
        setSelectedId(
          selected.id,
        );

        persistContext(
          selected,
        );
      } else if (
        found[0]
      ) {
        clearInvalidPersistedContext();

        setSelectedId(
          found[0].id,
        );

        persistContext(
          found[0],
        );
      } else {
        clearInvalidPersistedContext();
      }
    } catch {
      if (
        found[0]
      ) {
        setSelectedId(
          found[0].id,
        );

        persistContext(
          found[0],
        );
      }
    }
  }, []);

  const selected =
    useMemo(
      () =>
        contexts.find(
          (context) =>
            context.id ===
            selectedId,
        ) ??
        contexts[0],
      [
        contexts,
        selectedId,
      ],
    );

  function select(
    id: string,
  ) {
    setSelectedId(id);

    const context =
      contexts.find(
        (item) =>
          item.id === id,
      );

    if (context) {
      persistContext(
        context,
      );
    }
  }

  const name =
    selected?.name ??
    fallbackName;

  return (
    <section
      className={styles.panel}
      data-autoteams-coach-context="v7.11.1"
    >
      <div
        className={styles.topRow}
      >
        <div
          className={styles.identity}
        >
          <span>
            COACHING FOR
          </span>

          <h2>
            {name}
          </h2>

          <p>
            Team Coach will use this
            group’s people, profiles
            and team information when
            giving advice.
          </p>
        </div>

        {contexts.length > 1 ? (
          <label
            className={
              styles.selector
            }
          >
            <span>
              Switch context
            </span>

            <select
              value={
                selected?.id ??
                ""
              }
              onChange={(
                event,
              ) =>
                select(
                  event.target
                    .value,
                )
              }
            >
              {contexts.map(
                (context) => (
                  <option
                    key={
                      context.id
                    }
                    value={
                      context.id
                    }
                  >
                    {
                      context.name
                    }
                    {context.type
                      ? ` · ${titleCase(
                          context.type,
                        )}`
                      : ""}
                  </option>
                ),
              )}
            </select>
          </label>
        ) : null}
      </div>

      <div
        className={styles.summary}
      >
        <span>
          {titleCase(
            selected?.type,
          )}
        </span>

        <span>
          {selected
            ?.peopleCount ??
            "—"}{" "}
          people
        </span>

        <span>
          {selected
            ?.teamCount ??
            "—"}{" "}
          teams
        </span>
      </div>

      <div
        className={styles.actions}
      >
        <Link href="/organisation">
          Manage group
        </Link>

        <Link href="/profile/privacy">
          Profile privacy
        </Link>

        <Link href="/trust-centre">
          Trust centre
        </Link>
      </div>
    </section>
  );
}
