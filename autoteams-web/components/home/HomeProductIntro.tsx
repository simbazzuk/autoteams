import Link from "next/link";

export function HomeProductIntro() {
  return (
    <section
      aria-label="About AutoTeams"
      style={{
        display: "grid",
        gap: 16,
        margin: "24px 0 4px",
        padding: 20,
        background: "rgba(255,255,255,.035)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
      }}
    >
      <div>
        <span
          className="eyebrow"
          style={{
            display: "inline-block",
            marginBottom: 8,
          }}
        >
          What is AutoTeams?
        </span>

        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "clamp(22px,3vw,30px)",
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
          }}
        >
          AI-powered team intelligence with humans in control.
        </h2>

        <p
          style={{
            margin: 0,
            maxWidth: 860,
            color: "#a5b0c0",
            fontSize: 14,
            lineHeight: 1.65,
          }}
        >
          AutoTeams helps organisations create balanced teams from the
          people they already have. It combines team objectives, skills,
          strengths and explainable AI recommendations so users can make
          better-informed team decisions while retaining human review and
          accountability.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(190px,1fr))",
          gap: 9,
        }}
      >
        <Objective text="Use existing talent more effectively." />
        <Objective text="Build balanced teams around real outcomes." />
        <Objective text="Explain why people were recommended." />
        <Objective text="Keep the final decision with people." />
      </div>

      <div
        style={{
          display: "flex",
          gap: 9,
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
          href="/learn"
        >
          Learn More
        </Link>
      </div>
    </section>
  );
}

function Objective({
  text,
}: {
  text: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        padding: "10px 11px",
        color: "#c7cfdb",
        background: "rgba(15,20,32,.45)",
        borderRadius: 10,
        fontSize: 12,
        lineHeight: 1.45,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          color: "#9d91ff",
          fontWeight: 900,
        }}
      >
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
}
