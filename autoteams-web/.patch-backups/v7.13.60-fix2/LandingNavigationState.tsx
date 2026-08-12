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
    ACTIVE_CLASS_NAMES.forEach((className) => {
      link.classList.remove(className);
    });

    link.removeAttribute("aria-current");
    link.removeAttribute("data-active");
    link.removeAttribute("data-selected");
    link.removeAttribute("data-current");

    // Some navigation components put the active state on a wrapper.
    const wrapper = link.parentElement;

    if (wrapper) {
      ACTIVE_CLASS_NAMES.forEach((className) => {
        wrapper.classList.remove(className);
      });

      wrapper.removeAttribute("aria-current");
      wrapper.removeAttribute("data-active");
      wrapper.removeAttribute("data-selected");
      wrapper.removeAttribute("data-current");
    }
  });

  document.documentElement.dataset.autoteamsLandingRoute =
    "true";
}

export function LandingNavigationState() {
  useEffect(() => {
    clearGetStartedState();

    const observer = new MutationObserver(() => {
      clearGetStartedState();
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: [
        "class",
        "aria-current",
        "data-active",
        "data-selected",
        "data-current",
      ],
    });

    return () => {
      observer.disconnect();

      delete document.documentElement.dataset
        .autoteamsLandingRoute;
    };
  }, []);

  return null;
}
