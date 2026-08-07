import Link from "next/link";
import {
  academyPaths,
} from "@/lib/team-science/academy";

export function AcademyPathPage({
  slug,
}: {
  slug: string;
}) {
  const path =
    academyPaths.find(
      (item) =>
        item.slug === slug,
    );

  if (!path) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "78vh",
        padding: "58px 0 76px",
        background: "#0f1420",
        color: "#f5f7fb",
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

        <section
          style={{
            display: "grid",
            gap: 15,
            marginTop: 22,
            padding: 26,
            background: path.accent,
            border:
              "1px solid rgba(255,255,255,.09)",
            borderRadius: 22,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              fontSize: 48,
            }}
          >
            {path.icon}
          </span>

          <span className="eyebrow">
            Learning Path
          </span>

          <h1
            style={{
              margin: 0,
              maxWidth: 820,
              fontSize:
                "clamp(38px,5vw,58px)",
              lineHeight: 1.04,
              letterSpacing: "-.045em",
            }}
          >
            {path.title}
          </h1>

          <p
            style={{
              maxWidth: 800,
              margin: 0,
              color: "#bdc7d5",
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            {path.description}
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gap: 12,
            marginTop: 24,
          }}
        >
          {path.topics.map(
            (topic, index) => (
              <article
                key={topic}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "44px minmax(0,1fr) auto",
                  gap: 14,
                  alignItems: "center",
                  padding: 17,
                  background: "#171e2d",
                  border:
                    "1px solid #2a3448",
                  borderRadius: 14,
                }}
              >
                <span
                  style={{
                    display: "grid",
                    width: 34,
                    height: 34,
                    placeItems: "center",
                    color: "#cfc9ff",
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
                  <strong
                    style={{
                      display: "block",
                      fontSize: 14,
                    }}
                  >
                    {topic}
                  </strong>

                  <small
                    style={{
                      color: "#8491a5",
                      fontSize: 10,
                    }}
                  >
                    Academy article
                  </small>
                </div>

                <span
                  style={{
                    color: "#78859a",
                    fontSize: 10,
                  }}
                >
                  Coming soon
                </span>
              </article>
            ),
          )}
        </section>

        <section
          style={{
            marginTop: 24,
            padding: 20,
            color: "#bcc6d4",
            background: "#121827",
            border:
              "1px solid #283247",
            borderRadius: 16,
          }}
        >
          <strong>
            Learning content foundation
          </strong>
          <p
            style={{
              margin:
                "7px 0 0",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            v6.8 establishes the Academy
            structure and learning paths.
            Full articles, quizzes,
            progress tracking and
            certification can be added
            incrementally without changing
            the navigation model.
          </p>
        </section>
      </div>
    </main>
  );
}
