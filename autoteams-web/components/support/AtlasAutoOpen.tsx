"use client";

/* AutoTeams v7.15.2 - first-run Atlas guidance */

import {
  useEffect,
} from "react";

const SESSION_KEY =
  "autoteams-atlas-first-run-guidance-v7152";

const ASK_ATLAS_TEXT =
  /ask\s+atlas/i;

function visible(
  element: HTMLElement,
) {
  const style =
    window.getComputedStyle(
      element,
    );

  const box =
    element.getBoundingClientRect();

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    box.width > 0 &&
    box.height > 0
  );
}

function findAtlasLauncher():
  HTMLElement | null {
  const explicit =
    document.querySelector<HTMLElement>(
      [
        '[data-atlas-support-launcher="true"]',
        '[data-ask-atlas="true"]',
        '[aria-label*="Ask Atlas" i]',
        '[title*="Ask Atlas" i]',
      ].join(","),
    );

  if (
    explicit &&
    visible(explicit)
  ) {
    return explicit;
  }

  const candidates =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "button, a",
      ),
    );

  return (
    candidates.find(
      (element) =>
        visible(element) &&
        ASK_ATLAS_TEXT.test(
          element.textContent ?? "",
        ),
    ) ??
    null
  );
}

export function AtlasAutoOpen() {
  useEffect(() => {
    /*
     * Only auto-open once per browser tab/session.
     * If the user closes Atlas, navigation will not force it open again.
     */
    try {
      if (
        window.localStorage.getItem(
          SESSION_KEY,
        )
      ) {
        return;
      }
    } catch {}

    let finished = false;
    let observer:
      MutationObserver | null =
      null;

    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;

      try {
        window.localStorage.setItem(
          SESSION_KEY,
          "true",
        );
      } catch {}

      observer?.disconnect();
    };

    const tryOpen = () => {
      if (finished) {
        return;
      }

      const launcher =
        findAtlasLauncher();

      if (!launcher) {
        return;
      }

      /*
       * Do not auto-click links which navigate to /atlas.
       * We only want the floating/in-page support chatbot launcher.
       */
      if (
        launcher instanceof
          HTMLAnchorElement &&
        launcher.href
      ) {
        const url =
          new URL(
            launcher.href,
            window.location.href,
          );

        if (
          url.pathname ===
          "/atlas"
        ) {
          return;
        }
      }

      launcher.click();
      finish();
    };

    /*
     * Give the shell, auth state and support widget time to mount.
     */
    const initialTimer =
      window.setTimeout(
        tryOpen,
        700,
      );

    observer =
      new MutationObserver(
        () => {
          tryOpen();
        },
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      },
    );

    /*
     * Stop observing after 8 seconds. If no launcher exists on this route,
     * leave the session flag unset so Atlas can still auto-open later when
     * the authenticated application shell becomes available.
     */
    const stopTimer =
      window.setTimeout(
        () => {
          observer?.disconnect();
        },
        8000,
      );

    return () => {
      window.clearTimeout(
        initialTimer,
      );

      window.clearTimeout(
        stopTimer,
      );

      observer?.disconnect();
    };
  }, []);

  return null;
}