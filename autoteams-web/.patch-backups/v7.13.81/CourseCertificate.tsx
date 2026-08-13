"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import type {
  AcademyCourse,
} from "@/lib/academy/course-catalogue";
import {
  PASS_MARK,
} from "@/lib/academy/course-assessments";
import styles from "./CourseCertificate.module.css";

const ASSESSMENT_KEY =
  "autoteams-academy-assessments-v72";

type RecordValue = {
  score: number;
  passed: boolean;
  completedAt: string;
};

export function CourseCertificate({
  course,
}: {
  course: AcademyCourse;
}) {
  const [
    record,
    setRecord,
  ] = useState<
    RecordValue | undefined
  >();

  useEffect(() => {
    try {
      const store =
        JSON.parse(
          window.localStorage.getItem(
            ASSESSMENT_KEY,
          ) || "{}",
        );

      setRecord(
        store[
          course.slug
        ],
      );
    } catch {
      setRecord(undefined);
    }
  }, [course.slug]);

  if (
    !record?.passed ||
    record.score <
      PASS_MARK
  ) {
    return (
      <main
        className={
          styles.lockedPage
        }
      >
        <section>
          <span>🔒</span>
          <h1>
            Certificate not yet
            available.
          </h1>
          <p>
            Complete every course
            module and pass the final
            assessment to unlock your
            certificate.
          </p>
          <Link
            href={`/academy/course/${course.slug}`}
          >
            Return to Course →
          </Link>
        </section>
      </main>
    );
  }

  const date =
    new Date(
      record.completedAt,
    ).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    );

  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.toolbar
        }
      >
        <Link href="/academy">
          ← Academy
        </Link>

        <button
          type="button"
          onClick={() =>
            window.print()
          }
        >
          Print / Save as PDF
        </button>
      </div>

      <section
        className={
          styles.certificate
        }
      >
        <div
          className={
            styles.brand
          }
        >
          <span>✦</span>
          <strong>
            AutoTeams
          </strong>
        </div>

        <small>
          TEAM SCIENCE ACADEMY
        </small>

        <h1>
          Certificate of
          Completion
        </h1>

        <p>
          This certifies successful
          completion of
        </p>

        <h2>
          {course.title}
        </h2>

        <div
          className={
            styles.rule
          }
        />

        <div
          className={
            styles.details
          }
        >
          <div>
            <span>
              Assessment Score
            </span>
            <strong>
              {record.score}%
            </strong>
          </div>

          <div>
            <span>
              Completed
            </span>
            <strong>
              {date}
            </strong>
          </div>

          <div>
            <span>
              Level
            </span>
            <strong>
              {course.level}
            </strong>
          </div>
        </div>

        <footer>
          <strong>
            Team Science Academy
          </strong>
          <span>
            AI recommends. Humans
            decide.
          </span>
        </footer>
      </section>
    </main>
  );
}
