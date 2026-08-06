"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ContextualProfile,
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
  loadCoreInterview,
  saveCoreInterview,
  loadContextInterview,
  upsertContextInterview,
  interviewProgress,
  profileFreshness,
} from "@/lib/atlas-interview-state";
import { AtlasOrb } from "@/components/AtlasOrb";

type InterviewStage = "core" | "context" | "complete";

export function ContextualAtlasInterview() {
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
    const selectedId =
      loadedProfiles.find((item) => item.id === storedId)?.id ||
      loadedProfiles[0]?.id ||
      "";

    const core = loadCoreInterview();

    setProfiles(loadedProfiles);
    setActiveId(selectedId);
    setCoreAnswers(core.answers);
    setCoreCompletedAt(core.completedAt);

    if (selectedId) {
      const profile = loadedProfiles.find((item) => item.id === selectedId);
      if (profile) {
        const context = loadContextInterview(profile.id, profile.mode);
        setContextAnswers(context.answers);
        setContextCompletedAt(context.completedAt);
        setStage(core.completedAt ? "context" : "core");
      }
    }
  }, []);

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
    setStage(coreCompletedAt ? "context" : "core");
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
      <div className="atlas125-empty">
        <AtlasOrb size="lg" />
        <h2>Create a contextual profile first.</h2>
        <p>
          Atlas needs to know whether this is a business, friendship, community,
          sports or education context.
        </p>
        <Link className="button" href="/onboarding/profile">
          Create Contextual Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="atlas126-layout">
      <aside className="atlas126-sidebar">
        <span className="eyebrow">Interview context</span>
        <h2>Choose your Team DNA profile.</h2>

        <div className="atlas126-profile-list">
          {profiles.map((item) => {
            const context = loadContextInterview(item.id, item.mode);
            const itemFreshness = profileFreshness(context.completedAt);

            return (
              <button
                className={item.id === activeId ? "active" : ""}
                key={item.id}
                onClick={() => selectProfile(item.id)}
                type="button"
              >
                <span>{modeIcon(item.mode)}</span>
                <div>
                  <strong>{item.label}</strong>
                  <small>{itemFreshness.label}</small>
                </div>
                <em>{itemFreshness.confidence}%</em>
              </button>
            );
          })}
        </div>

        <Link className="button secondary" href="/onboarding/profile">
          Manage Profiles
        </Link>

        <div className="atlas126-progress-card">
          <div>
            <span>Core Team DNA</span>
            <strong>{coreProgress}%</strong>
          </div>
          <div className="bar"><i style={{ width: `${coreProgress}%` }} /></div>
          <small>
            {coreCompletedAt ? "Completed once and reused" : "Complete once"}
          </small>
        </div>

        <div className="atlas126-progress-card">
          <div>
            <span>{profile.label}</span>
            <strong>{contextProgress}%</strong>
          </div>
          <div className="bar"><i style={{ width: `${contextProgress}%` }} /></div>
          <small>Context-specific questions only</small>
        </div>
      </aside>

      <section className="atlas126-interview">
        {stage !== "complete" ? (
          <>
            <div className="atlas126-stage-banner">
              <div>
                <span className="eyebrow">
                  {stage === "core"
                    ? "Core interview — asked once"
                    : `${profile.label} — context questions`}
                </span>
                <h2>
                  {stage === "core"
                    ? "Build your reusable collaboration foundation."
                    : `Add the ${profile.mode} context.`}
                </h2>
                <p>
                  {stage === "core"
                    ? "These answers are shared across all contextual profiles."
                    : "These answers remain separate and are used only for this profile."}
                </p>
              </div>
              <AtlasOrb size="md" />
            </div>

            {stage === "context" && coreCompletedAt && (
              <div className="atlas126-reuse-note">
                <span>✓</span>
                <div>
                  <strong>Core Team DNA reused</strong>
                  <p>
                    Atlas is not asking the general collaboration questions
                    again.
                  </p>
                </div>
              </div>
            )}

            <div className="atlas126-question">
              <span>
                Question {index + 1} of {questions.length}
              </span>
              <em>{currentQuestion?.category}</em>
              <h3>{currentQuestion?.prompt}</h3>
              <textarea
                value={currentAnswer}
                onChange={(event) => updateAnswer(event.target.value)}
                placeholder="Describe what you naturally do and give an example where possible."
              />
            </div>

            <div className="atlas126-actions">
              <button
                className="button secondary"
                disabled={index === 0}
                onClick={previous}
                type="button"
              >
                Previous
              </button>
              <button
                className="button"
                disabled={!currentAnswer.trim()}
                onClick={next}
                type="button"
              >
                {index === questions.length - 1
                  ? stage === "core"
                    ? "Continue to Context Questions"
                    : "Complete Profile Interview"
                  : "Next Question"}
              </button>
            </div>
          </>
        ) : (
          <div className="atlas126-complete">
            <AtlasOrb size="xl" />
            <span className="eyebrow">Contextual Team DNA complete</span>
            <h2>{profile.label} is ready.</h2>
            <p>
              Atlas reused your core Team DNA and added only the questions
              relevant to this profile.
            </p>

            <div className="atlas126-health">
              <article>
                <small>Freshness</small>
                <strong>{freshness.label}</strong>
              </article>
              <article>
                <small>Confidence</small>
                <strong>{freshness.confidence}%</strong>
              </article>
              <article>
                <small>Core interview</small>
                <strong>Reused</strong>
              </article>
            </div>

            <div className="atlas125-role-grid">
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
              <Link className="button" href="/team-dna">
                View Team DNA
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function modeIcon(mode: ContextualProfile["mode"]): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}
