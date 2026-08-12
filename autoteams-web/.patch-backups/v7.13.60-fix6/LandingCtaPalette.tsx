"use client";

import { useEffect } from "react";

type CtaKind =
  | "get-started"
  | "build-team"
  | "invite-people";

const CTA_LABELS: Array<{
  label: string;
  kind: CtaKind;
}> = [
  {
    label: "get started",
    kind: "get-started",
  },
  {
    label: "build a team",
    kind: "build-team",
  },
  {
    label: "invite people",
    kind: "invite-people",
  },
];

function normalise(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function LandingCtaPalette() {
  useEffect(() => {
    const apply = () => {
      const candidates =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            "a, button",
          ),
        );

      CTA_LABELS.forEach(
        ({ label, kind }) => {
          const match =
            candidates.find(
              (element) =>
                normalise(
                  element.textContent || "",
                ) === label,
            );

          if (match) {
            match.dataset.autoteamsLandingCta =
              kind;
          }
        },
      );
    };

    apply();

    const observer =
      new MutationObserver(apply);

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      },
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
