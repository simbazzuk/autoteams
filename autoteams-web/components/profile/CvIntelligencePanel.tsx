"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  CvIntelligence,
  loadCvIntelligence,
  removeCvIntelligence,
  saveCvIntelligence,
} from "@/lib/cv-intelligence";

type ApiAnalysis = Omit<
  CvIntelligence,
  | "fileName"
  | "analysedAt"
  | "useForOpportunityMatching"
  | "shareCvWithOpportunityOwners"
>;

export function CvIntelligencePanel() {
  const [cv, setCv] = useState<CvIntelligence | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCv(loadCvIntelligence());
  }, []);

  const profileStrength = useMemo(() => {
    if (!cv) return 0;

    const signals = [
      cv.headline,
      cv.summary,
      cv.roles.length ? "roles" : "",
      cv.skills.length ? "skills" : "",
      cv.experience.length ? "experience" : "",
      cv.qualifications.length ? "qualifications" : "",
    ];

    return Math.round(
      (signals.filter(Boolean).length / signals.length) * 100,
    );
  }, [cv]);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setMessage("");
  }

  async function analyse() {
    if (!file || analysing) return;

    setAnalysing(true);
    setMessage("");

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/cv-intelligence", {
        method: "POST",
        body: form,
      });

      const payload = (await response.json()) as {
        analysis?: ApiAnalysis;
        error?: string;
      };

      if (!response.ok || !payload.analysis) {
        throw new Error(
          payload.error || "Atlas could not analyse this CV.",
        );
      }

      const next: CvIntelligence = {
        ...payload.analysis,
        fileName: file.name,
        analysedAt: new Date().toISOString(),
        useForOpportunityMatching:
          cv?.useForOpportunityMatching ?? true,
        shareCvWithOpportunityOwners:
          cv?.shareCvWithOpportunityOwners ?? false,
      };

      saveCvIntelligence(next);
      setCv(next);
      setMessage(
        "Atlas analysed your CV. Review the extracted evidence before using it for Opportunities.",
      );
      setFile(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Atlas could not analyse this CV.",
      );
    } finally {
      setAnalysing(false);
    }
  }

  function updatePrivacy(
    key:
      | "useForOpportunityMatching"
      | "shareCvWithOpportunityOwners",
    value: boolean,
  ) {
    if (!cv) return;

    const next = {
      ...cv,
      [key]: value,
    };

    saveCvIntelligence(next);
    setCv(next);
  }

  function remove() {
    if (!cv) return;

    const confirmed = window.confirm(
      "Remove your CV intelligence from this browser? This removes the extracted CV evidence used by Atlas.",
    );

    if (!confirmed) return;

    removeCvIntelligence();
    setCv(null);
    setFile(null);
    setMessage("CV intelligence removed.");
  }

  return (
    <main style={{ padding: "34px 0 70px" }}>
      <div className="container">
        <section
          style={{
            border: "1px solid rgba(104, 120, 255, .24)",
            borderRadius: 24,
            padding: 28,
            background:
              "linear-gradient(135deg, rgba(72, 57, 160, .22), rgba(8, 24, 45, .88))",
            marginBottom: 22,
          }}
        >
          <span className="eyebrow">Atlas CV Intelligence</span>
          <h1 style={{ margin: "8px 0 10px", fontSize: "clamp(30px,5vw,52px)" }}>
            Turn your CV into opportunity intelligence.
          </h1>
          <p style={{ maxWidth: 800, lineHeight: 1.65, opacity: 0.78 }}>
            Your CV tells Atlas what you have done. Your TeamScience profile
            tells Atlas how you work. Together they can improve future
            Opportunity recommendations without making the CV itself the
            decision.
          </p>
        
          {/* AUTOTEAMS_V7157152211_TOP_OPPORTUNITIES_CTA */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 18,
            }}
          >
            <Link
              className="button"
              href="/opportunities"
              style={{
                background:
                  "linear-gradient(135deg, #7657ff, #4f8ef7)",
                color: "#fff",
                border: 0,
                boxShadow:
                  "0 14px 32px rgba(91,84,255,.24)",
              }}
            >
              Explore recommended Opportunities
            </Link>

            <Link
              className="button secondary"
              href="/profile"
            >
              Back to Profile
            </Link>
          </div></section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.1fr) minmax(300px,.9fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <article
            style={{
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 20,
              padding: 22,
              background: "rgba(8, 19, 35, .72)",
            }}
          >
            <span className="eyebrow">Career & Experience</span>
            <h2>Upload your CV</h2>
            <p style={{ opacity: 0.72, lineHeight: 1.6 }}>
              PDF is recommended. The raw CV is sent to Gemini for this
              analysis request but is not saved by TeamScience in this v21
              feature. Atlas stores the structured evidence in your browser.
            </p>

            <label
              style={{
                display: "block",
                border: "1px dashed rgba(122, 157, 255, .42)",
                borderRadius: 16,
                padding: 20,
                margin: "18px 0 14px",
                background: "rgba(79, 100, 255, .06)",
                cursor: "pointer",
              }}
            >
              <strong>Choose CV</strong>
              <small style={{ display: "block", marginTop: 6, opacity: 0.65 }}>
                PDF or plain text, maximum 6 MB
              </small>
              <input
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={chooseFile}
                style={{ display: "block", marginTop: 14 }}
                type="file"
              />
            </label>

            {file ? (
              <div style={{ marginBottom: 14 }}>
                <strong>{file.name}</strong>
                <small style={{ display: "block", opacity: 0.62 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </small>
              </div>
            ) : null}

            <button
              className="button"
              disabled={!file || analysing}
              onClick={analyse}
              type="button"
            >
              {analysing ? "Atlas is analysing..." : "Analyse CV with Atlas"}
            </button>

            {message ? (
              <p style={{ marginTop: 14, lineHeight: 1.5 }}>{message}</p>
            ) : null}
          </article>

          <aside
            style={{
              border: "1px solid rgba(45, 211, 171, .20)",
              borderRadius: 20,
              padding: 22,
              background:
                "linear-gradient(145deg, rgba(19, 94, 83, .16), rgba(8, 19, 35, .78))",
            }}
          >
            <span className="eyebrow">Opportunity readiness</span>
            <h2>{cv ? `${profileStrength}% CV evidence` : "Not analysed yet"}</h2>
            <p style={{ opacity: 0.72, lineHeight: 1.55 }}>
              Atlas will use only the evidence you approve for Opportunity
              matching.
            </p>

            {cv ? (
              <>
                <label style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <input
                    checked={cv.useForOpportunityMatching}
                    onChange={(event) =>
                      updatePrivacy(
                        "useForOpportunityMatching",
                        event.target.checked,
                      )
                    }
                    type="checkbox"
                  />
                  <span>
                    <strong>Use my CV evidence for Atlas matching</strong>
                    <small style={{ display: "block", opacity: 0.65 }}>
                      Helps rank relevant Opportunities.
                    </small>
                  </span>
                </label>

                <label style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <input
                    checked={cv.shareCvWithOpportunityOwners}
                    onChange={(event) =>
                      updatePrivacy(
                        "shareCvWithOpportunityOwners",
                        event.target.checked,
                      )
                    }
                    type="checkbox"
                  />
                  <span>
                    <strong>Allow Opportunity owners to view my CV</strong>
                    <small style={{ display: "block", opacity: 0.65 }}>
                      Off by default. Matching can still use extracted evidence.
                    </small>
                  </span>
                </label>
              </>
            ) : null}
          </aside>
        </section>

        {cv ? (
          <section
            style={{
              marginTop: 18,
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 20,
              padding: 22,
              background: "rgba(8, 19, 35, .72)",
            }}
          >
            <span className="eyebrow">Atlas extracted evidence</span>
            <h2>{cv.headline || "Professional profile"}</h2>
            <p style={{ lineHeight: 1.65, maxWidth: 920 }}>{cv.summary}</p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 14,
                marginTop: 18,
              }}
            >
              <EvidenceBlock title="Roles" values={cv.roles} />
              <EvidenceBlock title="Skills" values={cv.skills} />
              <EvidenceBlock title="Industries" values={cv.industries} />
              <EvidenceBlock title="Qualifications" values={cv.qualifications} />
            </div>

            {cv.achievements.length ? (
              <div style={{ marginTop: 20 }}>
                <h3>Evidence-backed achievements</h3>
                <ul>
                  {cv.achievements.map((item) => (
                    <li key={item} style={{ marginBottom: 8 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 22,
              }}
            >
              <Link className="button secondary" href="/profile">
                Back to Profile
              </Link>
              <Link className="button" href="/opportunities">
                Explore Opportunities
              </Link>
              <button
                className="button secondary"
                onClick={remove}
                type="button"
              >
                Remove CV intelligence
              </button>
            </div>
          
            {/* AUTOTEAMS_V7157152211_NEXT_STEP */}
            <div
              data-cv-opportunities-next-step="v7157152211"
              style={{
                marginTop: 22,
                borderRadius: 18,
                padding: 18,
                border:
                  "1px solid rgba(155,104,255,.30)",
                background:
                  "linear-gradient(135deg, rgba(118,87,255,.12), rgba(79,142,247,.07))",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#c9cfff",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: ".09em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Your next step
              </span>

              <strong
                style={{
                  display: "block",
                  fontSize: 18,
                  marginBottom: 6,
                }}
              >
                Atlas is ready to find Opportunities for you.
              </strong>

              <p
                style={{
                  margin: "0 0 14px",
                  color:
                    "rgba(210,222,238,.72)",
                  lineHeight: 1.55,
                }}
              >
                Your approved CV intelligence can now be compared
                with open Opportunities so Atlas can rank the
                strongest matches and explain why they may fit.
              </p>

              <Link
                className="button"
                href="/opportunities"
                style={{
                  background:
                    "linear-gradient(135deg, #7657ff, #4f8ef7)",
                  color: "#fff",
                  border: 0,
                  boxShadow:
                    "0 14px 32px rgba(91,84,255,.24)",
                }}
              >
                View my recommended Opportunities
              </Link>
            </div>
</section>
        ) : null}
      </div>
    </main>
  );
}

function EvidenceBlock({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  return (
    <article
      style={{
        borderRadius: 14,
        padding: 16,
        background: "rgba(255,255,255,.035)",
        border: "1px solid rgba(255,255,255,.07)",
      }}
    >
      <strong>{title}</strong>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 7,
          marginTop: 10,
        }}
      >
        {values.length ? (
          values.slice(0, 14).map((value) => (
            <span
              key={value}
              style={{
                borderRadius: 999,
                padding: "6px 9px",
                fontSize: 12,
                background: "rgba(97, 121, 255, .11)",
                border: "1px solid rgba(97, 121, 255, .18)",
              }}
            >
              {value}
            </span>
          ))
        ) : (
          <small style={{ opacity: 0.58 }}>No evidence extracted</small>
        )}
      </div>
    </article>
  );
}
