import type { ReactNode } from "react";
import styles from "./ProductIcon.module.css";

export type ProductIconSize = "sm" | "md" | "lg";

export function ProductIcon({
  children,
  label,
  size = "md",
  subtle = false,
}: {
  children: ReactNode;
  label: string;
  size?: ProductIconSize;
  subtle?: boolean;
}) {
  return (
    <span
      aria-label={label}
      className={`${styles.icon} ${styles[size]} ${
        subtle ? styles.subtle : ""
      }`}
      role="img"
    >
      {children}
    </span>
  );
}
