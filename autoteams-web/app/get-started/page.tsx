import { PageShell } from "@/components/Site";
import { GetStartedExperience } from "@/components/get-started/GetStartedExperience";

export default function GetStartedPage() {
  return (
    <PageShell>
      <section
        style={{
          minHeight: "75vh",
          padding: "48px 0 80px",
          background: "#0f1420",
        }}
      >
        <div className="container">
          <span className="eyebrow">TeamScience.ai</span>

          <h1
            style={{
              margin: "10px 0 12px",
              maxWidth: 820,
              color: "#f5f7fb",
              fontSize: "clamp(38px,5vw,52px)",
              letterSpacing: "-.04em",
            }}
          >
            Get Started
          </h1>

          <p
            style={{
              maxWidth: 820,
              margin: "0 0 24px",
              color: "#8f9bb0",
              fontSize: 15,
              lineHeight: 1.65,
            }}
          >
            Set up your workspace, add people and create
            your first explainable team recommendation.
            TeamScience.ai will track your progress as you go.
          </p>

                  {/* AUTOTEAMS_V71381_CURRENT_JOURNEY */}
        <section className="getstarted81-current">
          <div className="getstarted81-head">
            <div>
              <span className="getstarted81-kicker">
                How TeamScience.ai works now
              </span>

              <h1>
                From your Atlas Profile to a reviewed team recommendation.
              </h1>

              <p>
                Start with how Atlas understands you, bring people together
                inside a workspace, then use explainable recommendations to
                support a human team decision.
              </p>
            </div>

            <a href="/academy">
              Learn in Academy
            </a>
          </div>

          <div className="getstarted81-definitions">
            <div className="profile">
              <b>P</b>
              <div>
                <strong>Your Atlas Profile</strong>
                <p>
                  Describes you in a context such as Business, Friendship,
                  Community, Sports or Education. Tune it by answering Atlas
                  interview questions about strengths, preferences and working
                  style.
                </p>
                <a href="/my-atlas-profile">
                  Improve my Atlas Profile
                </a>
              </div>
            </div>

            <div className="workspace">
              <b>W</b>
              <div>
                <strong>Your Workspace</strong>
                <p>
                  The private group boundary for people, teams,
                  recommendations and decisions. A profile explains a person;
                  a workspace defines where people collaborate.
                </p>
                <a href="/workspaces">
                  View workspaces
                </a>
              </div>
            </div>
          </div>

          <div className="getstarted81-steps">
            <a href="/my-atlas-profile">
              <b>1</b>
              <span>Atlas Profile</span>
              <strong>Tune how Atlas understands you</strong>
              <small>Answer the contextual interview questions.</small>
            </a>

            <a href="/workspaces">
              <b>2</b>
              <span>Workspace</span>
              <strong>Create or join your group</strong>
              <small>
                Creator becomes Owner; invited users start as Members.
              </small>
            </a>

            <a href="/members#invite">
              <b>3</b>
              <span>People</span>
              <strong>Invite the people you need</strong>
              <small>
                Owners can promote a Member to Team Leader.
              </small>
            </a>

            <a href="/team-builder">
              <b>4</b>
              <span>Build Team</span>
              <strong>Describe the team requirement</strong>
              <small>
                Select the authorised population and desired outcome.
              </small>
            </a>

            <a href="/team-builder">
              <b>5</b>
              <span>Atlas AI</span>
              <strong>Generate an explainable recommendation</strong>
              <small>
                Gemini recommendations use your free-plan AI allowance.
              </small>
            </a>

            <a href="/recommendation-history">
              <b>6</b>
              <span>Human review</span>
              <strong>Review, approve or reject</strong>
              <small>
                Keep recommendation and decision history together.
              </small>
            </a>

            <a href="/team-dna">
              <b>7</b>
              <span>Team DNA</span>
              <strong>Understand team balance</strong>
              <small>
                Explore collective strengths and team-fit signals.
              </small>
            </a>

            <a href="/insights">
              <b>8</b>
              <span>Insights</span>
              <strong>Learn and improve</strong>
              <small>
                Use Team Insights and Academy to improve future decisions.
              </small>
            </a>
          </div>

          <div className="getstarted81-allowance">
            <b>AI</b>
            <div>
              <strong>Free-plan Atlas AI allowance</strong>
              <p>
                Gemini-powered recommendations use your monthly AI allowance.
                Atlas Profiles, Team DNA, saved recommendations and
                deterministic team building remain available without
                consuming a Gemini credit.
              </p>
            </div>

            <a href="/academy">
              How recommendations work
            </a>
          </div>
        </section>
<GetStartedExperience />
        </div>
      </section>
    </PageShell>
  );
}
