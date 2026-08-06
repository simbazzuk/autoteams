import type { ReactNode } from "react";
import styles from "./AppIcon.module.css";

export type AppIconSize = "sm" | "md" | "lg";

export function AppIcon({
  children,
  size = "md",
  label,
  subtle = false,
  className = "",
}: {
  children: ReactNode;
  size?: AppIconSize;
  label?: string;
  subtle?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={[
        styles.icon,
        styles[size],
        subtle ? styles.subtle : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={label ? "img" : undefined}
    >
      {children}
    </span>
  );
}
