import type { AtlasQuestion } from "@/lib/atlas-question-packs";

export type AtlasAnswerMap = Record<string, string>;

export type ContextInterviewState = {
  profileId: string;
  mode: string;
  answers: AtlasAnswerMap;
  completedAt: string | null;
  updatedAt: string;
};

export type CoreInterviewState = {
  answers: AtlasAnswerMap;
  completedAt: string | null;
  updatedAt: string;
};

const CORE_KEY = "autoteams-atlas-core-interview";
const CONTEXT_KEY = "autoteams-atlas-context-interviews";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadCoreInterview(): CoreInterviewState {
  return readLocal(CORE_KEY, {
    answers: {},
    completedAt: null,
    updatedAt: "",
  });
}

export function saveCoreInterview(state: CoreInterviewState): void {
  writeLocal(CORE_KEY, state);
}

export function loadContextInterviews(): ContextInterviewState[] {
  return readLocal(CONTEXT_KEY, []);
}

export function saveContextInterviews(items: ContextInterviewState[]): void {
  writeLocal(CONTEXT_KEY, items);
}

export function loadContextInterview(
  profileId: string,
  mode: string,
): ContextInterviewState {
  const existing = loadContextInterviews().find(
    (item) => item.profileId === profileId,
  );
  return (
    existing || {
      profileId,
      mode,
      answers: {},
      completedAt: null,
      updatedAt: "",
    }
  );
}

export function upsertContextInterview(
  state: ContextInterviewState,
): void {
  const items = loadContextInterviews();
  const updated = [
    ...items.filter((item) => item.profileId !== state.profileId),
    state,
  ];
  saveContextInterviews(updated);
}

export function interviewProgress(
  questions: AtlasQuestion[],
  answers: AtlasAnswerMap,
): number {
  if (!questions.length) return 0;
  const answered = questions.filter((question) =>
    Boolean(answers[question.id]?.trim()),
  ).length;
  return Math.round((answered / questions.length) * 100);
}

export function profileFreshness(updatedAt: string | null): {
  daysOld: number | null;
  label: string;
  confidence: number;
  status: "fresh" | "aging" | "stale" | "not-started";
} {
  if (!updatedAt) {
    return {
      daysOld: null,
      label: "Not completed",
      confidence: 0,
      status: "not-started",
    };
  }

  const updated = new Date(updatedAt).getTime();
  const ageMs = Date.now() - updated;
  const daysOld = Math.max(0, Math.floor(ageMs / 86400000));

  if (daysOld <= 90) {
    return {
      daysOld,
      label: daysOld === 0 ? "Updated today" : `Updated ${daysOld} days ago`,
      confidence: Math.max(92, 100 - Math.floor(daysOld / 10)),
      status: "fresh",
    };
  }

  if (daysOld <= 365) {
    return {
      daysOld,
      label: `Updated ${daysOld} days ago`,
      confidence: Math.max(70, 90 - Math.floor((daysOld - 90) / 12)),
      status: "aging",
    };
  }

  return {
    daysOld,
    label: `Updated ${daysOld} days ago`,
    confidence: Math.max(45, 68 - Math.floor((daysOld - 365) / 30)),
    status: "stale",
  };
}
