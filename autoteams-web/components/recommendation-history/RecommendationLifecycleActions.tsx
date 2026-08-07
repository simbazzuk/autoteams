"use client";

import {
  useState,
} from "react";
import {
  updateRecommendationDecision,
  type RecommendationStatus,
} from "@/lib/firebase/recommendation-management";
import styles from "./RecommendationLifecycleActions.module.css";

export function RecommendationLifecycleActions({
  recommendationId,
  status,
  onChanged,
}: {
  recommendationId: string;
  status: RecommendationStatus;
  onChanged: () => void;
}) {
  const [
    note,
    setNote,
  ] = useState("");

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function change(
    next:
      RecommendationStatus,
  ) {
    setBusy(true);
    setError("");

    try {
      await updateRecommendationDecision(
        recommendationId,
        {
          status:
            next,
          reviewerNote:
            note,
        },
      );

      setNote("");
      onChanged();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update recommendation.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <textarea
        value={note}
        onChange={(event) =>
          setNote(
            event.target.value,
          )
        }
        placeholder="Optional reviewer note"
        rows={2}
      />

      <div className={styles.actions}>
        {status === "draft" && (
          <button
            disabled={busy}
            onClick={() =>
              void change(
                "submitted",
              )
            }
            type="button"
          >
            Submit
          </button>
        )}

        {status === "submitted" && (
          <>
            <button
              disabled={busy}
              onClick={() =>
                void change(
                  "approved",
                )
              }
              type="button"
            >
              Approve
            </button>

            <button
              disabled={busy}
              onClick={() =>
                void change(
                  "rejected",
                )
              }
              type="button"
            >
              Reject
            </button>
          </>
        )}

        {status === "rejected" && (
          <button
            disabled={busy}
            onClick={() =>
              void change(
                "submitted",
              )
            }
            type="button"
          >
            Resubmit
          </button>
        )}

        {status !== "archived" && (
          <button
            disabled={busy}
            onClick={() =>
              void change(
                "archived",
              )
            }
            type="button"
          >
            Archive
          </button>
        )}
      </div>

      {error && (
        <p
          className={styles.error}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
