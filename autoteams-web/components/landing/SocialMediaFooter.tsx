import styles from "./SocialMediaFooter.module.css";

type SocialLink = {
  name: string;
  href?: string;
  className: string;
  icon: React.ReactNode;
};

const socialLinks: SocialLink[] = [
  {
    name: "LinkedIn",
    href:
      process.env
        .NEXT_PUBLIC_AUTOTEAMS_LINKEDIN_URL,
    className:
      styles.linkedin,
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5.4 7.1A2.1 2.1 0 1 0 5.4 2.9a2.1 2.1 0 0 0 0 4.2ZM3.6 8.7h3.6V20H3.6V8.7Zm5.8 0h3.45v1.55h.05c.48-.91 1.65-1.87 3.4-1.87 3.64 0 4.31 2.4 4.31 5.52V20h-3.6v-5.4c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.86V20H9.4V8.7Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href:
      process.env
        .NEXT_PUBLIC_AUTOTEAMS_FACEBOOK_URL,
    className:
      styles.facebook,
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M13.8 21v-8h2.7l.4-3.1h-3.1V7.95c0-.9.25-1.51 1.55-1.51H17V3.66c-.29-.04-1.27-.12-2.42-.12-2.4 0-4.04 1.46-4.04 4.14V9.9H7.83V13h2.71v8h3.26Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href:
      process.env
        .NEXT_PUBLIC_AUTOTEAMS_INSTAGRAM_URL,
    className:
      styles.instagram,
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M7.4 2.7h9.2a4.7 4.7 0 0 1 4.7 4.7v9.2a4.7 4.7 0 0 1-4.7 4.7H7.4a4.7 4.7 0 0 1-4.7-4.7V7.4a4.7 4.7 0 0 1 4.7-4.7Zm0 2A2.7 2.7 0 0 0 4.7 7.4v9.2a2.7 2.7 0 0 0 2.7 2.7h9.2a2.7 2.7 0 0 0 2.7-2.7V7.4a2.7 2.7 0 0 0-2.7-2.7H7.4Zm9.7 1.45a1.18 1.18 0 1 1 0 2.36 1.18 1.18 0 0 1 0-2.36ZM12 7.35A4.65 4.65 0 1 1 12 16.65 4.65 4.65 0 0 1 12 7.35Zm0 2A2.65 2.65 0 1 0 12 14.65 2.65 2.65 0 0 0 12 9.35Z" />
      </svg>
    ),
  },
];

export function SocialMediaFooter() {
  const activeLinks =
    socialLinks.filter(
      (link) =>
        Boolean(
          link.href?.trim(),
        ),
    );

  if (
    activeLinks.length === 0
  ) {
    return null;
  }

  return (
    <section
      className={styles.wrap}
      data-autoteams-social-links="true"
      aria-label="TeamScience.ai social media"
    >
      <div
        className={styles.inner}
      >
        <div
          className={styles.copy}
        >
          <span>
            FOLLOW TEAMSCIENCE.AI
          </span>

          <h2>
            Keep up with the
            TeamScience.ai journey.
          </h2>

          <p>
            Follow Team Science
            insights, product
            updates and new ways
            TeamScience.ai is helping
            people build better
            teams.
          </p>
        </div>

        <div
          className={styles.links}
        >
          {activeLinks.map(
            (link) => (
              <a
                key={
                  link.name
                }
                href={
                  link.href
                }
                target="_blank"
                rel="noreferrer"
                className={
                  styles.socialLink
                }
                aria-label={`Follow TeamScience.ai on ${link.name}`}
              >
                <span
                  className={`${styles.iconTile} ${link.className}`}
                  aria-hidden="true"
                >
                  {
                    link.icon
                  }
                </span>

                <strong>
                  {
                    link.name
                  }
                </strong>
              </a>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
