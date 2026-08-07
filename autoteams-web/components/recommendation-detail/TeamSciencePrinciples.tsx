import Link from "next/link";
import {
  teamSciencePrinciples,
} from "@/lib/team-science/academy";

export function TeamSciencePrinciples() {
  return (
    <section
      style={{
        display: "grid",
        gap: 14,
        padding: 22,
        color: "#f5f7fb",
        background: "#171e2d",
        border: "1px solid #2a3448",
        borderRadius: 18,
      }}
    >
      <div>
        <span className="eyebrow">
          Team Science
        </span>
        <h2
          style={{
            margin: "7px 0 5px",
            fontSize: 23,
          }}
        >
          Principles applied to this recommendation
        </h2>
        <p
          style={{
            margin: 0,
            color: "#8f9bb0",
            fontSize: 11,
            lineHeight: 1.55,
          }}
        >
          These principles explain the kinds of evidence
          AutoTeams considers when helping a human review
          a team recommendation.
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
        {teamSciencePrinciples.map(
          (principle) => (
            <article
              key={principle.title}
              style={{
                padding: 13,
                background: "#121827",
                border:
                  "1px solid #263044",
                borderRadius: 11,
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: 11,
                }}
              >
                ✓ {principle.title}
              </strong>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#8491a5",
                  fontSize: 9,
                  lineHeight: 1.5,
                }}
              >
                {principle.text}
              </p>
            </article>
          ),
        )}
      </div>

      <Link
        href="/academy"
        style={{
          color: "#aaa2ff",
          fontSize: 10,
          fontWeight: 800,
        }}
      >
        Learn the Team Science behind recommendations →
      </Link>
    </section>
  );
}
