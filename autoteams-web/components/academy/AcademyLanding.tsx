"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { academyPaths } from "@/lib/team-science/academy";

const STORAGE_KEY = "autoteams-academy-progress-v1";
type ProgressMap = Record<string, number[]>;

function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function AcademyLanding() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(readProgress());

    const handler = () => setProgress(readProgress());
    window.addEventListener("storage", handler);
    window.addEventListener(
      "autoteams-academy-progress",
      handler as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(
        "autoteams-academy-progress",
        handler as EventListener,
      );
    };
  }, []);

  const overall = useMemo(() => {
    const total = academyPaths.reduce(
      (sum, path) => sum + path.lessons.length,
      0,
    );

    const complete = academyPaths.reduce(
      (sum, path) =>
        sum +
        Math.min(
          progress[path.slug]?.length || 0,
          path.lessons.length,
        ),
      0,
    );

    return {
      total,
      complete,
      percent:
        total > 0
          ? Math.round((complete / total) * 100)
          : 0,
    };
  }, [progress]);

  return (
    <main
      style={{
        minHeight: "80vh",
        background:
          "radial-gradient(circle at 15% 0%, rgba(120,104,255,.20), transparent 34%), radial-gradient(circle at 88% 18%, rgba(34,197,94,.09), transparent 28%), #0f1420",
        color: "#f5f7fb",
      }}
    >
      <section style={{ padding: "74px 0 46px" }}>
        <div className="container">
          <span className="eyebrow">Team Science Academy</span>

          <h1
            style={{
              margin: "12px 0 16px",
              maxWidth: 980,
              fontSize: "clamp(48px,7vw,76px)",
              lineHeight: .98,
              letterSpacing: "-.05em",
            }}
          >
            Learn why better teams work.
          </h1>

          <p
            style={{
              maxWidth: 920,
              margin: 0,
              color: "#b8c2d0",
              fontSize: 19,
              lineHeight: 1.72,
            }}
          >
            Explore the Team Science principles behind AutoTeams and Atlas.
            Learn how purpose, complementary strengths, communication,
            explainability and human judgement can help people build stronger
            groups.
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 26,
              flexWrap: "wrap",
            }}
          >
            <Link className="button" href="/academy/foundations">
              Start with Foundations
            </Link>
            <Link className="button secondary" href="/team-builder">
              Apply Team Science
            </Link>
          </div>

          <section
            style={{
              display: "grid",
              gap: 12,
              marginTop: 28,
              padding: 20,
              background: "rgba(23,30,45,.86)",
              border: "1px solid #303a50",
              borderRadius: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 14,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <span className="eyebrow">Your progress</span>
                <strong
                  style={{
                    display: "block",
                    marginTop: 5,
                    fontSize: 20,
                  }}
                >
                  {overall.complete} of {overall.total} lessons complete
                </strong>
              </div>

              <span
                style={{
                  padding: "8px 12px",
                  color: "#d8d3ff",
                  background: "rgba(120,104,255,.14)",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {overall.percent}% complete
              </span>
            </div>

            <div
              style={{
                height: 10,
                overflow: "hidden",
                background: "#252e40",
                borderRadius: 999,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: `${overall.percent}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg,#7868ff,#4f8cff)",
                  borderRadius: 999,
                  transition: "width .3s ease",
                }}
              />
            </div>
          </section>
        </div>
      </section>

      <section style={{ padding: "18px 0 60px" }}>
        <div className="container">
          <div
            className="v683-academy-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 16,
            }}
          >
            {academyPaths.map((path, index) => {
              const completed = Math.min(
                progress[path.slug]?.length || 0,
                path.lessons.length,
              );

              const percent =
                path.lessons.length > 0
                  ? Math.round((completed / path.lessons.length) * 100)
                  : 0;

              return (
                <article
                  key={path.slug}
                  style={{
                    display: "grid",
                    gap: 15,
                    padding: 26,
                    minHeight: 360,
                    background: path.accent,
                    border: "1px solid rgba(255,255,255,.10)",
                    borderRadius: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span aria-hidden="true" style={{ fontSize: 48 }}>
                      {path.icon}
                    </span>
                    <small
                      style={{
                        color: "#d2dae6",
                        fontSize: 10,
                        fontWeight: 900,
                      }}
                    >
                      PATH {index + 1}
                    </small>
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: "0 0 9px",
                        fontSize: 27,
                        lineHeight: 1.18,
                      }}
                    >
                      {path.title}
                    </h2>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <Meta>{path.level}</Meta>
                      <Meta>{path.duration}</Meta>
                      <Meta>{path.lessons.length} lessons</Meta>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#c0c8d5",
                      fontSize: 15,
                      lineHeight: 1.68,
                    }}
                  >
                    {path.description}
                  </p>

                  <div style={{ display: "grid", gap: 7 }}>
                    {path.lessons.slice(0, 4).map((lesson, lessonIndex) => {
                      const done =
                        progress[path.slug]?.includes(lessonIndex);

                      return (
                        <small
                          key={lesson.title}
                          style={{
                            color: done ? "#9ae6b4" : "#e0e5ec",
                            fontSize: 12,
                            lineHeight: 1.45,
                          }}
                        >
                          {done ? "✓" : "○"} {lesson.title}
                        </small>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 7,
                      marginTop: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10,
                        color: "#cbd3df",
                      }}
                    >
                      <span>
                        {completed}/{path.lessons.length} lessons
                      </span>
                      <strong>{percent}%</strong>
                    </div>

                    <div
                      style={{
                        height: 8,
                        overflow: "hidden",
                        background: "rgba(15,20,32,.46)",
                        borderRadius: 999,
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          width: `${percent}%`,
                          height: "100%",
                          background: "#fff",
                          opacity: .82,
                          borderRadius: 999,
                        }}
                      />
                    </div>

                    <Link
                      className="button secondary"
                      href={`/academy/${path.slug}`}
                      style={{
                        marginTop: 5,
                        width: "fit-content",
                      }}
                    >
                      {percent === 0
                        ? "Start Learning"
                        : percent === 100
                          ? "Review Path"
                          : "Continue Learning"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 760px) {
          .v683-academy-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function Meta({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        padding: "6px 9px",
        background: "rgba(15,20,32,.35)",
        borderRadius: 999,
        fontSize: 10,
      }}
    >
      {children}
    </span>
  );
}
