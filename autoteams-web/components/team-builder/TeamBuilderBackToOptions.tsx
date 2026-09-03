"use client";

import { useEffect, useState } from "react";

const BUILD_ROUTE_KEY =
  "autoteams-build-route-v71511";

const ACTIVE_HYBRID_TEAM_KEY =
  "autoteams-active-hybrid-team-v715121";

const SELECTED_FLOW_KEY =
  "autoteams-team-builder-selected-flow-v71571325";

type SelectedFlow =
  | "people"
  | "hybrid"
  | "";

export function TeamBuilderBackToOptions() {
  const [selectedFlow, setSelectedFlow] =
    useState<SelectedFlow>("");

  useEffect(() => {
    function refreshSelectedFlow() {
      try {
        const value =
          sessionStorage.getItem(
            SELECTED_FLOW_KEY,
          );

        setSelectedFlow(
          value === "people" ||
            value === "hybrid"
            ? value
            : "",
        );
      } catch {
        setSelectedFlow("");
      }
    }

    refreshSelectedFlow();

    // The Option 1 / Option 3 click changes the Team Builder DOM immediately.
    // Re-read the explicit session flag when that transition occurs.
    const observer =
      new MutationObserver(
        refreshSelectedFlow,
      );

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "hidden",
      ],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initial chooser has no explicit click flag, so this cannot render.
  if (!selectedFlow) {
    return null;
  }

  function backToOptions() {
    try {
      sessionStorage.removeItem(
        SELECTED_FLOW_KEY,
      );

      localStorage.removeItem(
        BUILD_ROUTE_KEY,
      );

      if (selectedFlow === "hybrid") {
        localStorage.removeItem(
          ACTIVE_HYBRID_TEAM_KEY,
        );
      }
    } catch {
      // Explicit navigation still works without browser storage.
    }

    window.location.assign(
      "/team-builder",
    );
  }

  return (
    <div
      data-team-builder-back-options="v7.15.7.15.13.2.5"
      style={{
        width:
          "min(1180px, calc(100% - 32px))",
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
          border:
            "1px solid rgba(129, 140, 248, 0.55)",
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
          event.currentTarget.style.transform =
            "translateY(-1px)";
          event.currentTarget.style.filter =
            "brightness(1.05)";
          event.currentTarget.style.boxShadow =
            "0 10px 28px rgba(79, 70, 229, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.18)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform =
            "translateY(0)";
          event.currentTarget.style.filter =
            "brightness(1)";
          event.currentTarget.style.boxShadow =
            "0 8px 24px rgba(79, 70, 229, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.16)";
        }}
      >
        <span aria-hidden="true">←</span>
        <span>
          Back to Build Team options
        </span>
      </button>
    </div>
  );
}
