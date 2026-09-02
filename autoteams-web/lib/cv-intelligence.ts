"use client";

export type CvExperience = {
  role: string;
  organisation: string;
  period: string;
  evidence: string;
};

export type CvIntelligence = {
  fileName: string;
  analysedAt: string;
  headline: string;
  summary: string;
  seniority: string;
  yearsExperience: number | null;
  roles: string[];
  skills: string[];
  industries: string[];
  qualifications: string[];
  achievements: string[];
  experience: CvExperience[];
  opportunityKeywords: string[];
  useForOpportunityMatching: boolean;
  shareCvWithOpportunityOwners: boolean;
};

const STORAGE_KEY = "autoteams-cv-intelligence-v71571521";

export function loadCvIntelligence(): CvIntelligence | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CvIntelligence;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCvIntelligence(value: CvIntelligence): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event("autoteams:cv-intelligence-changed"));
}

export function removeCvIntelligence(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("autoteams:cv-intelligence-changed"));
}

export function cvOpportunityEvidence(value: CvIntelligence | null): string[] {
  if (!value || !value.useForOpportunityMatching) return [];

  return [
    ...value.roles,
    ...value.skills,
    ...value.industries,
    ...value.qualifications,
    ...value.opportunityKeywords,
  ]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 60);
}
