"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Opportunity } from "@/lib/opportunities";
import {
  CvIntelligence,
  loadCvIntelligence,
} from "@/lib/cv-intelligence";

type MatchResult = {
  score: number;
  matched: string[];
  gaps: string[];
  explanation: string;
};

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(values: string[]): Set<string> {
  const result = new Set<string>();

  for (const value of values) {
    const full = normalise(value);
    if (!full) continue;

    result.add(full);

    for (const token of full.split(/[\s,/|]+/)) {
      if (token.length >= 2) result.add(token);
    }
  }

  return result;
}

function evidenceValues(cv: CvIntelligence): string[] {
  return [
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
}

function opportunitySignals(opportunity: Opportunity): string[] {
  return [
    opportunity.title,
    opportunity.objective,
    opportunity.context,
    opportunity.organisation || "",
    opportunity.location,
    opportunity.workingMode,
    ...opportunity.skills,
  ].filter(Boolean);
}

function scoreOpportunity(
  cv: CvIntelligence,
  opportunity: Opportunity,
): MatchResult {
  const evidence = tokens(evidenceValues(cv));
  const skills = opportunity.skills
    .map((skill) => normalise(skill))
    .filter(Boolean);

  const matchedSkills = skills.filter((skill) => {
    if (evidence.has(skill)) return true;
    const parts = skill.split(/\s+/).filter((x) => x.length >= 3);
    return parts.some((part) => evidence.has(part));
  });

  const gaps = skills.filter((skill) => !matchedSkills.includes(skill));

  const broaderSignals = opportunitySignals(opportunity)
    .map((signal) => normalise(signal))
    .filter(Boolean);

  const broaderMatches = broaderSignals.filter((signal) => {
    if (evidence.has(signal)) return true;
    const parts = signal.split(/\s+/).filter((x) => x.length >= 4);
    return parts.some((part) => evidence.has(part));
  });

  const skillScore =
    skills.length > 0 ? matchedSkills.length / skills.length : 0.5;

  const broaderScore =
    broaderSignals.length > 0
      ? Math.min(
          broaderMatches.length /
            Math.max(Math.min(broaderSignals.length, 8), 1),
          1,
        )
      : 0.5;

  const experienceBonus = cv.experience.length > 0 ? 0.08 : 0;
  const qualificationBonus = cv.qualifications.length > 0 ? 0.04 : 0;

  const raw =
    0.72 * skillScore +
    0.16 * broaderScore +
    experienceBonus +
    qualificationBonus;

  const score = Math.max(18, Math.min(96, Math.round(raw * 100)));

  const matched = [
    ...matchedSkills,
    ...broaderMatches
      .filter((item) => !matchedSkills.includes(item))
      .slice(0, 2),
  ].slice(0, 5);

  const explanation =
    matchedSkills.length > 0
      ? `Your CV shows evidence relevant to ${matchedSkills
          .slice(0, 3)
          .join(", ")}.`
      : "Atlas has not found strong evidence for the listed skills yet.";

  return {
    score,
    matched,
    gaps: gaps.slice(0, 4),
    explanation,
  };
}

export function CvOpportunityMatch({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const [cv, setCv] = useState<CvIntelligence | null>(null);

  useEffect(() => {
    function sync() {
      setCv(loadCvIntelligence());
    }

    sync();
    window.addEventListener("autoteams:cv-intelligence-changed", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("autoteams:cv-intelligence-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const match = useMemo(() => {
    if (!cv || !cv.useForOpportunityMatching) return null;
    return scoreOpportunity(cv, opportunity);
  }, [cv, opportunity]);

  if (!cv) {
    return (
      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          padding: "13px 14px",
          border: "1px solid rgba(118, 87, 255, .20)",
          background:
            "linear-gradient(135deg, rgba(118,87,255,.08), rgba(79,142,247,.05))",
        }}
      >
        <strong style={{ display: "block", marginBottom: 4, fontSize: 13 }}>
          Want a smarter Atlas match?
        </strong>
        <span
          style={{
            display: "block",
            color: "rgba(205,220,239,.68)",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          Add your CV evidence and Atlas can compare your experience with this Opportunity.
        </span>
        <Link
          href="/profile/cv"
          style={{
            display: "inline-block",
            marginTop: 8,
            fontSize: 12,
            fontWeight: 800,
            color: "#aeb8ff",
          }}
        >
          Build CV intelligence
        </Link>
      </div>
    );
  }

  if (!cv.useForOpportunityMatching) {
    return (
      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          padding: "12px 14px",
          border: "1px solid rgba(255,255,255,.08)",
          background: "rgba(255,255,255,.025)",
          fontSize: 12,
          color: "rgba(205,220,239,.68)",
        }}
      >
        CV matching is off.{" "}
        <Link href="/profile/cv" style={{ color: "#aeb8ff", fontWeight: 800 }}>
          Review CV privacy settings
        </Link>
      </div>
    );
  }

  if (!match) return null;

  const label =
    match.score >= 80
      ? "Strong CV fit"
      : match.score >= 60
        ? "Good CV fit"
        : match.score >= 40
          ? "Some CV fit"
          : "Limited CV evidence";

  return (
    <div
      data-autoteams-cv-opportunity-match="v715715214"
      style={{
        marginTop: 14,
        borderRadius: 16,
        padding: 14,
        border: "1px solid rgba(118, 87, 255, .26)",
        background:
          "linear-gradient(135deg, rgba(118,87,255,.12), rgba(79,142,247,.07))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <span
            style={{
              display: "block",
              color: "#b7bfff",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: ".09em",
              textTransform: "uppercase",
            }}
          >
            Atlas CV Match
          </span>
          <strong style={{ display: "block", marginTop: 3, fontSize: 13 }}>
            {label}
          </strong>
        </div>

        <strong style={{ fontSize: 24, lineHeight: 1, color: "#c8ceff" }}>
          {match.score}%
        </strong>
      </div>

      <p
        style={{
          margin: "10px 0 0",
          color: "rgba(214,225,241,.76)",
          fontSize: 12,
          lineHeight: 1.55,
        }}
      >
        {match.explanation}
      </p>

      {match.matched.length > 0 ? (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {match.matched.map((item) => (
            <span
              key={item}
              style={{
                borderRadius: 999,
                padding: "5px 8px",
                border: "1px solid rgba(45,211,171,.20)",
                background: "rgba(45,211,171,.07)",
                color: "#8ce8d2",
                fontSize: 11,
              }}
            >
              Match: {item}
            </span>
          ))}
        </div>
      ) : null}

      {match.gaps.length > 0 ? (
        <div
          style={{
            marginTop: 10,
            color: "rgba(219,226,239,.64)",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "rgba(239,215,157,.88)" }}>
            Evidence to strengthen:
          </strong>{" "}
          {match.gaps.join(", ")}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 10,
          fontSize: 10,
          lineHeight: 1.45,
          color: "rgba(190,202,220,.50)",
        }}
      >
        CV Match is an explainable supporting signal, not a hiring decision or guarantee of suitability.
      </div>
    </div>
  );
}
