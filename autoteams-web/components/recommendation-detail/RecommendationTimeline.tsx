"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildGeneratedEvent,
  listRecommendationEvents,
  type RecommendationEventRecord,
} from "@/lib/firebase/recommendation-events";
import type {
  RecommendationHistoryRecord,
} from "@/lib/firebase/recommendation-persistence";
import styles from "./RecommendationTimeline.module.css";

export function RecommendationTimeline({
  recommendation,
  refreshKey = 0,
}: {
  recommendation: RecommendationHistoryRecord;
  refreshKey?: number;
}) {
  const [events, setEvents] =
    useState<RecommendationEventRecord[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    void load();
  }, [
    recommendation.id,
    refreshKey,
  ]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      setEvents(
        await listRecommendationEvents(
          recommendation.id,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load audit history.",
      );
    } finally {
      setLoading(false);
    }
  }

  const timeline =
    useMemo(
      () =>
        [
          buildGeneratedEvent(
            recommendation,
          ),
          ...events,
        ].sort(
          (a, b) =>
            Date.parse(
              a.createdAtIso,
            ) -
            Date.parse(
              b.createdAtIso,
            ),
        ),
      [
        recommendation,
        events,
      ],
    );

  return (
    <section className={styles.card}>
      <div className={styles.heading}>
        <div>
          <span className="eyebrow">
            Audit trail
          </span>
          <h2>
            Decision timeline
          </h2>
          <p>
            A chronological record of how this
            recommendation moved from generation
            through review and final decision.
          </p>
        </div>

        <span className={styles.count}>
          {timeline.length} event
          {timeline.length === 1
            ? ""
            : "s"}
        </span>
      </div>

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          Loading audit history…
        </div>
      ) : (
        <div className={styles.timeline}>
          {timeline.map(
            (event, index) => (
              <TimelineItem
                key={event.id}
                event={event}
                first={
                  index === 0
                }
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

function TimelineItem({
  event,
  first,
}: {
  event: RecommendationEventRecord;
  first: boolean;
}) {
  const actor =
    event.actorDisplayName ||
    event.actorEmail ||
    (event.type === "generated"
      ? "Recommendation engine"
      : "Workspace member");

  return (
    <article className={styles.item}>
      <div className={styles.rail}>
        <span
          data-type={
            event.type
          }
        >
          {symbolFor(
            event.type,
          )}
        </span>
        {!first && <i />}
      </div>

      <div className={styles.content}>
        <header>
          <div>
            <strong>
              {titleFor(
                event.type,
              )}
            </strong>
            <small>
              {actor}
            </small>
          </div>

          <time>
            {new Date(
              event.createdAtIso,
            ).toLocaleString()}
          </time>
        </header>

        {event.fromStatus && (
          <p className={styles.transition}>
            <span>
              {event.fromStatus}
            </span>
            →
            <span>
              {event.toStatus}
            </span>
          </p>
        )}

        {event.note && (
          <blockquote>
            {event.note}
          </blockquote>
        )}
      </div>
    </article>
  );
}

function titleFor(
  type: RecommendationEventRecord["type"],
): string {
  switch (type) {
    case "generated":
      return "Recommendation generated";
    case "submitted":
      return "Submitted for review";
    case "approved":
      return "Recommendation approved";
    case "rejected":
      return "Recommendation rejected";
    case "resubmitted":
      return "Recommendation resubmitted";
    case "archived":
      return "Recommendation archived";
  }
}

function symbolFor(
  type: RecommendationEventRecord["type"],
): string {
  switch (type) {
    case "generated":
      return "AI";
    case "submitted":
      return "→";
    case "approved":
      return "✓";
    case "rejected":
      return "×";
    case "resubmitted":
      return "↻";
    case "archived":
      return "□";
  }
}
