"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  RecommendationDetail,
} from "@/components/recommendation-detail/RecommendationDetail";

export function RecommendationDetailRoute() {
  const [
    recommendationId,
    setRecommendationId,
  ] = useState("");

  const [
    mounted,
    setMounted,
  ] = useState(false);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    setRecommendationId(
      params.get("id") || "",
    );

    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section
        style={{
          padding: 24,
          color: "#8f9bb0",
          background: "#171e2d",
          border: "1px solid #2a3448",
          borderRadius: 18,
        }}
      >
        Loading recommendation…
      </section>
    );
  }

  if (!recommendationId) {
    return (
      <section
        style={{
          padding: 24,
          color: "#e2b267",
          background: "#171e2d",
          border: "1px solid #2a3448",
          borderRadius: 18,
        }}
      >
        No recommendation id was supplied.
      </section>
    );
  }

  return (
    <RecommendationDetail
      recommendationId={
        recommendationId
      }
    />
  );
}
