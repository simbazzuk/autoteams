import { SocialMediaFooter } from "@/components/landing/SocialMediaFooter";
import Link from "next/link";
import { PageShell } from "@/components/Site";
import { LandingCtaPalette } from "@/components/home/LandingCtaPalette";
import { HomeAvailableTeams } from "@/components/home/HomeAvailableTeams";
const useCases = [
  {
    icon: "🏢",
    title: "Work & Organisations",
    text:
      "Build project teams, delivery squads, innovation groups and leadership teams around clear outcomes.",
    examples:
      "Projects · Delivery · Leadership · Innovation",
    gradient:
      "linear-gradient(135deg, rgba(59,130,246,.26), rgba(37,99,235,.08))",
    border:
      "rgba(96,165,250,.32)",
  },
  {
    icon: "⚽",
    title: "Sports & Clubs",
    text:
      "Create balanced squads, understand strengths and build teams for training, competition and club activities.",
    examples:
      "Football · Rugby · Cricket · Coaching",
    gradient:
      "linear-gradient(135deg, rgba(34,197,94,.24), rgba(22,163,74,.08))",
    border:
      "rgba(74,222,128,.30)",
  },
  {
    icon: "🤝",
    title: "Friendships",
    text:
      "Bring compatible people together around interests, activities and the kind of social connections they want to build.",
    examples:
      "Friendships · Activities · Social circles",
    gradient:
      "linear-gradient(135deg, rgba(168,85,247,.26), rgba(236,72,153,.08))",
    border:
      "rgba(192,132,252,.30)",
  },
  {
    icon: "🌍",
    title: "Communities",
    text:
      "Create local groups and communities around shared interests, causes, culture and neighbourhood activities.",
    examples:
      "Local groups · Causes · Shared interests",
    gradient:
      "linear-gradient(135deg, rgba(249,115,22,.24), rgba(245,158,11,.08))",
    border:
      "rgba(251,146,60,.30)",
  },
  {
    icon: "🎓",
    title: "Education",
    text:
      "Create study groups, mentoring circles and student teams with complementary strengths and learning goals.",
    examples:
      "Study groups · Mentoring · Student teams",
    gradient:
      "linear-gradient(135deg, rgba(20,184,166,.23), rgba(14,116,144,.08))",
    border:
      "rgba(45,212,191,.30)",
  },
  {
    icon: "❤️",
    title: "Volunteering",
    text:
      "Bring volunteers together around charities, community projects, events and shared social causes.",
    examples:
      "Charities · Volunteers · Community projects",
    gradient:
      "linear-gradient(135deg, rgba(239,68,68,.23), rgba(190,24,93,.08))",
    border:
      "rgba(248,113,113,.30)",
  },
];

const benefits = [
  {
    icon: "🧠",
    title: "Explainable AI",
    text:
      "Understand why people were recommended, not just who was selected.",
  },
  {
    icon: "⚖️",
    title: "Balanced Groups",
    text:
      "Bring together complementary strengths rather than relying on instinct alone.",
  },
  {
    icon: "👥",
    title: "Human Decisions",
    text:
      "AI recommends. People review, approve and remain accountable.",
  },
  {
    icon: "📊",
    title: "Evidence Based",
    text:
      "Use skills, strengths, experience, compatibility and objectives as evidence.",
  },
];

const process = [
  {
    icon: "👤",
    title: "Create profiles",
    text: "Add the people AutoTeams is allowed to consider.",
  },
  {
    icon: "👥",
    title: "Choose people",
    text: "Select the available group or candidate population.",
  },
  {
    icon: "🎯",
    title: "Describe the objective",
    text: "Explain what the team or group needs to achieve.",
  },
  {
    icon: "🤖",
    title: "Atlas analyses",
    text: "Atlas evaluates fit, strengths, gaps and risks.",
  },
  {
    icon: "💡",
    title: "Review the recommendation",
    text: "Understand the evidence behind the proposed group.",
  },
  {
    icon: "✅",
    title: "Human decision",
    text: "Approve, reject or refine the recommendation.",
  },
];

export default function HomePage() {
  return (
    <PageShell>
      <main
        style={{
          background:
            "radial-gradient(circle at 15% 0%, rgba(120,104,255,.18), transparent 32%), radial-gradient(circle at 85% 15%, rgba(34,197,94,.10), transparent 30%), #0f1420",
          color: "#f5f7fb",
        }}
      >
        <section
          style={{
            padding: "78px 0 54px",
            borderBottom: "1px solid #222b3c",
          }}
        >
          <div
            className="container v671-hero"
            style={{
              display: "grid",
              gap: 28,
            }}
          >
            <div
              style={{
                maxWidth: 1000,
              }}
            >
              <span
                className="eyebrow"
                data-autoteams-team-science-platform="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  width: "fit-content",
                  padding: "8px 14px",
                  background: "#F97316",
                  color: "#FFFFFF",
                  border: "1px solid #FB923C",
                  borderRadius: 999,
                  boxShadow: "0 8px 22px rgba(249,115,22,.26)",
                  fontWeight: 900,
                  letterSpacing: ".025em",
                }}
              >
                Team Science Platform
              </span>

              <h1
                className="v671-hero-title"
                style={{
                  margin: "14px 0 16px",
                  maxWidth: 1000,
                  fontSize: "clamp(48px,7vw,78px)",
                  lineHeight: .98,
                  letterSpacing: "-.055em",
                }}
              >
                Build better teams, groups and communities with explainable AI.
              </h1>

              <p
                className="v671-hero-copy"
                style={{
                  margin: 0,
                  maxWidth: 900,
                  color: "#a8b3c4",
                  fontSize: 18,
                  lineHeight: 1.7,
                }}
              >
                AutoTeams helps people bring the right mix of skills,
                strengths, interests and personalities together for the
                right purpose. Whether you are creating a project team,
                sports squad, friendship group, community initiative,
                study group or event, AutoTeams helps you make more
                informed and explainable people decisions.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 26,
                }}
              >
                <Link
                  className="button"
                  href="/get-started"
                >
                  Get Started
                </Link>

                <Link
                  className="button secondary"
                  href="/team-builder"
                >
                  Build a Team
                </Link>
          <Link className="button landing-invite-cta" href="/members#invite">
            Invite People
          </Link>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 9,
              }}
            >
              {[
                "🏢 Work",
                "⚽ Sports",
                "🤝 Friendships",
                "🌍 Communities",
                "🎓 Education",
                "❤️ Volunteering",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "8px 11px",
                    color: "#c9d1df",
                    background: "rgba(255,255,255,.045)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            padding: "56px 0",
          }}
        >
          <div className="container">
            <SectionHeading
              eyebrow="Choose how you use AutoTeams"
              title="One platform. Many ways to bring people together."
              text="AutoTeams is designed for both professional and social use cases, with the same explainable and human-reviewed approach throughout."
            />

            <div
              className="v671-use-case-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,minmax(0,1fr))",
                gap: 14,
                marginTop: 28,
              }}
            >
              {useCases.map((item) => (
                <article
                  className="v664-use-case-card"
                  key={item.title}
                  style={{
                    display: "grid",
                    alignContent: "start",
                    gap: 13,
                    minHeight: 250,
                    padding: 22,
                    background: item.gradient,
                    border: `1px solid ${item.border}`,
                    borderRadius: 22,
                    boxShadow: "0 18px 50px rgba(0,0,0,.16)",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      display: "grid",
                      width: 76,
                      height: 76,
                      placeItems: "center",
                      background: "rgba(15,20,32,.48)",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: 20,
                      fontSize: 46,
                      transition: "transform .25s ease",
                    }}
                  >
                    {item.icon}
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: 22,
                      lineHeight: 1.2,
                      letterSpacing: "-.025em",
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#c1cad8",
                      fontSize: 13,
                      lineHeight: 1.65,
                    }}
                  >
                    {item.text}
                  </p>

                  <small
                    style={{
                      marginTop: "auto",
                      color: "#e0e5ec",
                      fontSize: 10,
                      lineHeight: 1.5,
                      opacity: .82,
                    }}
                  >
                    {item.examples}
                  </small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            padding: "56px 0",
            background: "#121827",
            borderTop: "1px solid #222b3c",
            borderBottom: "1px solid #222b3c",
          }}
        >
          <div
            className="container v671-atlas-grid"
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
                Meet Atlas
              </span>

              <div
                aria-hidden="true"
                style={{
                  display: "grid",
                  width: 84,
                  height: 84,
                  margin: "16px 0",
                  placeItems: "center",
                  background:
                    "radial-gradient(circle at 35% 30%, #c4b5fd, #7868ff 42%, #4f8cff 78%)",
                  borderRadius: "50%",
                  boxShadow:
                    "0 0 55px rgba(120,104,255,.34)",
                  fontSize: 31,
                  fontWeight: 900,
                }}
              >
                A
              </div>

              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "clamp(30px,4vw,42px)",
                  letterSpacing: "-.035em",
                }}
              >
                Atlas is the intelligence layer inside AutoTeams.
              </h2>

              <p
                style={{
                  margin: 0,
                  maxWidth: 720,
                  color: "#96a3b6",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                Atlas analyses the people available, their strengths,
                experience, interests and the objective of the group.
                It creates an explainable recommendation that highlights
                strengths, gaps and risks before any human decision is made.
              </p>

              <div
                style={{
                  marginTop: 16,
                  padding: 13,
                  color: "#d1d7e2",
                  background: "#171e2d",
                  border: "1px solid #2a3448",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                AI recommends. Humans decide.
              </div>
            </div>

            <div
              className="v671-benefits-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: 12,
              }}
            >
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  style={{
                    display: "grid",
                    gap: 10,
                    padding: 18,
                    background: "#171e2d",
                    border: "1px solid #2a3448",
                    borderRadius: 16,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: 30,
                    }}
                  >
                    {benefit.icon}
                  </span>

                  <strong
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {benefit.title}
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "#8f9bb0",
                      fontSize: 12,
                      lineHeight: 1.55,
                    }}
                  >
                    {benefit.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            padding: "56px 0",
          }}
         data-autoteams-home-how-v71571421="true">
          <div className="container">
            {/* AUTOTEAMS_V715714_OPEN_TEAMS */}
            <HomeAvailableTeams />

            <SectionHeading
              eyebrow="How AutoTeams works"
              title="From people to purpose to explainable recommendation."
              text="The same simple process can be used for a project team, sports squad, friendship circle, community group or event."
            />

            {/* AUTOTEAMS_V7157121_HOW_GRID */}
<div
              className="v671-process-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(200px,1fr))",
                gap: 12,
                marginTop: 26,
              }}
             data-autoteams-how-grid-v7157121="true">
              {process.map((step, index) => (
                <article
                  key={step.title}
                  style={{
                    position: "relative",
                    display: "grid",
                    gap: 10,
                    padding: 18,
                    background: "#171e2d",
                    border: "1px solid #2a3448",
                    borderRadius: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: 29,
                      }}
                    >
                      {step.icon}
                    </span>

                    <small
                      style={{
                        color: "#6f7c91",
                        fontSize: 9,
                        fontWeight: 900,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </small>
                  </div>

                  <strong
                    style={{
                      fontSize: 14,
                    }}
                  >
                    {step.title}
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "#8f9bb0",
                      fontSize: 11,
                      lineHeight: 1.55,
                    }}
                  >
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>




        <style>{`
          html,
          body {
            max-width: 100%;
            overflow-x: hidden;
          }

          .v664-use-case-card {
            min-width: 0;
            transition:
              transform .25s ease,
              border-color .25s ease,
              box-shadow .25s ease;
          }

          .v664-use-case-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 24px 64px rgba(0,0,0,.28);
          }

          .v664-use-case-card:hover > div:first-child {
            transform: scale(1.08);
          }

          @media (max-width: 1024px) {
            .v671-use-case-grid {
              grid-template-columns:
                repeat(2,minmax(0,1fr)) !important;
            }

            .v671-atlas-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 720px) {
            .v671-hero {
              gap: 18px !important;
            }

            .v671-hero-title {
              font-size: clamp(38px, 11vw, 52px) !important;
              line-height: 1.02 !important;
              letter-spacing: -.045em !important;
            }

            .v671-hero-copy {
              font-size: 16px !important;
              line-height: 1.6 !important;
            }

            .v671-use-case-grid {
              grid-template-columns: 1fr !important;
              gap: 14px !important;
            }

            .v664-use-case-card {
              min-height: 0 !important;
              width: 100% !important;
              padding: 20px !important;
              border-radius: 20px !important;
            }

            .v664-use-case-card > div:first-child {
              width: 68px !important;
              height: 68px !important;
              font-size: 40px !important;
            }

            .v664-use-case-card h3 {
              font-size: 22px !important;
            }

            .v664-use-case-card p {
              font-size: 14px !important;
              line-height: 1.6 !important;
            }

            .v671-benefits-grid {
              grid-template-columns: 1fr !important;
            }

            .v671-process-grid {
              grid-template-columns: 1fr !important;
            }

            .container {
              width: min(100% - 32px, 1180px);
            }

            main section {
              scroll-margin-top: 70px;
            }
          }

          @media (max-width: 420px) {
            .container {
              width: min(100% - 24px, 1180px);
            }

            .v671-hero-title {
              font-size: clamp(34px, 10.5vw, 44px) !important;
            }

            .v671-hero-copy {
              font-size: 15px !important;
            }

            .v664-use-case-card {
              padding: 18px !important;
            }
          }
        `}</style>


        <section
          style={{
            padding: "54px 0",
            background:
              "linear-gradient(135deg,rgba(120,104,255,.10),rgba(79,140,255,.04))",
            borderTop: "1px solid #222b3c",
          }}
         data-autoteams-home-academy-v7157142="true" data-autoteams-home-academy-unified-v71571421="true">
          <div
            className="container"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0,.85fr) minmax(0,1.15fr)",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div>
              <span className="eyebrow">
                Team Science Academy
              </span>

              <h2
                style={{
                  margin: "9px 0",
                  fontSize:
                    "clamp(30px,4vw,42px)",
                  lineHeight: 1.12,
                  letterSpacing: "-.035em",
                }}
              >
                Learn why better teams work.
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#98a5b7",
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                Explore Team Science foundations,
                building balanced teams, explainable AI
                and team health. Learn the principles
                Atlas uses to support every explainable
                recommendation.
              </p>

              <Link
                className="button"
                href="/academy"
                style={{
                  marginTop: 18,
                  width: "fit-content",
                }}
              >
                Explore Academy
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: 10,
              }}
            >
              {[
                ["🧠", "Foundations"],
                ["👥", "Building Teams"],
                ["🤖", "Explainable AI"],
                ["📈", "Team Health"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  style={{
                    display: "grid",
                    gap: 7,
                    padding: 17,
                    background: "#171e2d",
                    border: "1px solid #2a3448",
                    borderRadius: 14,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{ fontSize: 28 }}
                  >
                    {icon}
                  </span>
                  <strong
                    style={{ fontSize: 13 }}
                  >
                    {label}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            padding: "0 0 74px",
          }}
         data-autoteams-home-possibilities-v71571421="true">
          <div className="container">
            <div
              style={{
                display: "grid",
                gap: 16,
                padding: 30,
                textAlign: "center",
                background:
                  "linear-gradient(135deg,rgba(120,104,255,.18),rgba(34,197,94,.08))",
                border: "1px solid #343f59",
                borderRadius: 24,
              }}
            >
              <span className="eyebrow">
                One platform. Many possibilities.
              </span>

              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(30px,4vw,46px)",
                  lineHeight: 1.1,
                  letterSpacing: "-.04em",
                }}
              >
                Bring the right people together for the right purpose.
              </h2>

              <p
                style={{
                  margin: "0 auto",
                  maxWidth: 760,
                  color: "#a7b2c1",
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                Whether the goal is work, sport, friendship,
                volunteering, learning or simply meeting people with
                shared interests, AutoTeams helps make the process
                more thoughtful, balanced and explainable.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <Link
                  className="button"
                  href="/get-started"
                >
                  Get Started
                </Link>

                <Link
                  className="button secondary"
                  href="/team-builder"
                >
                  Build a Team
                </Link>
          <Link className="button landing-invite-cta" href="/members#invite">
            Invite People
          </Link>
              </div>
            </div>
          </div>
        </section>
<SocialMediaFooter />
</main>
          <LandingCtaPalette />
    </PageShell>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        maxWidth: 840,
      }}
    >
      <span className="eyebrow">
        {eyebrow}
      </span>

      <h2
        style={{
          margin: "9px 0 8px",
          fontSize: "clamp(30px,4vw,42px)",
          lineHeight: 1.12,
          letterSpacing: "-.035em",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          color: "#8f9bb0",
          fontSize: 14,
          lineHeight: 1.65,
        }}
      >
        {text}
      </p>
    </div>
  );
}
