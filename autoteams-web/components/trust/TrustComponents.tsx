import Link from "next/link";
import type { ReactNode } from "react";
import { AtlasOrb } from "@/components/AtlasOrb";

export function TrustHero({
  eyebrow,
  title,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  text: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="trust12-hero">
      <div className="container trust12-hero-grid">
        <div className="trust12-hero-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{text}</p>

          {(primaryHref || secondaryHref) && (
            <div className="actions">
              {primaryHref && primaryLabel && (
                <Link className="button" href={primaryHref}>
                  {primaryLabel}
                </Link>
              )}
              {secondaryHref && secondaryLabel && (
                <Link className="button secondary" href={secondaryHref}>
                  {secondaryLabel}
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="trust12-hero-atlas">
          <AtlasOrb size="xl" />
          <span className="eyebrow">Powered by Atlas</span>
          <h2>Trust is part of the product.</h2>
          <p>
            Privacy, explainability, human review and secure workspace boundaries
            are designed into the experience.
          </p>
        </aside>
      </div>
    </section>
  );
}

export function TrustCard({
  icon,
  title,
  text,
  href,
  linkLabel = "Learn more",
}: {
  icon: string;
  title: string;
  text: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <article className="trust12-card">
      <span className="trust12-card-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {href && (
        <Link href={href}>
          {linkLabel}
          <span>→</span>
        </Link>
      )}
    </article>
  );
}

export function TrustSectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="trust12-section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function TrustTimeline({
  items,
}: {
  items: Array<{ number: string; title: string; text: string }>;
}) {
  return (
    <div className="trust12-timeline">
      {items.map((item) => (
        <article key={item.number}>
          <span>{item.number}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function TrustActionCard({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: ReactNode;
}) {
  return (
    <article className="trust12-action-card">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div>{action}</div>
    </article>
  );
}
