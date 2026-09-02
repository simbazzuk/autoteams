"use client";

import Link from "next/link";
import styles from "./UnifiedTeamBuilderEntry.module.css";

type BuildMode = "people" | "opportunity" | "hybrid";

const MODE_KEY = "autoteams-build-route-v71511";

export function UnifiedTeamBuilderEntry({
  onModeSelected,
}: {
  onModeSelected?: (mode: BuildMode) => void;
}) {
  function continueWithBuilder(mode: Exclude<BuildMode, "opportunity">) {
    try {
      localStorage.setItem(MODE_KEY, mode);
      if (mode === "hybrid") {
        localStorage.removeItem("autoteams-active-hybrid-team-v715121");
      }
    } catch {}

    const target = document.getElementById(
      "autoteams-guided-team-builder",
    );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <section
      className={styles.shell}
      data-autoteams-unified-team-builder="v7.15.7.15.11.4"
    >
      <div className={styles.hero}>
        <span className={styles.eyebrow}>TeamScience.ai Team Builder</span>
        <h1>Build teams in the way that suits you.</h1>
        <p>
          Choose the route that best matches where you are today. Atlas can
          support you whether you already know the people, need to find them,
          or want help identifying what is missing.
        </p>
      </div>

      <div className={styles.sectionTitle}>
        <span>How would you like to build your team?</span>
      </div>

      <div className={styles.grid}>
        <article className={`${styles.route} ${styles.peopleRoute}`}>
          <div className={styles.numberBadge}>1</div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.peopleIcon}>
              <span className={styles.personMain}></span>
              <span className={styles.personLeft}></span>
              <span className={styles.personRight}></span>
              <span className={styles.shield}>✓</span>
            </div>
          </div>

          <div className={styles.copy}>
            <span className={styles.routeLabel}>My people</span>
            <h2>Build from existing people</h2>
            <strong className={styles.oneLine}>
              I already have people in mind.
            </strong>

            <ul>
              <li>Choose from your existing people</li>
              <li>Atlas optimises the team composition</li>
              <li>Form the team without external recruiting</li>
            </ul>
          </div>

                                  {/* AUTOTEAMS_V7157152031_PEOPLE_FLOW */}
            <p
              style={{
                margin: "12px 0 14px",
                color: "rgba(174, 196, 222, .78)",
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: "#9fc2ff" }}>People</strong>
              {" "}&rarr;{" "}
              <strong style={{ color: "#9fc2ff" }}>Atlas recommends</strong>
              {" "}&rarr;{" "}
              <strong style={{ color: "#9fc2ff" }}>Save</strong>
            </p>

<button
            className={styles.action}
            type="button"
            onClick={() => {
              // AUTOTEAMS_V7157152042_PEOPLE_MODE
              onModeSelected?.("people");
              continueWithBuilder("people");
            }}
          >
            Build from existing people
            <span aria-hidden="true">→</span>
          </button>

          <small>
            <b>Best when:</b> You already have enough people to choose from.
          </small>
        </article>

        <article className={`${styles.route} ${styles.findRoute}`}>
          <div className={styles.numberBadge}>2</div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.searchIcon}>
              <span className={styles.searchPerson}></span>
              <span className={styles.searchRing}></span>
              <span className={styles.searchHandle}></span>
            </div>
          </div>

          <div className={styles.copy}>
            <span className={styles.routeLabel}>Opportunity</span>
            <h2>Find people</h2>
            <strong className={styles.oneLine}>
              I need to find the right people.
            </strong>

            <ul>
              <li>Describe your team objective</li>
              <li>Attract interested candidates</li>
              <li>Review, invite and form the team</li>
            </ul>
          </div>

                      {/* AUTOTEAMS_V7157152033_OPPORTUNITY_FLOW */}
            <p
              style={{
                margin: "12px 0 14px",
                color: "rgba(174, 202, 235, .80)",
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: "#79b9ff" }}>Publish</strong>
              {" "}&rarr;{" "}
              <strong style={{ color: "#79b9ff" }}>Discover</strong>
              {" "}&rarr;{" "}
              <strong style={{ color: "#79b9ff" }}>Invite</strong>
            </p>

              {/* AUTOTEAMS_V715715223_OPPORTUNITY_TAGLINE */}
              <div
                style={{
                  margin: "12px 0 10px",
                  borderRadius: 12,
                  padding: "9px 11px",
                  border: "1px solid rgba(79,142,247,.24)",
                  background:
                    "linear-gradient(135deg, rgba(79,142,247,.10), rgba(118,87,255,.08))",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#8ec5ff",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  More than recruitment
                </span>

                <strong
                  style={{
                    display: "block",
                    color: "#eef5ff",
                    fontSize: 11,
                    lineHeight: 1.45,
                  }}
                >
                  Not a job board. Not a CV database.
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: 2,
                    color: "#a9c8ff",
                    fontSize: 10,
                    lineHeight: 1.4,
                  }}
                >
                  An AI-powered team and opportunity matching network.
                </span>
              </div>
<Link className={styles.action} href="/opportunities">
            Create an Opportunity
            <span aria-hidden="true">→</span>
          </Link>

          <small>
            <b>Best when:</b> You need to discover new people.
          </small>
        </article>

        <article className={`${styles.route} ${styles.hybridRoute}`}>
          <div className={styles.numberBadge}>3</div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.puzzleIcon}>
              <span className={styles.puzzleOne}></span>
              <span className={styles.puzzleTwo}></span>
              <span className={styles.puzzleThree}></span>
              <span className={styles.puzzleGap}></span>
            </div>
          </div>

          <div className={styles.copy}>
            <span className={styles.routeLabel}>Hybrid</span>
            <h2>Build an initial team, then recruit gaps</h2>
            {/* AUTOTEAMS_V715715204_HYBRID_STAGES */}
            <p
              style={{
                margin: "8px 0 0",
                color: "rgba(189, 224, 216, .78)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Stage 1: form the initial team. Stage 2: Atlas analyses and fills the gaps.
            </p>
            <strong className={styles.oneLine}>
              I have part of the team.
            </strong>

            <ul>
              <li>Start with your current people</li>
              <li>Atlas identifies missing capabilities</li>
              <li>Recruit only the gaps you need</li>
            </ul>
          </div>

                                  {/* AUTOTEAMS_V7157152031_HYBRID_FLOW */}
            <p
              style={{
                margin: "12px 0 14px",
                color: "rgba(174, 214, 205, .82)",
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: "#67e4c6" }}>Build</strong>
              {" "}&rarr;{" "}
              <strong style={{ color: "#67e4c6" }}>Analyse gaps</strong>
              {" "}&rarr;{" "}
              <strong style={{ color: "#67e4c6" }}>Recruit</strong>
            </p>

<button
            className={styles.action}
            type="button"
            onClick={() => {
              // AUTOTEAMS_V7157152042_HYBRID_MODE
              onModeSelected?.("hybrid");
              continueWithBuilder("hybrid");
            }}
          >
            Start hybrid team
            <span aria-hidden="true">→</span>
          </button>

          <small>
            <b>Best when:</b> You have part of the team and need to complete it.
          </small>
        </article>
      </div>

      <div className={styles.atlasPanel}>
        <div className={styles.atlasIntro}>
          <span className={styles.atlasIcon} aria-hidden="true">✦</span>
          <div>
            <strong>Why use Atlas?</strong>
            <span>
              Explainable recommendations, capability analysis and human control.
            </span>
          </div>
        </div>

        <div className={styles.atlasBenefit}>
          <strong>Explainable</strong>
          <span>Understand why a person or capability is recommended.</span>
        </div>

        <div className={styles.atlasBenefit}>
          <strong>Objective-led</strong>
          <span>Recommendations stay focused on what the team must achieve.</span>
        </div>

        <div className={styles.atlasBenefit}>
          <strong>Human decision</strong>
          <span>You remain in control of the final team.</span>
        </div>
      </div>
    </section>
  );
}
