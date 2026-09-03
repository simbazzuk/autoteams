"use client";

import { useEffect, useState } from "react";

const BUILD_ROUTE_KEY = "autoteams-build-route-v71511";
const ACTIVE_HYBRID_TEAM_KEY = "autoteams-active-hybrid-team-v715121";

type BuildRoute = "people" | "opportunity" | "hybrid" | "";

function elementIsVisible(element: Element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.getClientRects().length > 0
  );
}

function buildOptionsAreVisible() {
  const candidates = Array.from(
    document.querySelectorAll("button, a"),
  );

  const hasPeopleOption = candidates.some((element) => {
    const text = (element.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    return (
      elementIsVisible(element) &&
      text.includes("start with my people")
    );
  });

  const hasHybridOption = candidates.some((element) => {
    const text = (element.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    return (
      elementIsVisible(element) &&
      text.includes("start team") &&
      text.includes("recruit gaps")
    );
  });

  return hasPeopleOption && hasHybridOption;
}

export function TeamBuilderBackToOptions() {
  const [route, setRoute] = useState<BuildRoute>("");
  const [optionsVisible, setOptionsVisible] = useState(true);

  useEffect(() => {
    function refreshState() {
      try {
        const current = localStorage.getItem(
          BUILD_ROUTE_KEY,
        ) as BuildRoute | null;

        setRoute(current ?? "");
      } catch {
        setRoute("");
      }

      setOptionsVisible(buildOptionsAreVisible());
    }

    refreshState();

    // The option chooser and selected builder are rendered dynamically.
    // Observe DOM changes so the back control appears/disappears immediately
    // as the user moves between the chooser and Option 1 / Option 3.
    const observer = new MutationObserver(refreshState);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden"],
    });

    window.addEventListener("storage", refreshState);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", refreshState);
    };
  }, []);

  // Never show this control on the three-option chooser itself.
  if (optionsVisible) {
    return null;
  }

  // Only Option 1 (people) and Option 3 (hybrid) need this control.
  if (route !== "people" && route !== "hybrid") {
    return null;
  }

  function backToOptions() {
    try {
      localStorage.removeItem(BUILD_ROUTE_KEY);

      if (route === "hybrid") {
        localStorage.removeItem(ACTIVE_HYBRID_TEAM_KEY);
      }
    } catch {
      // Explicit navigation below still works without storage.
    }

    window.location.assign("/team-builder");
  }

  return (
    <div
      data-team-builder-back-options="v7.15.7.15.13.2.1"
      style={{
        width: "min(1180px, calc(100% - 32px))",
        margin: "18px auto 4px",
      }}
    >
      <button
        type="button"
        onClick={backToOptions}
        aria-label="Back to Build Team options"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "9px",
          minHeight: "44px",
          padding: "11px 18px",
          borderRadius: "12px",
          border: "1px solid rgba(129, 140, 248, 0.55)",
          background:
            "linear-gradient(135deg, #6d4aff 0%, #5569f5 52%, #3b82f6 100%)",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 800,
          letterSpacing: "-0.01em",
          cursor: "pointer",
          boxShadow:
            "0 8px 24px rgba(79, 70, 229, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.16)",
          transition:
            "transform 160ms ease, box-shadow 160ms ease, filter 160ms ease",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform = "translateY(-1px)";
          event.currentTarget.style.filter = "brightness(1.05)";
          event.currentTarget.style.boxShadow =
            "0 10px 28px rgba(79, 70, 229, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.18)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = "translateY(0)";
          event.currentTarget.style.filter = "brightness(1)";
          event.currentTarget.style.boxShadow =
            "0 8px 24px rgba(79, 70, 229, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.16)";
        }}
      >
        <span aria-hidden="true">←</span>
        <span>Back to Build Team options</span>
      </button>
    </div>
  );
}

