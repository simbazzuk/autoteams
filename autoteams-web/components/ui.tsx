import Link from "next/link";
import type { ReactNode } from "react";

export function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`commercial-surface ${className}`}>{children}</section>;
}

export function SectionHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="commercial-section-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action && <div className="commercial-section-action">{action}</div>}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: string;
}) {
  return (
    <article className="commercial-metric">
      <span className="commercial-metric-icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{note}</em>
      </span>
    </article>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return <span className={`commercial-status commercial-status-${tone}`}>{children}</span>;
}

export function EmptyState({
  icon,
  title,
  text,
  href,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="commercial-empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {href && action && <Link className="button" href={href}>{action}</Link>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`commercial-skeleton ${className}`} aria-hidden="true" />;
}
