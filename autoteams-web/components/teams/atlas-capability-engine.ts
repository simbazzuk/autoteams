"use client";

import type { WorkspacePerson } from "@/lib/workspaces";

export type AtlasCapability = {
  name: string;
  importance: number;
  coverage: number;
  gap: number;
  reason: string;
  evidence: string;
};

export type AtlasCapabilityAnalysis = {
  source: "gemini" | "fallback";
  model?: string;
  summary: string;
  strongestGap: string;
  capabilities: AtlasCapability[];
  teamStrengths: string[];
  skillGaps: string[];
};

type TeamLike = {
  id: string;
  workspaceId?: string;
  name: string;
  purpose?: string;
  personIds?: string[];
  memberIds?: string[];
  recommendation?: {
    teamStrengths?: string[];
    skillGaps?: string[];
  };
};

type ApiCapability = {
  name: string;
  importance: number;
  reason: string;
};

type ApiResult = {
  source: "gemini" | "fallback";
  model?: string;
  summary: string;
  requiredCapabilities: ApiCapability[];
};

function clean(values: unknown): string[] {
  return Array.isArray(values)
    ? values
        .map(value => String(value || "").trim())
        .filter(Boolean)
    : [];
}

function normaliseGap(value: string) {
  return value
    .replace(
      /^\d+\s+place(?:\(s\)|s)?\s+remain(?:s)?\s+unfilled$/i,
      "",
    )
    .trim();
}

function memberIds(team: TeamLike) {
  return new Set([
    ...clean(team.personIds),
    ...clean(team.memberIds),
  ]);
}

function tokens(values: string[]) {
  return new Set(
    values
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter(token => token.length > 2),
  );
}

function personEvidence(
  person: WorkspacePerson,
) {
  return [
    person.jobTitle || "",
    person.department || "",
    ...(person.strengths || []),
  ];
}

function coverageFor(
  capability: string,
  members: WorkspacePerson[],
) {
  const target =
    tokens([capability]);

  if (target.size === 0) {
    return 30;
  }

  let best = 0;

  for (const person of members) {
    const evidence =
      tokens(
        personEvidence(person),
      );

    let overlap = 0;

    for (const token of target) {
      if (evidence.has(token)) {
        overlap += 1;
      }
    }

    const exactStrength =
      (person.strengths || [])
        .some(
          strength =>
            strength
              .trim()
              .toLowerCase() ===
            capability
              .trim()
              .toLowerCase(),
        );

    const score =
      exactStrength
        ? 95
        : Math.round(
            (overlap /
              target.size) *
              100,
          );

    best =
      Math.max(best, score);
  }

  return Math.min(
    100,
    Math.max(15, best),
  );
}

function fallbackResult(
  team: TeamLike,
): ApiResult {
  const gaps =
    clean(
      team.recommendation?.skillGaps,
    )
      .map(normaliseGap)
      .filter(Boolean);

  const strengths =
    clean(
      team.recommendation?.teamStrengths,
    );

  const names =
    Array.from(
      new Set([
        ...gaps,
        ...strengths,
        "Delivery",
        "Collaboration",
      ]),
    ).slice(0, 7);

  return {
    source: "fallback",
    summary:
      "Atlas used existing team evidence because the dedicated Gemini capability service was unavailable.",
    requiredCapabilities:
      names.map(
        (name, index) => ({
          name,
          importance:
            gaps.includes(name)
              ? Math.max(
                  75,
                  92 - index * 3,
                )
              : Math.max(
                  55,
                  70 - index * 2,
                ),
          reason:
            gaps.includes(name)
              ? "Existing Atlas evidence identifies this as a gap."
              : "Existing team evidence indicates this capability is relevant.",
        }),
      ),
  };
}

async function requestCapabilityAnalysis(
  team: TeamLike,
  members: WorkspacePerson[],
): Promise<ApiResult> {
  const objective =
    team.purpose?.trim() ||
    `Strengthen ${team.name}`;

  try {
    const response =
      await fetch(
        "/api/capability-analysis",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            teamName: team.name,
            objective,
            currentMembers:
              members.map(person => ({
                id: person.id,
                name: person.name,
                jobTitle:
                  person.jobTitle,
                department:
                  person.department,
                strengths:
                  person.strengths,
              })),
            existingStrengths:
              clean(
                team.recommendation
                  ?.teamStrengths,
              ),
            existingGaps:
              clean(
                team.recommendation
                  ?.skillGaps,
              )
                .map(normaliseGap)
                .filter(Boolean),
          }),
        },
      );

    if (!response.ok) {
      return fallbackResult(team);
    }

    const data =
      (await response.json()) as
        Partial<ApiResult>;

    if (
      !Array.isArray(
        data.requiredCapabilities,
      ) ||
      data.requiredCapabilities
        .length === 0
    ) {
      return fallbackResult(team);
    }

    return {
      source:
        data.source === "gemini"
          ? "gemini"
          : "fallback",
      model: data.model,
      summary:
        String(
          data.summary ||
            "Atlas derived the capabilities required by the objective.",
        ),
      requiredCapabilities:
        data.requiredCapabilities
          .map(item => ({
            name:
              String(
                item.name || "",
              ).trim(),
            importance:
              Math.min(
                100,
                Math.max(
                  1,
                  Math.round(
                    Number(
                      item.importance,
                    ) || 70,
                  ),
                ),
              ),
            reason:
              String(
                item.reason ||
                  "Required to support the objective.",
              ).trim(),
          }))
          .filter(
            item =>
              Boolean(item.name),
          )
          .slice(0, 8),
    };
  } catch {
    return fallbackResult(team);
  }
}

export async function analyseTeamCapabilities({
  team,
  people,
}: {
  team: TeamLike;
  people: WorkspacePerson[];
}): Promise<AtlasCapabilityAnalysis> {
  const ids =
    memberIds(team);

  const currentMembers =
    people.filter(person =>
      ids.has(person.id),
    );

  const ai =
    await requestCapabilityAnalysis(
      team,
      currentMembers,
    );

  const capabilities =
    ai.requiredCapabilities
      .map(item => {
        const coverage =
          coverageFor(
            item.name,
            currentMembers,
          );

        const gap =
          Math.max(
            0,
            Math.round(
              item.importance *
                (1 -
                  coverage / 100),
            ),
          );

        return {
          name: item.name,
          importance:
            item.importance,
          coverage,
          gap,
          reason: item.reason,
          evidence:
            ai.source === "gemini"
              ? `Gemini derived this capability from the team objective. ${item.reason}`
              : item.reason,
        };
      })
      .sort(
        (a, b) =>
          b.gap - a.gap,
      );

  const gapNames =
    capabilities
      .filter(
        capability =>
          capability.gap >= 20,
      )
      .map(
        capability =>
          capability.name,
      );

  const covered =
    capabilities
      .filter(
        capability =>
          capability.coverage >=
          65,
      )
      .map(
        capability =>
          capability.name,
      );

  return {
    source: ai.source,
    model: ai.model,
    summary: ai.summary,
    strongestGap:
      capabilities[0]?.name ||
      "Complementary capability",
    capabilities,
    teamStrengths: covered,
    skillGaps:
      gapNames.length
        ? gapNames
        : capabilities
            .slice(0, 2)
            .map(
              capability =>
                capability.name,
            ),
  };
}
