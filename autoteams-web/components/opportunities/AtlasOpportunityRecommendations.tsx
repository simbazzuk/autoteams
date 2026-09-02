"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Opportunity } from "@/lib/opportunities";
import {
  loadCvIntelligence,
  type CvIntelligence,
} from "@/lib/cv-intelligence";

type Recommendation = {
  opportunity: Opportunity;
  score: number;
  matched: string[];
  gaps: string[];
};

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildEvidence(cv: CvIntelligence): Set<string> {
  const values = [
    cv.headline,
    cv.summary,
    cv.seniority,
    ...cv.roles,
    ...cv.skills,
    ...cv.industries,
    ...cv.qualifications,
    ...cv.achievements,
    ...cv.opportunityKeywords,
    ...cv.experience.flatMap((item) => [
      item.role,
      item.organisation,
      item.evidence,
    ]),
  ].filter(Boolean);

  const evidence = new Set<string>();

  for (const value of values) {
    const full = normalise(value);
    if (!full) continue;
    evidence.add(full);

    for (const token of full.split(/[\s,/|]+/)) {
      if (token.length >= 2) evidence.add(token);
    }
  }

  return evidence;
}

function matchesEvidence(evidence: Set<string>, value: string): boolean {
  const signal = normalise(value);
  if (!signal) return false;
  if (evidence.has(signal)) return true;

  const parts = signal
    .split(/\s+/)
    .filter((part) => part.length >= 3);

  return parts.some((part) => evidence.has(part));
}

function recommend(
  cv: CvIntelligence,
  opportunity: Opportunity,
): Recommendation {
  const evidence = buildEvidence(cv);
  const skills = opportunity.skills.filter(Boolean);

  const matchedSkills = skills.filter((skill) =>
    matchesEvidence(evidence, skill),
  );

  const gaps = skills.filter(
    (skill) => !matchedSkills.includes(skill),
  );

  const widerSignals = [
    opportunity.title,
    opportunity.objective,
    opportunity.context,
    opportunity.organisation || "",
    opportunity.location,
    opportunity.workingMode,
  ].filter(Boolean);

  const widerMatches = widerSignals.filter((signal) =>
    matchesEvidence(evidence, signal),
  );

  const skillScore =
    skills.length > 0
      ? matchedSkills.length / skills.length
      : 0.5;

  const widerScore =
    widerSignals.length > 0
      ? Math.min(widerMatches.length / widerSignals.length, 1)
      : 0.5;

  const evidenceDepth =
    Math.min(cv.skills.length / 12, 1) * 0.04 +
    Math.min(cv.experience.length / 4, 1) * 0.05;

  const raw =
    0.78 * skillScore +
    0.13 * widerScore +
    evidenceDepth;

  const score = Math.max(
    18,
    Math.min(96, Math.round(raw * 100)),
  );

  return {
    opportunity,
    score,
    matched: [...matchedSkills, ...widerMatches].slice(0, 5),
    gaps: gaps.slice(0, 3),
  };
}

export function AtlasOpportunityRecommendations({
  opportunities,
  userId,
  interestedOpportunityIds,
  onInterest,
}: {
  opportunities: Opportunity[];
  userId: string;
  interestedOpportunityIds: string[];
  onInterest: (opportunity: Opportunity) => void;
}) {
  const cv = useMemo(() => loadCvIntelligence(), []);

  const recommendations = useMemo(() => {
    if (!cv?.useForOpportunityMatching) return [];

    return opportunities
      .filter(
        (opportunity) =>
          opportunity.status === "open" &&
          opportunity.ownerId !== userId,
      )
      .map((opportunity) => recommend(cv, opportunity))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [cv, opportunities, userId]);

  if (!cv) {
    return (
      <section
        data-atlas-opportunity-recommendations="v71571522"
        style={{
          margin: "28px 0",
          border: "1px solid rgba(118,87,255,.24)",
          borderRadius: 22,
          padding: 22,
          background:
            "linear-gradient(135deg, rgba(118,87,255,.11), rgba(79,142,247,.06))",
        }}
      >
        <span style={eyebrowStyle}>Atlas for you</span>
        <h2 style={{ margin: "7px 0 8px" }}>
          Let Atlas find opportunities that fit you.
        </h2>
        <p style={mutedStyle}>
          Add CV Intelligence to your profile and Atlas can rank open
          opportunities against your skills and experience.
        </p>
        <Link className="button" href="/profile/cv">
          Build CV Intelligence
        </Link>
      </section>
    );
  }

  if (!cv.useForOpportunityMatching) {
    return (
      <section
        data-atlas-opportunity-recommendations="v71571522"
        style={{
          margin: "28px 0",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 22,
          padding: 22,
          background: "rgba(255,255,255,.025)",
        }}
      >
        <span style={eyebrowStyle}>Atlas for you</span>
        <h2 style={{ margin: "7px 0 8px" }}>
          Opportunity recommendations are paused.
        </h2>
        <p style={mutedStyle}>
          Your CV matching preference is off. Atlas will not use your CV
          evidence until you enable it.
        </p>
        <Link className="button secondary" href="/profile/cv">
          Review CV privacy settings
        </Link>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <section
        data-atlas-opportunity-recommendations="v71571522"
        style={{
          margin: "28px 0",
          border: "1px solid rgba(118,87,255,.20)",
          borderRadius: 22,
          padding: 22,
          background: "rgba(118,87,255,.05)",
        }}
      >
        <span style={eyebrowStyle}>Atlas for you</span>
        <h2 style={{ margin: "7px 0 8px" }}>
          No recommendations yet.
        </h2>
        <p style={mutedStyle}>
          Atlas has your career evidence ready. New open opportunities will
          appear here when there is something to compare.
        </p>
      </section>
    );
  }

  return (
    <section
      data-atlas-opportunity-recommendations="v71571522"
      style={{ margin: "30px 0 36px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          gap: 18,
          marginBottom: 16,
        }}
      >
        <div>
          <span style={eyebrowStyle}>Recommended by Atlas</span>
          <h2 style={{ margin: "7px 0 5px" }}>
            Opportunities selected for you.
          </h2>
          <p style={{ ...mutedStyle, margin: 0 }}>
            Ranked from your Atlas Profile and CV career evidence.
          </p>
        </div>
        <span
          style={{
            borderRadius: 999,
            padding: "7px 11px",
            border: "1px solid rgba(118,87,255,.24)",
            background: "rgba(118,87,255,.08)",
            color: "#c8ceff",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          Top {recommendations.length}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 14,
        }}
      >
        {recommendations.map(
          ({ opportunity, score, matched, gaps }, index) => {
            const alreadyInterested =
              interestedOpportunityIds.includes(opportunity.id);

            return (
              <article
                key={opportunity.id}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 20,
                  padding: 18,
                  border:
                    index === 0
                      ? "1px solid rgba(164,111,255,.42)"
                      : "1px solid rgba(99,119,177,.22)",
                  background:
                    index === 0
                      ? "linear-gradient(145deg, rgba(69,40,118,.55), rgba(15,27,51,.96))"
                      : "linear-gradient(145deg, rgba(27,37,67,.92), rgba(12,23,43,.97))",
                  boxShadow:
                    index === 0
                      ? "0 20px 48px rgba(74,42,128,.18)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: index === 0 ? "#d9c4ff" : "#aeb8ff",
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {index === 0 ? "Best Atlas match" : "Atlas match"}
                    </span>
                    <h3 style={{ margin: "7px 0 3px", fontSize: 19 }}>
                      {opportunity.title}
                    </h3>
                    <strong
                      style={{
                        color: "rgba(218,228,241,.72)",
                        fontSize: 12,
                      }}
                    >
                      {opportunity.organisation || "TeamScience member"}
                    </strong>
                  </div>

                  <div
                    style={{
                      minWidth: 62,
                      borderRadius: 14,
                      padding: "9px 8px",
                      textAlign: "center",
                      background: "rgba(118,87,255,.12)",
                      border: "1px solid rgba(152,124,255,.24)",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#d0d5ff",
                        fontSize: 21,
                      }}
                    >
                      {score}%
                    </strong>
                    <span
                      style={{
                        color: "rgba(207,217,234,.55)",
                        fontSize: 9,
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      fit
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    margin: "13px 0",
                    color: "rgba(210,222,238,.70)",
                    fontSize: 12,
                    lineHeight: 1.55,
                  }}
                >
                  {opportunity.objective}
                </p>

                {matched.length > 0 ? (
                  <div style={{ marginTop: 10 }}>
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 7,
                        color: "#8ce8d2",
                        fontSize: 11,
                      }}
                    >
                      Why Atlas recommends this
                    </strong>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {matched.slice(0, 4).map((item) => (
                        <span
                          key={item}
                          style={{
                            borderRadius: 999,
                            padding: "5px 8px",
                            background: "rgba(45,211,171,.07)",
                            border: "1px solid rgba(45,211,171,.18)",
                            color: "#99e7d4",
                            fontSize: 10,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {gaps.length > 0 ? (
                  <div
                    style={{
                      marginTop: 11,
                      color: "rgba(224,211,175,.68)",
                      fontSize: 10,
                      lineHeight: 1.45,
                    }}
                  >
                    <strong>Potential gap:</strong> {gaps.join(", ")}
                  </div>
                ) : null}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 16,
                  }}
                >
                  <button
                    className="button"
                    type="button"
                    disabled={alreadyInterested}
                    onClick={() => onInterest(opportunity)}
                  >
                    {alreadyInterested ? "Interest registered" : "I'm interested"}
                  </button>

                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(`opportunity-${opportunity.id}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  >
                    View opportunity
                  </button>
                </div>
              </article>
            );
          },
        )}
      </div>

      <p
        style={{
          margin: "12px 0 0",
          color: "rgba(188,201,220,.48)",
          fontSize: 10,
          lineHeight: 1.5,
        }}
      >
        Atlas recommendations are decision support. Match scores use the
        evidence available in your profile and CV and do not determine
        suitability or selection.
      </p>
    </section>
  );
}

const eyebrowStyle = {
  color: "#b7bfff",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".09em",
  textTransform: "uppercase" as const,
};

const mutedStyle = {
  color: "rgba(205,220,239,.68)",
  lineHeight: 1.55,
  maxWidth: 760,
};
