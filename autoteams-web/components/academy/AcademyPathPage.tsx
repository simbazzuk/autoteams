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

function writeProgress(progress: ProgressMap) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(progress),
  );

  window.dispatchEvent(
    new Event("autoteams-academy-progress"),
  );
}

export function AcademyPathPage({
  slug,
}: {
  slug: string;
}) {
  const pathIndex = academyPaths.findIndex(
    (item) => item.slug === slug,
  );

  const path = academyPaths[pathIndex];

  const [progress, setProgress] = useState<ProgressMap>({});
  const [activeLesson, setActiveLesson] = useState(0);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const completed = useMemo(
    () => (path ? progress[path.slug] || [] : []),
    [path, progress],
  );

  if (!path) return null;

  const nextPath =
    pathIndex < academyPaths.length - 1
      ? academyPaths[pathIndex + 1]
      : undefined;

  const percent = Math.round(
    (completed.length / path.lessons.length) * 100,
  );

  function toggleLesson(lessonIndex: number) {
    const current = new Set(progress[path.slug] || []);

    if (current.has(lessonIndex)) {
      current.delete(lessonIndex);
    } else {
      current.add(lessonIndex);
    }

    const next = {
      ...progress,
      [path.slug]: Array.from(current).sort((a, b) => a - b),
    };

    setProgress(next);
    writeProgress(next);
  }

  return (
    <main
      style={{
        minHeight: "78vh",
        background: "#0f1420",
        color: "#f5f7fb",
      }}
     data-autoteams-academy-refresh="v7.13.81">
      <section style={{ padding: "54px 0 34px" }}>
        <div className="container">
          <Link
            href="/academy"
            style={{
              color: "#aaa2ff",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            ← Team Science Academy
          </Link>

          <div
            style={{
              display: "grid",
              gap: 18,
              marginTop: 20,
              padding: 30,
              background: path.accent,
              border: "1px solid rgba(255,255,255,.10)",
              borderRadius: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 56 }}>
                {path.icon}
              </span>

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

            <span className="eyebrow">Learning Path</span>

            <h1
              style={{
                margin: 0,
                maxWidth: 920,
                fontSize: "clamp(44px,6vw,66px)",
                lineHeight: 1.02,
                letterSpacing: "-.045em",
              }}
            >
              {path.title}
            </h1>

            <p
              style={{
                maxWidth: 880,
                margin: 0,
                color: "#c4cdd9",
                fontSize: 17,
                lineHeight: 1.72,
              }}
            >
              {path.description}
            </p>

            <div
              style={{
                display: "grid",
                gap: 8,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#e1e6ed",
                }}
              >
                <span>
                  {completed.length} of {path.lessons.length} lessons complete
                </span>
                <strong>{percent}%</strong>
              </div>

              <div
                style={{
                  height: 10,
                  overflow: "hidden",
                  background: "rgba(15,20,32,.40)",
                  borderRadius: 999,
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: `${percent}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg,#fff,#cfc9ff)",
                    borderRadius: 999,
                    transition: "width .3s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 30px" }}>
        <div
          className="container v683-path-layout"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(270px,.58fr) minmax(0,1.42fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          <aside
            className="v683-path-sidebar"
            style={{
              position: "sticky",
              top: 92,
              display: "grid",
              gap: 14,
              padding: 20,
              background: "#171e2d",
              border: "1px solid #2a3448",
              borderRadius: 16,
            }}
          >
            <span className="eyebrow">Your learning</span>
            <strong style={{ fontSize: 18 }}>Lessons</strong>

            <div style={{ display: "grid", gap: 7 }}>
              {path.lessons.map((lesson, index) => {
                const done = completed.includes(index);
                const active = activeLesson === index;

                return (
                  <button
                    key={lesson.title}
                    onClick={() => setActiveLesson(index)}
                    type="button"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "30px minmax(0,1fr)",
                      gap: 9,
                      alignItems: "center",
                      width: "100%",
                      padding: "10px 11px",
                      color: active ? "#f5f7fb" : "#aeb8c7",
                      textAlign: "left",
                      background: active
                        ? "rgba(120,104,255,.13)"
                        : "#121827",
                      border: active
                        ? "1px solid rgba(120,104,255,.35)"
                        : "1px solid #283247",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "grid",
                        width: 26,
                        height: 26,
                        placeItems: "center",
                        color: done ? "#8de2b5" : "#cfc9ff",
                        background: done
                          ? "rgba(72,190,135,.10)"
                          : "rgba(120,104,255,.10)",
                        borderRadius: 8,
                        fontSize: 9,
                        fontWeight: 900,
                      }}
                    >
                      {done ? "✓" : index + 1}
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        lineHeight: 1.35,
                        fontWeight: active ? 800 : 650,
                      }}
                    >
                      {lesson.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <hr
              style={{
                width: "100%",
                border: 0,
                borderTop: "1px solid #2a3448",
              }}
            />

            <span className="eyebrow">Learning objectives</span>

            {path.objectives.map((objective) => (
              <div
                key={objective}
                style={{
                  display: "flex",
                  gap: 8,
                  color: "#bac4d2",
                  fontSize: 12,
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    color: "#9d91ff",
                    fontWeight: 900,
                  }}
                >
                  ✓
                </span>
                {objective}
              </div>
            ))}
          </aside>

          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            {path.lessons.map((lesson, index) => {
              const done = completed.includes(index);
              const active = activeLesson === index;

              return (
                <article
                  key={lesson.title}
                  onMouseEnter={() => setActiveLesson(index)}
                  style={{
                    display: "grid",
                    gap: 16,
                    padding: 26,
                    background: active ? "#192133" : "#171e2d",
                    border: active
                      ? "1px solid rgba(120,104,255,.42)"
                      : "1px solid #2a3448",
                    borderRadius: 18,
                    boxShadow: active
                      ? "0 20px 55px rgba(0,0,0,.18)"
                      : "none",
                    transition: "all .2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 14,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 13,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          display: "grid",
                          minWidth: 40,
                          height: 40,
                          placeItems: "center",
                          color: done ? "#8de2b5" : "#cfc9ff",
                          background: done
                            ? "rgba(72,190,135,.10)"
                            : "rgba(120,104,255,.12)",
                          borderRadius: 11,
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        {done
                          ? "✓"
                          : String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <span className="eyebrow">
                          Lesson {index + 1}
                        </span>

                        <h2
                          style={{
                            margin: "6px 0 7px",
                            fontSize: 30,
                            lineHeight: 1.18,
                          }}
                        >
                          {lesson.title}
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#b0bac8",
                            fontSize: 15,
                            lineHeight: 1.65,
                          }}
                        >
                          {lesson.summary}
                        </p>
                      </div>
                    </div>

                    {active && (
                      <span
                        style={{
                          padding: "6px 9px",
                          color: "#d9d4ff",
                          background: "rgba(120,104,255,.12)",
                          borderRadius: 999,
                          fontSize: 9,
                          fontWeight: 900,
                        }}
                      >
                        YOU ARE HERE
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 13,
                    }}
                  >
                    {lesson.content.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        style={{
                          margin: 0,
                          color: "#d0d6df",
                          fontSize: 16,
                          lineHeight: 1.8,
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {lesson.example && (
                    <div
                      style={{
                        padding: 16,
                        background: "rgba(79,140,255,.07)",
                        border: "1px solid rgba(79,140,255,.18)",
                        borderRadius: 13,
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: 6,
                          color: "#a9c8ff",
                          fontSize: 12,
                        }}
                      >
                        Practical example
                      </strong>

                      <p
                        style={{
                          margin: 0,
                          color: "#bbc5d2",
                          fontSize: 14,
                          lineHeight: 1.65,
                        }}
                      >
                        {lesson.example}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      padding: 16,
                      background: "rgba(34,197,94,.07)",
                      border: "1px solid rgba(34,197,94,.16)",
                      borderRadius: 13,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: "#93e3b0",
                        fontSize: 12,
                      }}
                    >
                      Key takeaway
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        color: "#c4d0c8",
                        fontSize: 14,
                        lineHeight: 1.65,
                      }}
                    >
                      {lesson.takeaway}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                      paddingTop: 4,
                    }}
                  >
                    <button
                      className={done ? "button secondary" : "button"}
                      onClick={() => toggleLesson(index)}
                      type="button"
                    >
                      {done ? "✓ Completed" : "Mark Lesson Complete"}
                    </button>

                    {index < path.lessons.length - 1 && (
                      <button
                        className="button secondary"
                        onClick={() => setActiveLesson(index + 1)}
                        type="button"
                      >
                        Next Lesson →
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: "22px 0 72px" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gap: 13,
              padding: 24,
              background:
                percent === 100
                  ? "linear-gradient(135deg,rgba(34,197,94,.14),rgba(20,184,166,.05))"
                  : "linear-gradient(135deg,rgba(120,104,255,.13),rgba(79,140,255,.05))",
              border:
                percent === 100
                  ? "1px solid rgba(34,197,94,.28)"
                  : "1px solid #303a50",
              borderRadius: 18,
            }}
          >
            <span className="eyebrow">
              {percent === 100
                ? "Learning path complete"
                : "Keep learning"}
            </span>

            <h2 style={{ margin: 0, fontSize: 30 }}>
              {percent === 100
                ? "Great work — this path is complete."
                : `${percent}% complete`}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#9ba7b8",
                fontSize: 14,
                lineHeight: 1.65,
              }}
            >
              Apply what you have learned in Team Builder and compare the
              recommendation reasoning with the Team Science principles from
              this path.
            </p>

            <div
              style={{
                display: "flex",
                gap: 9,
                flexWrap: "wrap",
              }}
            >
              <Link className="button" href="/team-builder">
                Apply in Team Builder
              </Link>

              {nextPath ? (
                <Link
                  className="button secondary"
                  href={`/academy/${nextPath.slug}`}
                >
                  Next Path: {nextPath.shortTitle}
                </Link>
              ) : (
                <Link className="button secondary" href="/academy">
                  Back to Academy
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 820px) {
          .v683-path-layout {
            grid-template-columns: 1fr !important;
          }

          .v683-path-sidebar {
            position: static !important;
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
        background: "rgba(15,20,32,.38)",
        borderRadius: 999,
        fontSize: 10,
      }}
    >
      {children}
    </span>
  );
}
