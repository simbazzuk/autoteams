"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ProfileAnalysis } from "@/lib/team-intelligence";
import { TeamDnaChart } from "@/components/intelligence/TeamDnaChart";
import { AtlasOrb } from "@/components/AtlasOrb";

type SavedConversation = {
  id: string;
  title: string;
  teamType: string;
  answers: string[];
  createdAt: string;
};

const STORAGE_KEY = "autoteams-atlas-conversations";

const questions = [
  "What kind of team are you hoping to join or build?",
  "What brings out your best contribution?",
  "What makes someone a great teammate for you?",
  "What tends to frustrate you in a group?",
  "Describe the best team experience you have had.",
];

function loadConversations(): SavedConversation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(items: SavedConversation[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function AtlasInterview() {
  const [teamType, setTeamType] = useState("Business");
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<SavedConversation[]>([]);

  useEffect(() => {
    setSaved(loadConversations());
  }, []);

  const complete = current >= questions.length;

  const narrative = useMemo(
    () =>
      answers
        .map((answer, index) => `${questions[index]} Answer: ${answer}`)
        .join("\n\n"),
    [answers],
  );

  function submitAnswer() {
    if (draft.trim().length < 5) return;

    setAnswers((items) => [...items, draft.trim()]);
    setDraft("");
    setCurrent((value) => value + 1);
  }

  async function createDna() {
    setWorking(true);
    setError("");

    try {
      const response = await fetch("/api/analyse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrative, teamType }),
      });

      const result = (await response.json()) as {
        analysis?: ProfileAnalysis;
        error?: string;
      };

      if (!response.ok || !result.analysis) {
        throw new Error(result.error || "Unable to create Team DNA.");
      }

      setAnalysis(result.analysis);

      const conversation: SavedConversation = {
        id: `${Date.now()}`,
        title: `${teamType} Team DNA interview`,
        teamType,
        answers,
        createdAt: new Date().toISOString(),
      };

      const updated = [conversation, ...saved].slice(0, 8);
      setSaved(updated);
      saveConversations(updated);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Atlas failed.");
    } finally {
      setWorking(false);
    }
  }

  function startNew() {
    setCurrent(0);
    setDraft("");
    setAnswers([]);
    setAnalysis(null);
    setError("");
  }

  function openConversation(conversation: SavedConversation) {
    setTeamType(conversation.teamType);
    setAnswers(conversation.answers);
    setCurrent(conversation.answers.length);
    setAnalysis(null);
    setError("");
  }

  return (
    <div className="atlas-workspace">
      <aside className="atlas-history-panel">
        <button className="button atlas-new-chat" onClick={startNew} type="button">
          ＋ New conversation
        </button>

        <span className="sidebar-title">RECENT CONVERSATIONS</span>

        <div className="atlas-history-list">
          {saved.length === 0 ? (
            <p>No saved conversations yet.</p>
          ) : (
            saved.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => openConversation(conversation)}
                type="button"
              >
                <AtlasOrb size="sm" />
                <span>
                  <strong>{conversation.title}</strong>
                  <small>
                    {new Date(conversation.createdAt).toLocaleDateString("en-GB")}
                  </small>
                </span>
              </button>
            ))
          )}
        </div>

        <div className="atlas-privacy-note">
          <span>◇</span>
          <p>
            <strong>Privacy reminder</strong>
            Atlas should not infer sensitive characteristics or replace a
            professional assessment.
          </p>
        </div>
      </aside>

      <section className="atlas-chat-panel">
        <div className="atlas-chat-header">
          <AtlasOrb size="md" state={working ? "thinking" : analysis ? "complete" : "idle"} />
          <div>
            <strong>Atlas</strong>
            <small>Your AI Team Strategist</small>
          </div>
          <span className="badge">Gemini live</span>
        </div>

        <div className="atlas-progress">
          <span
            style={{
              width: `${Math.min(100, (current / questions.length) * 100)}%`,
            }}
          />
        </div>

        <div className="atlas-conversation">
          <div className="atlas-message assistant">
            Hi, I&apos;m Atlas. I&apos;ll ask five focused questions, create an
            explainable Team DNA profile and save the conversation for later
            review.
          </div>

          {answers.map((answer, index) => (
            <div className="atlas-thread" key={index}>
              <div className="atlas-message assistant">{questions[index]}</div>
              <div className="atlas-message user">{answer}</div>
            </div>
          ))}

          {!complete && (
            <div className="atlas-message assistant">{questions[current]}</div>
          )}

          {complete && !analysis && (
            <div className="atlas-message assistant">
              Thank you. I have enough information to create your Team DNA.
            </div>
          )}
        </div>

        {!complete ? (
          <div className="atlas-composer">
            <textarea
              placeholder="Type your answer here…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              className="button"
              disabled={draft.trim().length < 5}
              onClick={submitAnswer}
              type="button"
            >
              Send
            </button>
          </div>
        ) : !analysis ? (
          <div className="atlas-generate-row">
            <label>
              Team context
              <select
                value={teamType}
                onChange={(event) => setTeamType(event.target.value)}
              >
                {[
                  "Friendship",
                  "Business",
                  "Sports",
                  "Education",
                  "Events",
                  "Community",
                ].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            {error && <div className="form-error">{error}</div>}

            <button
              className="button"
              disabled={working}
              onClick={() => void createDna()}
              type="button"
            >
              {working ? "Creating Team DNA…" : "Create Team DNA"}
            </button>
          </div>
        ) : null}
      </section>

      <aside className="atlas-profile-panel">
        {!analysis ? (
          <>
            <span className="eyebrow">Live profile preview</span>
            <h2>Your Team DNA will build as you answer.</h2>
            <p>
              Each response improves the structured profile used by the
              matching and team-building engine.
            </p>

            <div className="atlas-question-list">
              {questions.map((question, index) => (
                <div className={index < answers.length ? "done" : ""} key={question}>
                  <span>{index < answers.length ? "✓" : index + 1}</span>
                  <small>{question}</small>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="eyebrow">Conversation complete</span>
            <h2>Your Team DNA</h2>
            <p className="analysis-summary">{analysis.summary}</p>

            <TeamDnaChart dna={analysis.teamDna} />

            <h3>Preferred roles</h3>
            <div className="chips">
              {analysis.preferredRoles.map((role) => (
                <span className="chip" key={role}>
                  {role}
                </span>
              ))}
            </div>

            <div className="notice">
              <strong>Recommended environment:</strong>{" "}
              {analysis.recommendedEnvironment}
            </div>

            <div className="actions">
              <Link className="button" href="/team-builder">
                Open Team Builder
              </Link>
              <Link className="button secondary" href="/matches">
                Find matches
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
