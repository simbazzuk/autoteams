"use client";

import { useEffect } from "react";

const ACTIVE_CLASS_NAMES = [
  "active",
  "selected",
  "current",
  "is-active",
  "nav-active",
];

function clearGetStartedState() {
  if (window.location.pathname !== "/") {
    return;
  }

  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      'header a[href="/get-started"], nav a[href="/get-started"], a[href="/get-started"]',
    ),
  );

  links.forEach((link) => {
    ACTIVE_CLASS_NAMES.forEach(
      (className) => {
        link.classList.remove(className);
      },
    );

    link.removeAttribute("aria-current");
    link.removeAttribute("data-active");
    link.removeAttribute("data-selected");
    link.removeAttribute("data-current");

    const wrapper = link.parentElement;

    if (wrapper) {
      ACTIVE_CLASS_NAMES.forEach(
        (className) => {
          wrapper.classList.remove(
            className,
          );
        },
      );

      wrapper.removeAttribute(
        "aria-current",
      );
      wrapper.removeAttribute(
        "data-active",
      );
      wrapper.removeAttribute(
        "data-selected",
      );
      wrapper.removeAttribute(
        "data-current",
      );
    }
  });
}

export function LandingNavigationState() {
  useEffect(() => {
    if (window.location.pathname !== "/") {
      return;
    }

    // Run once after mount, then once more shortly after hydration.
    clearGetStartedState();

    const timer = window.setTimeout(
      clearGetStartedState,
      250,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
