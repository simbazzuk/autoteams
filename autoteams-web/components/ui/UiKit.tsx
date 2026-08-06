import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./UiKit.module.css";

export function UiButton({
  children,
  href,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const className = `${styles.button} ${styles[variant]}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function UiCard({
  children,
  interactive = false,
  className = "",
}: {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`${styles.card} ${interactive ? styles.interactive : ""} ${className}`}
    >
      {children}
    </section>
  );
}

export function UiBadge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {children}
    </span>
  );
}

export function UiSectionHeader({
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
    <header className={styles.sectionHeader}>
      <div>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}

export function UiMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <article className={styles.metric}>
      <small>{label}</small>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </article>
  );
}
