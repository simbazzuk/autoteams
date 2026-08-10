import styles from "./SocialMediaFooter.module.css";

const links = [
  {
    name: "LinkedIn",
    href: process.env.NEXT_PUBLIC_AUTOTEAMS_LINKEDIN_URL,
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.96 1.96 0 1 0 5.25 6.92 1.96 1.96 0 0 0 5.25 3ZM20.44 13.4c0-3.47-1.85-5.08-4.31-5.08-1.99 0-2.88 1.09-3.38 1.86V8.5H9.37V20h3.38v-5.7c0-1.5.28-2.95 2.14-2.95 1.83 0 1.86 1.71 1.86 3.05V20h3.38v-6.6h.31Z"/></svg>
  },
  {
    name: "Facebook",
    href: process.env.NEXT_PUBLIC_AUTOTEAMS_FACEBOOK_URL,
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.8 20v-7h2.35l.35-2.73h-2.7V8.53c0-.79.22-1.33 1.36-1.33H16.6V4.76c-.25-.03-1.1-.1-2.1-.1-2.08 0-3.5 1.27-3.5 3.6v2.01H8.65V13H11v7h2.8Z"/></svg>
  },
  {
    name: "Instagram",
    href: process.env.NEXT_PUBLIC_AUTOTEAMS_INSTAGRAM_URL,
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 2A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 16.5 5h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7.5A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5Z"/></svg>
  }
];

export function SocialMediaFooter() {
  const active = links.filter((link) => Boolean(link.href?.trim()));
  if (!active.length) return null;

  return (
    <section className={styles.wrap} data-autoteams-social-links="true" aria-label="AutoTeams social media">
      <div className={styles.inner}>
        <div>
          <span>FOLLOW AUTOTEAMS</span>
          <p>Follow the AutoTeams journey, Team Science insights and product updates.</p>
        </div>
        <div className={styles.links}>
          {active.map((link) => (
            <a key={link.name} href={link.href} target="_blank" rel="noreferrer" aria-label={`Follow AutoTeams on ${link.name}`} title={link.name}>
              {link.icon}
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
