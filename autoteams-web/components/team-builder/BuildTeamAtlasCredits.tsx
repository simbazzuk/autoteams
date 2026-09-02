"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./BuildTeamAtlasCredits.module.css";

type Usage = {
  used: number;
  limit: number;
  remaining: number;
};

export function BuildTeamAtlasCredits() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/ai-usage", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as Partial<Usage>;

      if (
        typeof data.used === "number" &&
        typeof data.limit === "number" &&
        typeof data.remaining === "number"
      ) {
        setUsage({
          used: data.used,
          limit: data.limit,
          remaining: data.remaining,
        });
      }
    } catch {
      // Usage display is informational only. Build Team must remain usable
      // even when the allowance endpoint is temporarily unavailable.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onUsageChanged = () => {
      void refresh();
    };

    window.addEventListener(
      "autoteams:ai-usage-changed",
      onUsageChanged,
    );

    const timer = window.setInterval(
      refresh,
      15000,
    );

    return () => {
      window.removeEventListener(
        "autoteams:ai-usage-changed",
        onUsageChanged,
      );
      window.clearInterval(timer);
    };
  }, [refresh]);

  if (loading && !usage) {
    return (
      <div
        className={styles.counter}
        data-autoteams-build-team-atlas-credits="true"
        aria-label="Loading Atlas Credits"
      >
        <span className={styles.icon} aria-hidden="true">
          ✦
        </span>
        <span className={styles.label}>Atlas Credits</span>
        <strong>—/—</strong>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const low =
    usage.remaining <=
    Math.max(2, Math.ceil(usage.limit * 0.2));

  const empty = usage.remaining <= 0;

  return (
    <div
      className={`${styles.wrapper} ${
        empty ? styles.empty : low ? styles.low : ""
      }`}
      data-autoteams-build-team-atlas-credits="true"
    >
      <div
        className={styles.counter}
        title={`${usage.remaining} of ${usage.limit} Atlas Credits remaining`}
      >
        <span className={styles.icon} aria-hidden="true">
          ✦
        </span>

        <span className={styles.label}>Atlas Credits</span>

        <strong>
          {usage.remaining}/{usage.limit}
        </strong>
      </div>

      <span className={styles.note}>
        {empty
          ? "No AI recommendation credits remaining"
          : "AI recommendations use 1 credit"}
      </span>
    </div>
  );
}
