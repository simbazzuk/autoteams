import { getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import type { Opportunity, OpportunityInterest } from "@/lib/opportunities";

function db() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!config.projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured.");
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  return getFirestore(app);
}

/* Existing API retained for backwards compatibility. */
export async function saveOpportunityCloud(o: Opportunity) {
  await setDoc(
    doc(db(), "opportunities", o.id),
    { ...o, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

export async function saveInterestCloud(i: OpportunityInterest) {
  await setDoc(
    doc(db(), "opportunityInterests", i.id),
    { ...i, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

export async function updateInterestCloud(
  id: string,
  status: OpportunityInterest["status"],
) {
  await updateDoc(doc(db(), "opportunityInterests", id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeOpportunities(
  uid: string,
  callback: (items: Opportunity[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const values = new Map<string, Opportunity>();
  const emit = () =>
    callback(
      [...values.values()].sort((a, b) =>
        String(b.createdAt).localeCompare(String(a.createdAt)),
      ),
    );

  const openQ = query(
    collection(db(), "opportunities"),
    where("status", "==", "open"),
  );
  const mineQ = query(
    collection(db(), "opportunities"),
    where("ownerId", "==", uid),
  );

  const openIds = new Set<string>();
  const mineIds = new Set<string>();

  const rebuild = (snap: any, ids: Set<string>) => {
    for (const id of ids) values.delete(id);
    ids.clear();
    snap.forEach((d: any) => {
      ids.add(d.id);
      values.set(d.id, { id: d.id, ...d.data() } as Opportunity);
    });
    emit();
  };

  const u1 = onSnapshot(openQ, s => rebuild(s, openIds), e => onError?.(e));
  const u2 = onSnapshot(mineQ, s => rebuild(s, mineIds), e => onError?.(e));

  return () => {
    u1();
    u2();
  };
}

export function subscribeInterests(
  uid: string,
  ownedOpportunityIds: string[],
  callback: (items: OpportunityInterest[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const groups = new Map<string, OpportunityInterest[]>();

  const emit = () => {
    const all = new Map<string, OpportunityInterest>();
    groups.forEach(xs => xs.forEach(x => all.set(x.id, x)));
    callback([...all.values()]);
  };

  const unsubs: Unsubscribe[] = [];
  const mine = query(
    collection(db(), "opportunityInterests"),
    where("userId", "==", uid),
  );

  unsubs.push(
    onSnapshot(
      mine,
      snap => {
        groups.set(
          "mine",
          snap.docs.map(d => ({ id: d.id, ...d.data() } as OpportunityInterest)),
        );
        emit();
      },
      e => onError?.(e),
    ),
  );

  for (const opportunityId of ownedOpportunityIds) {
    const q = query(
      collection(db(), "opportunityInterests"),
      where("opportunityId", "==", opportunityId),
    );

    unsubs.push(
      onSnapshot(
        q,
        snap => {
          groups.set(
            opportunityId,
            snap.docs.map(
              d => ({ id: d.id, ...d.data() } as OpportunityInterest),
            ),
          );
          emit();
        },
        e => onError?.(e),
      ),
    );
  }

  return () => unsubs.forEach(u => u());
}

export async function removeOpportunityCloud(id: string) {
  await deleteDoc(doc(db(), "opportunities", id));
}

/*
 * v7.15.7.15.6.4
 * Compatibility API expected by OpportunitiesPanel.tsx.
 * These use the same collections/data model as the existing implementation.
 */

export async function loadCloudOpenOpportunities(): Promise<Opportunity[]> {
  const q = query(
    collection(db(), "opportunities"),
    where("status", "==", "open"),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Opportunity))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function loadCloudOwnedOpportunities(
  uid: string,
): Promise<Opportunity[]> {
  const q = query(
    collection(db(), "opportunities"),
    where("ownerId", "==", uid),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Opportunity))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function persistCloudOpportunity(
  opportunity: Opportunity,
): Promise<void> {
  await saveOpportunityCloud(opportunity);
}

export async function persistCloudInterest(
  interest: OpportunityInterest,
): Promise<void> {
  await saveInterestCloud(interest);
}

export async function loadCloudInterestForUser(
  uid: string,
): Promise<OpportunityInterest[]> {
  const q = query(
    collection(db(), "opportunityInterests"),
    where("userId", "==", uid),
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    d => ({ id: d.id, ...d.data() } as OpportunityInterest),
  );
}

export async function loadCloudInterestForOpportunity(
  opportunityId: string,
): Promise<OpportunityInterest[]> {
  const q = query(
    collection(db(), "opportunityInterests"),
    where("opportunityId", "==", opportunityId),
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    d => ({ id: d.id, ...d.data() } as OpportunityInterest),
  );
}

export async function updateCloudInterestStatus(
  id: string,
  status: OpportunityInterest["status"],
): Promise<void> {
  await updateInterestCloud(id, status);
}

export async function updateCloudOpportunityStatus(
  id: string,
  status: Opportunity["status"],
): Promise<void> {
  await updateDoc(doc(db(), "opportunities", id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

type OpportunityFormedTeam = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  personIds: string[];
  createdAt: string;
  confidence: number;
  opportunityId?: string;
  source?: string;
  recommendation?: {
    source?: string;
    model?: string;
    summary?: string;
    teamStrengths?: string[];
    skillGaps?: string[];
    risks?: string[];
    responseTimeMs?: number;
    totalTokens?: number;
  };
};

function opportunityProfileType(context: Opportunity["context"]) {
  if (context === "sports") return "sport";
  if (context === "community") return "community";
  if (context === "education") return "education";
  return "work";
}

export async function persistCloudFormedTeam(
  team: OpportunityFormedTeam,
  ownerId: string,
  context: Opportunity["context"],
): Promise<void> {
  const memberIds = Array.from(new Set([ownerId, ...(team.personIds || [])]));

  await setDoc(
    doc(db(), "teams", team.id),
    {
      ...team,
      ownerId,
      memberIds,
      memberCount: memberIds.length,
      profileType: opportunityProfileType(context),
      source: "opportunity",
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function linkCloudOpportunityToTeam(
  opportunityId: string,
  formedTeamId: string,
  formedMemberCount: number,
  targetPlaces: number,
  status: Opportunity["status"],
): Promise<void> {
  await updateDoc(doc(db(), "opportunities", opportunityId), {
    formedTeamId,
    formedMemberCount,
    targetPlaces,
    status,
    teamFormedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function addAcceptedCandidateToCloudTeam(
  teamId: string,
  ownerId: string,
  candidateUserId: string,
): Promise<{ memberIds: string[]; memberCount: number; alreadyMember: boolean }> {
  const teamRef = doc(db(), "teams", teamId);
  const snap = await getDoc(teamRef);

  if (!snap.exists()) {
    throw new Error("The formed team could not be found in Firestore.");
  }

  const data = snap.data() as {
    ownerId?: string;
    memberIds?: string[];
  };

  if (data.ownerId !== ownerId) {
    throw new Error("Only the team owner can add accepted candidates.");
  }

  const current = Array.isArray(data.memberIds) ? data.memberIds : [];
  const alreadyMember = current.includes(candidateUserId);
  const memberIds = Array.from(
    new Set([ownerId, ...current, candidateUserId]),
  );

  await updateDoc(teamRef, {
    memberIds,
    memberCount: memberIds.length,
    updatedAt: new Date().toISOString(),
  });

  return {
    memberIds,
    memberCount: memberIds.length,
    alreadyMember,
  };
}

export async function updateCloudOpportunityProgress(
  opportunityId: string,
  formedMemberCount: number,
  targetPlaces: number,
): Promise<void> {
  await updateDoc(doc(db(), "opportunities", opportunityId), {
    formedMemberCount,
    targetPlaces,
    status: formedMemberCount >= targetPlaces ? "forming" : "open",
    updatedAt: new Date().toISOString(),
  });
}
