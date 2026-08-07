import Link from "next/link";
import {
  academyPaths,
} from "@/lib/team-science/academy";

export function AcademyLanding() {
  return (
    <main
      style={{
        minHeight: "80vh",
        background:
          "radial-gradient(circle at 15% 0%, rgba(120,104,255,.20), transparent 34%), radial-gradient(circle at 88% 18%, rgba(34,197,94,.09), transparent 28%), #0f1420",
        color: "#f5f7fb",
      }}
    >
      <section
        style={{
          padding: "72px 0 44px",
        }}
      >
        <div className="container">
          <span className="eyebrow">
            Team Science Academy
          </span>

          <h1
            style={{
              margin: "12px 0 14px",
              maxWidth: 980,
              fontSize:
                "clamp(44px,7vw,72px)",
              lineHeight: 1,
              letterSpacing: "-.05em",
            }}
          >
            Learn why better teams work.
          </h1>

          <p
            style={{
              maxWidth: 900,
              margin: 0,
              color: "#a6b1c2",
              fontSize: 17,
              lineHeight: 1.7,
            }}
          >
            Explore the Team Science principles behind
            AutoTeams and Atlas. Learn how purpose,
            complementary strengths, communication,
            explainability and human judgement can help
            people build stronger groups.
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            <Link
              className="button"
              href="/academy/foundations"
            >
              Start with Foundations
            </Link>

            <Link
              className="button secondary"
              href="/team-builder"
            >
              Apply Team Science
            </Link>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "18px 0 58px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2,minmax(0,1fr))",
              gap: 14,
            }}
            className="v682-academy-grid"
          >
            {academyPaths.map(
              (path, index) => (
                <article
                  key={path.slug}
                  style={{
                    display: "grid",
                    gap: 13,
                    padding: 24,
                    minHeight: 330,
                    background: path.accent,
                    border:
                      "1px solid rgba(255,255,255,.09)",
                    borderRadius: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: 44,
                      }}
                    >
                      {path.icon}
                    </span>

                    <small
                      style={{
                        color: "#d2dae6",
                        fontSize: 9,
                        fontWeight: 900,
                      }}
                    >
                      PATH {index + 1}
                    </small>
                  </div>

                  <div>
                    <h2
                      style={{
                        margin:
                          "0 0 8px",
                        fontSize: 24,
                        lineHeight: 1.2,
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
                      <span
                        style={{
                          padding:
                            "5px 8px",
                          background:
                            "rgba(15,20,32,.35)",
                          borderRadius: 999,
                          fontSize: 9,
                        }}
                      >
                        {path.level}
                      </span>
                      <span
                        style={{
                          padding:
                            "5px 8px",
                          background:
                            "rgba(15,20,32,.35)",
                          borderRadius: 999,
                          fontSize: 9,
                        }}
                      >
                        {path.duration}
                      </span>
                      <span
                        style={{
                          padding:
                            "5px 8px",
                          background:
                            "rgba(15,20,32,.35)",
                          borderRadius: 999,
                          fontSize: 9,
                        }}
                      >
                        {path.lessons.length} lessons
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#b5c0cf",
                      fontSize: 13,
                      lineHeight: 1.65,
                    }}
                  >
                    {path.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: 5,
                    }}
                  >
                    {path.lessons
                      .slice(0, 4)
                      .map(
                        (lesson) => (
                          <small
                            key={
                              lesson.title
                            }
                            style={{
                              color:
                                "#d6dce6",
                              fontSize: 10,
                            }}
                          >
                            ✓ {lesson.title}
                          </small>
                        ),
                      )}
                  </div>

                  <Link
                    className="button secondary"
                    href={`/academy/${path.slug}`}
                    style={{
                      marginTop: "auto",
                      width: "fit-content",
                    }}
                  >
                    Open Learning Path
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "54px 0",
          background: "#121827",
          borderTop:
            "1px solid #222b3c",
        }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: 820,
            }}
          >
            <span className="eyebrow">
              How to use the Academy
            </span>

            <h2
              style={{
                margin: "9px 0",
                fontSize:
                  "clamp(30px,4vw,42px)",
                lineHeight: 1.12,
              }}
            >
              Learn. Apply. Review. Improve.
            </h2>

            <p
              style={{
                margin: 0,
                color: "#95a2b5",
                fontSize: 14,
                lineHeight: 1.65,
              }}
            >
              The Academy is not separate from AutoTeams.
              Learn a principle here, see Atlas use that
              principle when it explains a recommendation,
              and then apply your own human judgement.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 760px) {
          .v682-academy-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
