"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./TeamSaveFeedback.module.css";

type FeedbackState =
  | {
      kind: "idle";
      message: "";
    }
  | {
      kind: "saving";
      message: string;
    }
  | {
      kind: "success";
      message: string;
    }
  | {
      kind: "error";
      message: string;
    };

const INITIAL_STATE: FeedbackState = {
  kind: "idle",
  message: "",
};

function findSaveControl(
  target: EventTarget | null,
) {
  if (
    !(target instanceof Element)
  ) {
    return null;
  }

  const control =
    target.closest(
      "button, a, [role='button']",
    );

  if (
    !(control instanceof HTMLElement)
  ) {
    return null;
  }

  const label =
    control.textContent
      ?.replace(/\s+/g, " ")
      .trim()
      .toLowerCase() ??
    "";

  if (
    label === "save team" ||
    label.startsWith("save team ")
  ) {
    return control;
  }

  return null;
}

export function TeamSaveFeedback() {
  const [
    feedback,
    setFeedback,
  ] =
    useState<FeedbackState>(
      INITIAL_STATE,
    );

  const activeControl =
    useRef<HTMLElement | null>(
      null,
    );

  const originalLabel =
    useRef("");

  const restoreTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  useEffect(() => {
    function clearTimer() {
      if (
        restoreTimer.current
      ) {
        clearTimeout(
          restoreTimer.current,
        );

        restoreTimer.current =
          null;
      }
    }

    function restoreButton(
      delay = 0,
    ) {
      clearTimer();

      restoreTimer.current =
        setTimeout(() => {
          const control =
            activeControl.current;

          if (control) {
            if (
              originalLabel.current
            ) {
              control.textContent =
                originalLabel.current;
            }

            if (
              control instanceof
              HTMLButtonElement
            ) {
              control.disabled =
                false;
            }

            control.removeAttribute(
              "aria-busy",
            );
          }

          activeControl.current =
            null;

          originalLabel.current =
            "";

          setFeedback(
            INITIAL_STATE,
          );
        }, delay);
    }

    function onClick(
      event: MouseEvent,
    ) {
      const control =
        findSaveControl(
          event.target,
        );

      if (!control) {
        return;
      }

      clearTimer();

      activeControl.current =
        control;

      originalLabel.current =
        control.textContent
          ?.replace(
            /\s+/g,
            " ",
          )
          .trim() ??
        "Save Team";

      control.textContent =
        "Saving…";

      control.setAttribute(
        "aria-busy",
        "true",
      );

      if (
        control instanceof
        HTMLButtonElement
      ) {
        /*
         * Do not disable until the click has already been delivered.
         * A microtask keeps the existing Team Builder onClick behaviour intact.
         */
        queueMicrotask(() => {
          if (
            activeControl.current ===
            control
          ) {
            control.disabled =
              true;
          }
        });
      }

      setFeedback({
        kind: "saving",
        message:
          "Saving your team to TeamScience.ai…",
      });

      /*
       * Safety timeout: if no persistence event arrives, don't leave the
       * button disabled forever.
       */
      restoreTimer.current =
        setTimeout(() => {
          if (
            activeControl.current
          ) {
            if (
              activeControl.current
                .textContent ===
              "Saving…"
            ) {
              activeControl.current
                .textContent =
                originalLabel.current ||
                "Save Team";
            }

            if (
              activeControl.current
                instanceof
              HTMLButtonElement
            ) {
              activeControl.current
                .disabled =
                false;
            }

            activeControl.current
              .removeAttribute(
                "aria-busy",
              );
          }

          setFeedback(
            INITIAL_STATE,
          );
        }, 12000);
    }

    function onSaved(
      event: Event,
    ) {
      if (
        !activeControl.current
      ) {
        /*
         * Ignore background migration/resync events. Feedback should only
         * appear after an explicit Save Team click.
         */
        return;
      }

      clearTimer();

      const custom =
        event as
          CustomEvent<{
            teamId?: string;
            name?: string;
          }>;

      activeControl.current
        .textContent =
        "✓ Saved";

      activeControl.current
        .removeAttribute(
          "aria-busy",
        );

      if (
        activeControl.current
          instanceof
        HTMLButtonElement
      ) {
        activeControl.current
          .disabled =
          false;
      }

      setFeedback({
        kind: "success",
        message:
          custom.detail?.name
            ? `${custom.detail.name} saved successfully. It is now available in My Teams and Team Insights.`
            : "Team saved successfully. It is now available in My Teams and Team Insights.",
      });

      restoreButton(
        3200,
      );
    }

    function onSaveFailed(
      event: Event,
    ) {
      if (
        !activeControl.current
      ) {
        return;
      }

      clearTimer();

      const custom =
        event as
          CustomEvent<{
            message?: string;
          }>;

      activeControl.current
        .textContent =
        "Save failed";

      activeControl.current
        .removeAttribute(
          "aria-busy",
        );

      if (
        activeControl.current
          instanceof
        HTMLButtonElement
      ) {
        activeControl.current
          .disabled =
          false;
      }

      setFeedback({
        kind: "error",
        message:
          custom.detail?.message ??
          "Couldn’t save this team. Please try again.",
      });

      restoreButton(
        4500,
      );
    }

    document.addEventListener(
      "click",
      onClick,
    );

    window.addEventListener(
      "autoteams:firebase-team-persisted",
      onSaved,
    );

    window.addEventListener(
      "autoteams:firebase-team-persist-failed",
      onSaveFailed,
    );

    return () => {
      clearTimer();

      document.removeEventListener(
        "click",
        onClick,
      );

      window.removeEventListener(
        "autoteams:firebase-team-persisted",
        onSaved,
      );

      window.removeEventListener(
        "autoteams:firebase-team-persist-failed",
        onSaveFailed,
      );
    };
  }, []);

  if (
    feedback.kind ===
    "idle"
  ) {
    return null;
  }

  return (
    <div
      className={`${styles.toast} ${styles[feedback.kind]}`}
      role={
        feedback.kind ===
        "error"
          ? "alert"
          : "status"
      }
      aria-live="polite"
      data-autoteams-team-save-feedback="v7.13.5"
    >
      <span
        className={styles.icon}
      >
        {feedback.kind ===
        "saving"
          ? "↻"
          : feedback.kind ===
              "success"
            ? "✓"
            : "!"}
      </span>

      <div>
        <strong>
          {feedback.kind ===
          "saving"
            ? "Saving team"
            : feedback.kind ===
                "success"
              ? "Team saved"
              : "Couldn’t save team"}
        </strong>

        <p>
          {feedback.message}
        </p>
      </div>
    </div>
  );
}
