"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./AtlasAiAllowanceBadge.module.css";

type UsageState = {
  plan: "free";
  limit: number;
  used: number;
  remaining: number;
  period: string;
  resetLabel: string;
};

const visibleRoutes = [
  "/team-builder",
  "/matches",
  "/team-insights",
  "/insights",
  "/recommendation-history",
  "/recommendation-detail",
  "/recommendation-compare",
  "/my-atlas-profile",
  "/atlas",
];

export function AtlasAiAllowanceBadge() {
  const pathname = usePathname();
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [open, setOpen] = useState(false);

  const visible = useMemo(
    () =>
      visibleRoutes.some(
        (route) =>
          pathname === route ||
          pathname.startsWith(`${route}/`),
      ),
    [pathname],
  );

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    async function loadUsage() {
      try {
        const response = await fetch("/api/ai-usage", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as UsageState;

        if (!cancelled) {
          setUsage(data);
        }
      } catch {
        // Allowance display is informational only.
      }
    }

    loadUsage();

    const handleRefresh = () => loadUsage();
    window.addEventListener(
      "autoteams:ai-usage-changed",
      handleRefresh,
    );

    return () => {
      cancelled = true;
      window.removeEventListener(
        "autoteams:ai-usage-changed",
        handleRefresh,
      );
    };
  }, [visible, pathname]);

  if (!visible || !usage) {
    return null;
  }

  const low = usage.remaining <= Math.max(2, Math.ceil(usage.limit * 0.2));
  const empty = usage.remaining <= 0;

  return (
    <div className={styles.wrapper} data-autoteams-ai-allowance="true">
      <button
        aria-expanded={open}
        title={`${usage.remaining} of ${usage.limit} Atlas AI recommendations remaining`}
        className={`${styles.badge} ${
          empty
            ? styles.empty
            : low
              ? styles.low
              : ""
        }`}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className={styles.spark} aria-hidden="true">
          ✦
        </span>
        <span className={styles.label}>
          <strong>Atlas AI</strong>
        </span>
        <span className={styles.count}>
          {usage.remaining}/{usage.limit}
        </span>
      </button>

      {open && (
        <div className={styles.popover}>
          <div className={styles.popoverHeader}>
            <div>
              <span>Free plan allowance</span>
              <strong>
                {usage.remaining} Atlas AI recommendation
                {usage.remaining === 1 ? "" : "s"} remaining
              </strong>
            </div>
            <button
              aria-label="Close allowance details"
              onClick={() => setOpen(false)}
              type="button"
            >
              ×
            </button>
          </div>

          <div className={styles.meter}>
            <i
              style={{
                width: `${
                  usage.limit > 0
                    ? Math.max(
                        0,
                        Math.min(
                          100,
                          (usage.remaining / usage.limit) * 100,
                        ),
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <div className={styles.stats}>
            <span>
              <small>Used</small>
              <strong>{usage.used}</strong>
            </span>
            <span>
              <small>Remaining</small>
              <strong>{usage.remaining}</strong>
            </span>
            <span>
              <small>Monthly limit</small>
              <strong>{usage.limit}</strong>
            </span>
          </div>

          <p>
            AI-powered team recommendations use your monthly
            Atlas AI allowance. Profiles, Team DNA, saved
            recommendations and deterministic team building remain
            available without using an AI recommendation.
          </p>

          <small className={styles.reset}>
            Allowance resets on {usage.resetLabel}.
          </small>
        </div>
      )}
    </div>
  );
}
