"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./FeedbackLauncher.module.css";

export function FeedbackLauncher() {
  const pathname = usePathname();

  if (pathname === "/feedback" || pathname.startsWith("/feedback/")) return null;

  return (
    <Link
      aria-label="Share feedback and ideas"
      className={styles.launcher}
      href="/feedback"
      title="Feedback & Ideas"
    >
      <span aria-hidden="true">{"\u2726"}</span>
      <span>Feedback</span>
    </Link>
  );
}
