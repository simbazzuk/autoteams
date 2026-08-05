"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProfileAnalysis } from "@/lib/team-intelligence";
import { TeamDnaChart } from "@/components/intelligence/TeamDnaChart";

const questions = [
  "What kind of team are you hoping to join or build?",
  "What brings out your best contribution?",
  "What makes someone a great teammate for you?",
  "What tends to frustrate you in a group?",
  "Describe the best team experience you have had.",
];

export function TeamGuideInterview() {
  const [teamType, setTeamType] = useState("Business");
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const complete = current >= questions.length;
  const narrative = useMemo(
    () => answers.map((answer,index) => `${questions[index]} Answer: ${answer}`).join("\n\n"),
    [answers]
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
      const result = (await response.json()) as { analysis?: ProfileAnalysis; error?: string };
      if (!response.ok || !result.analysis) throw new Error(result.error || "Unable to create Team DNA.");
      setAnalysis(result.analysis);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "TeamGuide failed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="v2-teamguide-shell">
      <section className="v2-chat-panel">
        <div className="v2-chat-header">
          <div className="v2-guide-avatar">✦</div>
          <div><strong>TeamGuide</strong><small>AI onboarding assistant</small></div>
          <span className="badge">Gemini live</span>
        </div>

        <div className="v2-chat-progress">
          <span style={{ width: `${Math.min(100,(current/questions.length)*100)}%` }} />
        </div>

        <div className="v2-conversation">
          <div className="v2-message assistant">
            Hi, I’m TeamGuide. I’ll ask five questions to understand how you
            contribute to teams. You can review the result before using it.
          </div>

          {answers.map((answer,index)=>(
            <div className="v2-thread" key={index}>
              <div className="v2-message assistant">{questions[index]}</div>
              <div className="v2-message user">{answer}</div>
            </div>
          ))}

          {!complete && <div className="v2-message assistant">{questions[current]}</div>}
          {complete && !analysis && <div className="v2-message assistant">Thank you. I have enough information to create your Team DNA.</div>}
        </div>

        {!complete ? (
          <div className="v2-chat-composer">
            <textarea
              placeholder="Type your answer here…"
              value={draft}
              onChange={(event)=>setDraft(event.target.value)}
            />
            <button className="button" disabled={draft.trim().length<5} onClick={submitAnswer} type="button">
              Send
            </button>
          </div>
        ) : !analysis ? (
          <div className="v2-generate-row">
            <label>Team context
              <select value={teamType} onChange={(event)=>setTeamType(event.target.value)}>
                {["Friendship","Business","Sports","Education","Events","Community"].map((type)=><option key={type}>{type}</option>)}
              </select>
            </label>
            {error && <div className="form-error">{error}</div>}
            <button className="button" disabled={working} onClick={()=>void createDna()} type="button">
              {working ? "Creating Team DNA…" : "Create Team DNA"}
            </button>
          </div>
        ) : null}
      </section>

      <aside className="v2-intelligence-preview">
        {!analysis ? (
          <>
            <span className="eyebrow">Live profile preview</span>
            <h2>Your Team DNA will build as you answer.</h2>
            <p>Each answer improves the structured profile used by the explainable matching engine.</p>
            <div className="v2-question-list">
              {questions.map((question,index)=>(
                <div className={index<answers.length ? "done" : ""} key={question}>
                  <span>{index<answers.length ? "✓" : index+1}</span>
                  <small>{question}</small>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="eyebrow">Interview complete</span>
            <h2>Your Team DNA</h2>
            <p className="analysis-summary">{analysis.summary}</p>
            <TeamDnaChart dna={analysis.teamDna} />
            <h3>Preferred roles</h3>
            <div className="chips">{analysis.preferredRoles.map((role)=><span className="chip" key={role}>{role}</span>)}</div>
            <div className="notice"><strong>Recommended environment:</strong> {analysis.recommendedEnvironment}</div>
            <div className="actions"><Link className="button" href="/matches">Find matches</Link></div>
          </>
        )}
      </aside>
    </div>
  );
}
