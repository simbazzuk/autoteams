import Link from "next/link";
import {
  academyPaths,
} from "@/lib/team-science/academy";

export function AcademyPathPage({
  slug,
}: {
  slug: string;
}) {
  const pathIndex =
    academyPaths.findIndex(
      (item) =>
        item.slug === slug,
    );

  const path =
    academyPaths[pathIndex];

  if (!path) {
    return null;
  }

  const nextPath =
    pathIndex <
    academyPaths.length - 1
      ? academyPaths[
          pathIndex + 1
        ]
      : undefined;

  return (
    <main
      style={{
        minHeight: "78vh",
        background: "#0f1420",
        color: "#f5f7fb",
      }}
    >
      <section
        style={{
          padding: "54px 0 36px",
        }}
      >
        <div className="container">
          <Link
            href="/academy"
            style={{
              color: "#aaa2ff",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            ← Team Science Academy
          </Link>

          <div
            style={{
              display: "grid",
              gap: 16,
              marginTop: 20,
              padding: 28,
              background: path.accent,
              border:
                "1px solid rgba(255,255,255,.09)",
              borderRadius: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize: 52,
                }}
              >
                {path.icon}
              </span>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    padding: "6px 9px",
                    background:
                      "rgba(15,20,32,.38)",
                    borderRadius: 999,
                    fontSize: 9,
                  }}
                >
                  {path.level}
                </span>

                <span
                  style={{
                    padding: "6px 9px",
                    background:
                      "rgba(15,20,32,.38)",
                    borderRadius: 999,
                    fontSize: 9,
                  }}
                >
                  {path.duration}
                </span>
              </div>
            </div>

            <span className="eyebrow">
              Learning Path
            </span>

            <h1
              style={{
                margin: 0,
                maxWidth: 900,
                fontSize:
                  "clamp(40px,6vw,62px)",
                lineHeight: 1.03,
                letterSpacing: "-.045em",
              }}
            >
              {path.title}
            </h1>

            <p
              style={{
                maxWidth: 850,
                margin: 0,
                color: "#bdc7d5",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              {path.description}
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "0 0 28px",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(240px,.55fr) minmax(0,1.45fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <aside
            style={{
              position: "sticky",
              top: 92,
              display: "grid",
              gap: 14,
              padding: 18,
              background: "#171e2d",
              border:
                "1px solid #2a3448",
              borderRadius: 16,
            }}
            className="v682-path-sidebar"
          >
            <div>
              <span className="eyebrow">
                Learning objectives
              </span>
            </div>

            {path.objectives.map(
              (objective) => (
                <div
                  key={objective}
                  style={{
                    display: "flex",
                    gap: 8,
                    color: "#bac4d2",
                    fontSize: 11,
                    lineHeight: 1.5,
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
              ),
            )}

            <hr
              style={{
                width: "100%",
                border: 0,
                borderTop:
                  "1px solid #2a3448",
              }}
            />

            <small
              style={{
                color: "#748197",
                fontSize: 9,
                lineHeight: 1.5,
              }}
            >
              AutoTeams Academy content
              supports product learning and
              does not replace professional
              advice or organisational policy.
            </small>
          </aside>

          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {path.lessons.map(
              (
                lesson,
                index,
              ) => (
                <article
                  key={lesson.title}
                  style={{
                    display: "grid",
                    gap: 14,
                    padding: 22,
                    background: "#171e2d",
                    border:
                      "1px solid #2a3448",
                    borderRadius: 17,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems:
                        "flex-start",
                    }}
                  >
                    <span
                      style={{
                        display: "grid",
                        minWidth: 36,
                        height: 36,
                        placeItems:
                          "center",
                        color:
                          "#cfc9ff",
                        background:
                          "rgba(120,104,255,.12)",
                        borderRadius: 10,
                        fontSize: 9,
                        fontWeight: 900,
                      }}
                    >
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <div>
                      <span className="eyebrow">
                        Lesson {index + 1}
                      </span>

                      <h2
                        style={{
                          margin:
                            "5px 0 6px",
                          fontSize: 25,
                          lineHeight: 1.2,
                        }}
                      >
                        {lesson.title}
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "#a4afbf",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        {lesson.summary}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 11,
                    }}
                  >
                    {lesson.content.map(
                      (
                        paragraph,
                        paragraphIndex,
                      ) => (
                        <p
                          key={
                            paragraphIndex
                          }
                          style={{
                            margin: 0,
                            color:
                              "#c0c8d4",
                            fontSize: 13,
                            lineHeight: 1.72,
                          }}
                        >
                          {paragraph}
                        </p>
                      ),
                    )}
                  </div>

                  {lesson.example && (
                    <div
                      style={{
                        padding: 14,
                        background:
                          "rgba(79,140,255,.07)",
                        border:
                          "1px solid rgba(79,140,255,.18)",
                        borderRadius: 12,
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: 5,
                          color:
                            "#a9c8ff",
                          fontSize: 10,
                        }}
                      >
                        Practical example
                      </strong>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "#aeb9c8",
                          fontSize: 11,
                          lineHeight: 1.55,
                        }}
                      >
                        {lesson.example}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      padding: 14,
                      background:
                        "rgba(34,197,94,.07)",
                      border:
                        "1px solid rgba(34,197,94,.16)",
                      borderRadius: 12,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 5,
                        color: "#93e3b0",
                        fontSize: 10,
                      }}
                    >
                      Key takeaway
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        color: "#b8c6bf",
                        fontSize: 11,
                        lineHeight: 1.55,
                      }}
                    >
                      {lesson.takeaway}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "22px 0 72px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gap: 12,
              padding: 22,
              background:
                "linear-gradient(135deg,rgba(120,104,255,.13),rgba(79,140,255,.05))",
              border:
                "1px solid #303a50",
              borderRadius: 18,
            }}
          >
            <span className="eyebrow">
              Learning path complete
            </span>

            <h2
              style={{
                margin: 0,
                fontSize: 28,
              }}
            >
              Put the learning into practice.
            </h2>

            <p
              style={{
                margin: 0,
                color: "#9ba7b8",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Use Team Builder to see how
              these ideas appear in an
              explainable AutoTeams
              recommendation.
            </p>

            <div
              style={{
                display: "flex",
                gap: 9,
                flexWrap: "wrap",
              }}
            >
              <Link
                className="button"
                href="/team-builder"
              >
                Build a Team
              </Link>

              {nextPath ? (
                <Link
                  className="button secondary"
                  href={`/academy/${nextPath.slug}`}
                >
                  Next: {nextPath.shortTitle}
                </Link>
              ) : (
                <Link
                  className="button secondary"
                  href="/academy"
                >
                  Back to Academy
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 820px) {
          .v682-path-sidebar {
            position: static !important;
          }

          .container:has(.v682-path-sidebar) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
