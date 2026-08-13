"use client";

import {
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  PASS_MARK,
  courseAssessments,
} from "@/lib/academy/course-assessments";
import styles from "./CourseAssessment.module.css";

const ASSESSMENT_KEY =
  "autoteams-academy-assessments-v72";

type AssessmentRecord = {
  score: number;
  passed: boolean;
  completedAt: string;
};

type AssessmentStore = Record<
  string,
  AssessmentRecord
>;

function readStore(): AssessmentStore {
  if (
    typeof window === "undefined"
  ) {
    return {};
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(
        ASSESSMENT_KEY,
      ) || "{}",
    );
  } catch {
    return {};
  }
}

export function CourseAssessment({
  courseSlug,
  courseTitle,
  enabled,
}: {
  courseSlug: string;
  courseTitle: string;
  enabled: boolean;
}) {
  const questions =
    courseAssessments[
      courseSlug
    ] || [];

  const [
    answers,
    setAnswers,
  ] = useState<
    Record<string, number>
  >({});

  const [
    result,
    setResult,
  ] = useState<
    AssessmentRecord | undefined
  >(() =>
    typeof window !== "undefined"
      ? readStore()[
          courseSlug
        ]
      : undefined,
  );

  const answered =
    Object.keys(
      answers,
    ).length;

  const ready =
    answered ===
    questions.length;

  const scoreNow =
    useMemo(() => {
      if (!questions.length) {
        return 0;
      }

      const correct =
        questions.filter(
          (question) =>
            answers[
              question.id
            ] ===
            question.correctIndex,
        ).length;

      return Math.round(
        (correct /
          questions.length) *
          100,
      );
    }, [
      answers,
      questions,
    ]);

  function submit() {
    if (
      !ready ||
      !enabled
    ) {
      return;
    }

    const record = {
      score: scoreNow,
      passed:
        scoreNow >=
        PASS_MARK,
      completedAt:
        new Date().toISOString(),
    };

    const store =
      readStore();

    store[courseSlug] =
      record;

    window.localStorage.setItem(
      ASSESSMENT_KEY,
      JSON.stringify(store),
    );

    setResult(record);
  }

  function retry() {
    setAnswers({});
    setResult(undefined);
  }

  if (
    !questions.length
  ) {
    return null;
  }

  return (
    <section
      className={
        styles.assessment
      }
    >
      <div
        className={
          styles.heading
        }
      >
        <div>
          <span>
            COURSE ASSESSMENT
          </span>
          <h2>
            Test your understanding.
          </h2>
          <p>
            Complete the knowledge
            check after finishing the
            course. A score of{" "}
            {PASS_MARK}% or higher
            earns course completion.
          </p>
        </div>

        <strong>
          {questions.length} questions
        </strong>
      </div>

      {!enabled && (
        <div
          className={
            styles.locked
          }
        >
          🔒 Complete all course
          modules to unlock the
          assessment.
        </div>
      )}

      {enabled &&
        !result && (
          <div
            className={
              styles.questions
            }
          >
            {questions.map(
              (
                question,
                index,
              ) => (
                <article
                  key={
                    question.id
                  }
                >
                  <small>
                    QUESTION{" "}
                    {index + 1}
                  </small>

                  <h3>
                    {
                      question.question
                    }
                  </h3>

                  <div
                    className={
                      styles.options
                    }
                  >
                    {question.options.map(
                      (
                        option,
                        optionIndex,
                      ) => {
                        const selected =
                          answers[
                            question.id
                          ] ===
                          optionIndex;

                        return (
                          <button
                            key={
                              option
                            }
                            type="button"
                            className={
                              selected
                                ? styles.selected
                                : ""
                            }
                            onClick={() =>
                              setAnswers(
                                (
                                  current,
                                ) => ({
                                  ...current,
                                  [question.id]:
                                    optionIndex,
                                }),
                              )
                            }
                          >
                            <span>
                              {String.fromCharCode(
                                65 +
                                  optionIndex,
                              )}
                            </span>
                            {
                              option
                            }
                          </button>
                        );
                      },
                    )}
                  </div>
                </article>
              ),
            )}

            <div
              className={
                styles.submit
              }
            >
              <span>
                {answered}/
                {questions.length}{" "}
                answered
              </span>

              <button
                type="button"
                disabled={
                  !ready
                }
                onClick={
                  submit
                }
              >
                Submit Assessment
              </button>
            </div>
          </div>
        )}

      {result && (
        <div
          className={
            result.passed
              ? styles.passed
              : styles.failed
          }
        >
          <span>
            {result.passed
              ? "✓ PASSED"
              : "REVIEW & RETRY"}
          </span>

          <strong>
            {result.score}%
          </strong>

          <h3>
            {result.passed
              ? `${courseTitle} complete`
              : "You are close — review the course and try again."}
          </h3>

          <p>
            {result.passed
              ? "You have completed the course modules and passed the knowledge assessment."
              : `A score of ${PASS_MARK}% is required to complete this course.`}
          </p>

          <div
            className={
              styles.resultActions
            }
          >
            {result.passed && (
              <Link
                href={`/academy/certificate/${courseSlug}`}
              >
                View Certificate →
              </Link>
            )}

            <button
              type="button"
              onClick={retry}
            >
              {result.passed
                ? "Retake Assessment"
                : "Try Again"}
            </button>
          </div>
        </div>
      )}

      <div
        className={
          styles.atlas
        }
      >
        <span>✦</span>
        <div>
          <strong>
            Need help before you
            answer?
          </strong>
          <p>
            Ask Atlas to explain a
            Team Science concept or
            give you another example.
            Atlas can help you learn,
            but it will not answer
            the assessment for you.
          </p>
        </div>
      </div>
    </section>
  );
}
