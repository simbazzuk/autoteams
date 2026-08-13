"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  ContextMode,
  ContextualProfile,
  contextLabel,
  loadActiveContextualProfileId,
  loadContextualProfiles,
  saveActiveContextualProfileId,
} from "@/lib/contextual-profiles";
import {
  AtlasQuestion,
  contextQuestions,
  coreQuestions,
  suggestedRoles,
} from "@/lib/atlas-question-packs";
import {
  AtlasAnswerMap,
  interviewProgress,
  loadContextInterview,
  loadCoreInterview,
  profileFreshness,
  saveCoreInterview,
  upsertContextInterview,
} from "@/lib/atlas-interview-state";
import { AtlasOrb } from "@/components/AtlasOrb";
import styles from "./ContextualAtlasInterview.module.css";

type InterviewStage = "core" | "context" | "complete";

export function ContextualAtlasInterview() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [activeId, setActiveId] = useState("");
  const [stage, setStage] = useState<InterviewStage>("core");
  const [index, setIndex] = useState(0);
  const [coreAnswers, setCoreAnswers] = useState<AtlasAnswerMap>({});
  const [coreCompletedAt, setCoreCompletedAt] = useState<string | null>(null);
  const [contextAnswers, setContextAnswers] = useState<AtlasAnswerMap>({});
  const [contextCompletedAt, setContextCompletedAt] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadedProfiles = loadContextualProfiles();
    const storedId = loadActiveContextualProfileId();
    const core = loadCoreInterview();

    const own = loadedProfiles.filter((item) =>
      isCurrentUserProfile(item, user?.displayName, user?.email),
    );

    const selectedId =
      own.find((item) => item.id === storedId)?.id ||
      own[0]?.id ||
      "";

    setProfiles(loadedProfiles);
    setActiveId(selectedId);
    setCoreAnswers(core.answers);
    setCoreCompletedAt(core.completedAt);

    if (selectedId) {
      const selected = loadedProfiles.find((item) => item.id === selectedId);

      if (selected) {
        const context = loadContextInterview(selected.id, selected.mode);
        setContextAnswers(context.answers);
        setContextCompletedAt(context.completedAt);
        setStage(context.completedAt ? "complete" : core.completedAt ? "context" : "core");
      }
    }
  }, [user?.displayName, user?.email]);

  const ownProfiles = useMemo(
    () =>
      profiles.filter((item) =>
        isCurrentUserProfile(item, user?.displayName, user?.email),
      ),
    [profiles, user?.displayName, user?.email],
  );

  const profile = useMemo(
    () => profiles.find((item) => item.id === activeId) || null,
    [activeId, profiles],
  );

  const questions = useMemo<AtlasQuestion[]>(
    () =>
      stage === "core"
        ? coreQuestions
        : profile
          ? contextQuestions[profile.mode]
          : [],
    [profile, stage],
  );

  const currentAnswers = stage === "core" ? coreAnswers : contextAnswers;
  const currentQuestion = questions[index];
  const currentAnswer = currentQuestion
    ? currentAnswers[currentQuestion.id] || ""
    : "";

  const coreProgress = interviewProgress(coreQuestions, coreAnswers);
  const contextProgress = profile
    ? interviewProgress(contextQuestions[profile.mode], contextAnswers)
    : 0;

  const freshness = profileFreshness(contextCompletedAt);

  function selectProfile(id: string) {
    const selected = profiles.find((item) => item.id === id);
    if (!selected) return;

    const context = loadContextInterview(selected.id, selected.mode);

    setActiveId(id);
    saveActiveContextualProfileId(id);
    setContextAnswers(context.answers);
    setContextCompletedAt(context.completedAt);
    setIndex(0);
    setStage(
      context.completedAt
        ? "complete"
        : coreCompletedAt
          ? "context"
          : "core",
    );
  }

  function updateAnswer(value: string) {
    if (!currentQuestion) return;

    if (stage === "core") {
      const updated = {
        ...coreAnswers,
        [currentQuestion.id]: value,
      };

      setCoreAnswers(updated);
      saveCoreInterview({
        answers: updated,
        completedAt: coreCompletedAt,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    if (!profile) return;

    const updated = {
      ...contextAnswers,
      [currentQuestion.id]: value,
    };

    setContextAnswers(updated);
    upsertContextInterview({
      profileId: profile.id,
      mode: profile.mode,
      answers: updated,
      completedAt: contextCompletedAt,
      updatedAt: new Date().toISOString(),
    });
  }

  function next() {
    if (!currentAnswer.trim()) return;

    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      return;
    }

    const completedAt = new Date().toISOString();

    if (stage === "core") {
      setCoreCompletedAt(completedAt);
      saveCoreInterview({
        answers: coreAnswers,
        completedAt,
        updatedAt: completedAt,
      });
      setStage("context");
      setIndex(0);
      return;
    }

    if (!profile) return;

    setContextCompletedAt(completedAt);
    upsertContextInterview({
      profileId: profile.id,
      mode: profile.mode,
      answers: contextAnswers,
      completedAt,
      updatedAt: completedAt,
    });
    setStage("complete");
  }

  function previous() {
    if (index > 0) {
      setIndex((value) => value - 1);
      return;
    }

    if (stage === "context" && !coreCompletedAt) {
      setStage("core");
      setIndex(coreQuestions.length - 1);
    }
  }

  function refreshContextInterview() {
    if (!profile) return;

    setContextCompletedAt(null);
    setStage("context");
    setIndex(0);

    upsertContextInterview({
      profileId: profile.id,
      mode: profile.mode,
      answers: contextAnswers,
      completedAt: null,
      updatedAt: new Date().toISOString(),
    });
  }

  if (!profile) {
    return (
      <section className={styles.empty}>
        <AtlasOrb size="lg" />
        <span className="eyebrow">My Atlas Profiles</span>
        <h2>No personal Atlas Profile is available yet.</h2>
        <p>
          Atlas does not display other workspace members on this page. Create
          your own Business, Friendship, Community, Sports or Education profile
          to begin the interview.
        </p>
        <div className="actions">
          
          <Link href="/get-started">
            Get Started
          </Link>
<Link className="button" href="/onboarding/profile">
            Create My Profile
          </Link>
          <Link className="button secondary" href="/people">
            Browse Workspace People
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <span className="eyebrow">Atlas Profiles</span>
        <h2>Choose a profile to complete or review.</h2>
        <p className={styles.sidebarIntro}>
          Only profiles belonging to your signed-in account appear here.
        </p>

        <div className={styles.personalNotice}>
          <strong>Your profiles only</strong>
          <p>
            Atlas only shows profiles belonging to the signed-in account.
            Workspace members are available from People and Team Builder.
          </p>
        </div>

        <div className={styles.profileList}>
          {ownProfiles.map((item) => {
            const context = loadContextInterview(item.id, item.mode);
            const progress = interviewProgress(
              contextQuestions[item.mode],
              context.answers,
            );

            return (
              <button
                className={item.id === activeId ? styles.activeProfile : ""}
                key={item.id}
                onClick={() => selectProfile(item.id)}
                type="button"
              >
                <ProfileIcon mode={item.mode} />

                <div>
                  <strong>{contextLabel(item.mode)}</strong>
                  <span>{statusLabel(progress, context.completedAt)}</span>
                </div>

                <em>{progress}%</em>
              </button>
            );
          })}
        </div>

        <Link className="button secondary" href="/onboarding/profile">
          Manage Profiles
        </Link>

        <div className={styles.progressCard}>
          <div>
            <span>General Atlas Profile</span>
            <strong>{coreProgress}%</strong>
          </div>
          <div className={styles.bar}>
            <i style={{ width: `${coreProgress}%` }} />
          </div>
          <small>
            {coreCompletedAt
              ? "Completed once and reused"
              : "Complete this once"}
          </small>
        </div>

        <div className={styles.progressCard}>
          <div>
            <span>{contextLabel(profile.mode)}</span>
            <strong>{contextProgress}%</strong>
          </div>
          <div className={styles.bar}>
            <i style={{ width: `${contextProgress}%` }} />
          </div>
          <small>Context-specific questions only</small>
        </div>
      </aside>

      <section className={styles.interview}>
        {stage !== "complete" ? (
          <>
            <header className={styles.stageBanner}>
              <div>
                <span className="eyebrow">
                  {stage === "core"
                    ? "General Atlas Profile — asked once"
                    : `${contextLabel(profile.mode)} — context questions`}
                </span>

                <h2>
                  {stage === "core"
                    ? "Build your reusable collaboration foundation."
                    : `Complete your ${capitalise(profile.mode)} Atlas Profile.`}
                </h2>

                <p>
                  {stage === "core"
                    ? "These answers are securely reused across your contextual profiles."
                    : contextDescription(profile.mode)}
                </p>
              </div>

              <AtlasOrb size="md" />
            </header>

            {stage === "context" && coreCompletedAt && (
              <div className={styles.reuseNote}>
                <span>✓</span>
                <div>
                  <strong>
                    Your general Atlas Profile is already complete.
                  </strong>
                  <p>
                    Atlas is only asking the {capitalise(profile.mode)}-specific
                    questions that remain.
                  </p>
                </div>
              </div>
            )}

            <section className={styles.question}>
              <header>
                <div>
                  <span>
                    {capitalise(profile.mode)} Profile
                  </span>
                  <strong>
                    Question {index + 1} of {questions.length}
                  </strong>
                </div>
                <div>
                  <small>Estimated time</small>
                  <em>{estimatedMinutes(questions.length - index)} min</em>
                </div>
              </header>

              <div className={styles.questionMeta}>
                <span>{currentQuestion?.category}</span>
              </div>

              <h3>{currentQuestion?.prompt}</h3>

              <textarea
                value={currentAnswer}
                onChange={(event) => updateAnswer(event.target.value)}
                placeholder="Describe what you naturally do and include an example where possible."
              />
            </section>

            <div className={styles.actions}>
              <button
                className="button secondary"
                disabled={index === 0}
                onClick={previous}
                type="button"
              >
                ← Previous
              </button>

              <button
                className="button"
                disabled={!currentAnswer.trim()}
                onClick={next}
                type="button"
              >
                {index === questions.length - 1
                  ? stage === "core"
                    ? "Save & Continue to Context →"
                    : "Complete Atlas Profile →"
                  : "Save & Continue →"}
              </button>
            </div>
          </>
        ) : (
          <section className={styles.complete}>
            <AtlasOrb size="xl" />
            <span className="eyebrow">
              {capitalise(profile.mode)} Atlas Profile complete
            </span>
            <h2>{contextLabel(profile.mode)} is ready.</h2>
            <p>
              Atlas reused your general collaboration profile and added only
              the answers relevant to this context.
            </p>

            <div className={styles.health}>
              <article>
                <small>Freshness</small>
                <strong>{freshness.label}</strong>
              </article>
              <article>
                <small>Confidence</small>
                <strong>{freshness.confidence}%</strong>
              </article>
              <article>
                <small>General profile</small>
                <strong>Reused</strong>
              </article>
            </div>

            <div className={styles.roles}>
              {suggestedRoles(profile.mode).map((role) => (
                <span key={role}>{role}</span>
              ))}
            </div>

            <div className="actions">
              <button
                className="button secondary"
                onClick={refreshContextInterview}
                type="button"
              >
                Refresh This Profile
              </button>
              <Link className="button secondary" href="/my-atlas-profile">
                View My Atlas Profile
              </Link>
              <Link className="button" href="/team-builder">
                Build Teams with Atlas →
              </Link>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

function ProfileIcon({ mode }: { mode: ContextMode }) {
  return (
    <span className={styles.profileIcon} aria-hidden="true">
      {modeSymbol(mode)}
    </span>
  );
}

function modeSymbol(mode: ContextMode): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}

function statusLabel(progress: number, completedAt: string | null): string {
  if (completedAt) return "Complete";
  if (progress > 0) return "In progress";
  return "Not started";
}

function contextDescription(mode: ContextMode): string {
  return {
    business:
      "These questions focus on how you contribute in professional and delivery environments.",
    friendship:
      "These questions focus on how you connect, plan and spend time in friendship groups.",
    community:
      "These questions focus on how you contribute to communities and volunteering.",
    sports:
      "These questions focus only on how you collaborate in sporting environments.",
    education:
      "These questions focus on how you learn, study and contribute to education groups.",
  }[mode];
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function estimatedMinutes(questionsRemaining: number): number {
  return Math.max(1, Math.ceil(questionsRemaining * 0.5));
}

function isCurrentUserProfile(
  profile: ContextualProfile,
  displayName?: string | null,
  email?: string | null,
): boolean {
  const profileName = normalise(profile.preferredName);
  const fullName = normalise(displayName);
  const emailName = normalise(email?.split("@")[0]);

  if (!profileName) return false;

  return (
    profileName === fullName ||
    profileName === emailName ||
    Boolean(fullName && profileName === fullName.split(" ")[0])
  );
}

function normalise(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}
