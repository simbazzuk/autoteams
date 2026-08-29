"use client";

import Link from "next/link";
import { SectionOrbIcon } from "@/components/home/SectionOrbIcon";

const secondaryCourses = [
  {
    icon: "👥",
    title: "Building Teams",
    text: "Understand balance, roles and how people combine around a shared goal.",
  },
  {
    icon: "🤖",
    title: "Explainable AI",
    text: "Learn how Atlas supports recommendations while keeping people in control.",
  },
  {
    icon: "📈",
    title: "Team Health",
    text: "Explore the signals that help teams understand and improve how they work.",
  },
];

export function HomeAcademyFeature() {
  return (
    <section
      className="home-academy-feature-v71571424"
      data-autoteams-home-academy-structural-v71571424="true"
      aria-labelledby="home-academy-title-v71571424"
    >
      <div className="container home-academy-feature-v71571424__layout">
        <div className="home-academy-feature-v71571424__intro">
          {/* AUTOTEAMS_V71571428_ACADEMY_ORB */}
          <div className="home-academy-feature-v71571428__orb-wrap">
            <SectionOrbIcon
              symbol="🧠"
              ariaLabel="Team Science Academy"
              variant="academy"
            />
          </div>
          <span className="home-academy-feature-v71571424__eyebrow">
            Team Science Academy
          </span>

          <h2 id="home-academy-title-v71571424">
            Learn why better teams work.
          </h2>

          <p>
            Explore Team Science foundations, building balanced teams,
            explainable AI and team health. Learn the principles Atlas uses to
            support every explainable recommendation.
          </p>

          <Link
            href="/academy"
            className="home-academy-feature-v71571424__cta"
          >
            Explore Academy
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="home-academy-feature-v71571424__courses">
          <article className="home-academy-feature-v71571424__featured">
            <div className="home-academy-feature-v71571424__featured-top">
              <span className="home-academy-feature-v71571424__featured-icon" aria-hidden="true">
                🧠
              </span>
              <span className="home-academy-feature-v71571424__status">
                Available now
              </span>
            </div>

            <div>
              <small>BEGINNER · 7 MODULES · 45 MINS</small>
              <h3>Team Science Foundations</h3>
              <p>
                Start with the principles behind effective teams, human
                decision-making and explainable recommendations.
              </p>
            </div>

            <div className="home-academy-feature-v71571424__progress-row">
              <div>
                <span>Course progress</span>
                <strong>0%</strong>
              </div>
              <div className="home-academy-feature-v71571424__progress">
                <i />
              </div>
            </div>

            <Link href="/academy" className="home-academy-feature-v71571424__start">
              Start learning
              <span aria-hidden="true">→</span>
            </Link>
          </article>

          <div className="home-academy-feature-v71571424__secondary">
            {secondaryCourses.map((course) => (
              <article key={course.title}>
                <span className="home-academy-feature-v71571424__secondary-icon" aria-hidden="true">
                  {course.icon}
                </span>
                <div>
                  <h3>{course.title}</h3>
                  <p>{course.text}</p>
                </div>
                <Link href="/academy" aria-label={`Explore ${course.title}`}>
                  Explore
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
