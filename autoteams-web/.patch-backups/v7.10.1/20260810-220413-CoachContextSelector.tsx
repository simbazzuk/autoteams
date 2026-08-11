"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./CoachContextSelector.module.css";

type CoachContext = {
  id: string;
  name: string;
  type?: string;
  peopleCount?: number;
};

type Props = {
  fallbackName?: string;
};

const SELECTED_KEY =
  "autoteams-coach-context-v710";

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

function looksLikeContext(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (
        "name" in
          (value as Record<string, unknown>) ||
        "title" in
          (value as Record<string, unknown>)
      ),
  );
}

function contextFromObject(
  value: Record<string, unknown>,
  index: number,
): CoachContext | null {
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
    value.id ??
    value.workspaceId ??
    value.groupId ??
    `${rawName}-${index}`;

  const rawType =
    value.type ??
    value.groupType ??
    value.workspaceType ??
    value.contextType;

  const people =
    value.people ??
    value.members ??
    value.personIds;

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
  };
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
        Array.isArray(parsed)
          ? parsed
          : looksLikeContext(
                parsed,
              )
            ? [parsed]
            : parsed &&
                typeof parsed ===
                  "object"
              ? Object.values(
                  parsed as Record<
                    string,
                    unknown
                  >,
                ).filter(
                  looksLikeContext,
                )
              : [];

      values.forEach(
        (item, itemIndex) => {
          if (
            !looksLikeContext(
              item,
            )
          ) {
            return;
          }

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

      if (
        saved &&
        found.some(
          (context) =>
            context.id ===
            saved,
        )
      ) {
        setSelectedId(
          saved,
        );
      } else if (
        found[0]
      ) {
        setSelectedId(
          found[0].id,
        );
      }
    } catch {
      if (
        found[0]
      ) {
        setSelectedId(
          found[0].id,
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

    try {
      localStorage.setItem(
        SELECTED_KEY,
        id,
      );

      window.dispatchEvent(
        new CustomEvent(
          "autoteams:coach-context-changed",
          {
            detail: {
              contextId:
                id,
            },
          },
        ),
      );
    } catch {}
  }

  const name =
    selected?.name ??
    fallbackName;

  return (
    <section
      className={styles.panel}
      data-autoteams-coach-context="v7.10"
    >
      <div
        className={styles.heading}
      >
        <div>
          <span>
            COACHING FOR
          </span>

          <h2>
            {name}
          </h2>

          <p>
            Team Coach uses the
            people, profiles and
            teams in this group to
            make its advice more
            relevant.
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
        className={styles.meta}
      >
        <div>
          <small>
            Context type
          </small>
          <strong>
            {titleCase(
              selected?.type,
            )}
          </strong>
        </div>

        <div>
          <small>
            People
          </small>
          <strong>
            {selected
              ?.peopleCount ??
              "—"}
          </strong>
        </div>

        <div>
          <small>
            What changes?
          </small>
          <strong>
            Coach advice
          </strong>
        </div>
      </div>

      <div
        className={
          styles.explainer
        }
      >
        <span>
          ✦
        </span>

        <p>
          <strong>
            What does
            “Coaching for” mean?
          </strong>{" "}
          It tells Coach which
          group of people you want
          help with. If you switch
          from a work group to a
          football group, Coach
          should use that group’s
          relevant profiles and
          team information instead.
        </p>
      </div>
    </section>
  );
}
