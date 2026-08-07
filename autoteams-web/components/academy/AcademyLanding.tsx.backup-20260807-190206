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
          "radial-gradient(circle at 15% 0%, rgba(120,104,255,.18), transparent 32%), #0f1420",
        color: "#f5f7fb",
      }}
    >
      <section
        style={{
          padding: "68px 0 42px",
        }}
      >
        <div className="container">
          <span className="eyebrow">
            AutoTeams Academy
          </span>

          <h1
            style={{
              margin: "12px 0 14px",
              maxWidth: 900,
              fontSize:
                "clamp(44px,7vw,72px)",
              lineHeight: 1,
              letterSpacing: "-.05em",
            }}
          >
            Learn the science behind better teams.
          </h1>

          <p
            style={{
              maxWidth: 850,
              margin: 0,
              color: "#a6b1c2",
              fontSize: 17,
              lineHeight: 1.7,
            }}
          >
            Team Science Academy explains the principles
            Atlas uses to support balanced, explainable
            recommendations. Learn how teams work, why
            different strengths matter and where human
            judgement remains essential.
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
              Start Learning
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
          padding: "22px 0 58px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: 14,
            }}
          >
            {academyPaths.map(
              (path) => (
                <article
                  key={path.slug}
                  style={{
                    display: "grid",
                    gap: 13,
                    padding: 22,
                    minHeight: 300,
                    background: path.accent,
                    border:
                      "1px solid rgba(255,255,255,.09)",
                    borderRadius: 20,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: 42,
                    }}
                  >
                    {path.icon}
                  </span>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: 23,
                      lineHeight: 1.2,
                    }}
                  >
                    {path.title}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#b2bdcc",
                      fontSize: 13,
                      lineHeight: 1.6,
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
                    {path.topics
                      .slice(0, 4)
                      .map(
                        (topic) => (
                          <small
                            key={topic}
                            style={{
                              color:
                                "#d6dce6",
                              fontSize: 10,
                            }}
                          >
                            ✓ {topic}
                          </small>
                        ),
                      )}
                  </div>

                  <Link
                    href={`/academy/${path.slug}`}
                    style={{
                      marginTop: "auto",
                      color: "#d7d2ff",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    Explore learning path →
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "52px 0",
          background: "#121827",
          borderTop: "1px solid #222b3c",
          borderBottom:
            "1px solid #222b3c",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0,.8fr) minmax(0,1.2fr)",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <span className="eyebrow">
              Team Science + Atlas
            </span>

            <h2
              style={{
                margin: "9px 0",
                fontSize:
                  "clamp(30px,4vw,42px)",
                lineHeight: 1.12,
              }}
            >
              Learn it in the Academy. See it applied by Atlas.
            </h2>

            <p
              style={{
                margin: 0,
                color: "#95a2b5",
                fontSize: 14,
                lineHeight: 1.65,
              }}
            >
              AutoTeams connects learning and
              recommendations. The Academy explains
              concepts such as complementary skills,
              leadership balance and human review;
              Atlas can then surface those ideas when
              it explains a recommendation.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {[
              "Evidence before intuition",
              "Explain why, not only who",
              "Balance strengths and gaps",
              "Keep humans accountable",
            ].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: 14,
                    background: "#171e2d",
                    border:
                      "1px solid #2a3448",
                    borderRadius: 12,
                    color: "#cbd3df",
                    fontSize: 13,
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
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
