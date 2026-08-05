import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type TeamPersona = {
  id: string;
  accountName: string;
  city: string;
  teamType: string;
  values: string[];
  status: "ready" | "draft";
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type NewTeamPersona = Omit<
  TeamPersona,
  "id" | "createdAt" | "updatedAt" | "status"
>;

function personaCollection(userId: string) {
  return collection(db, "users", userId, "personas");
}

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function mapPersona(
  id: string,
  data: Record<string, unknown>
): TeamPersona {
  return {
    id,
    accountName:
      typeof data.accountName === "string" ? data.accountName : "Member",
    city: typeof data.city === "string" ? data.city : "Not specified",
    teamType:
      typeof data.teamType === "string" ? data.teamType : "Friendship",
    values: Array.isArray(data.values)
      ? data.values.filter((value): value is string => typeof value === "string")
      : [],
    status: data.status === "draft" ? "draft" : "ready",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function createPersona(
  userId: string,
  persona: NewTeamPersona
): Promise<string> {
  const reference = await addDoc(personaCollection(userId), {
    ...persona,
    status: "ready",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function listPersonas(userId: string): Promise<TeamPersona[]> {
  const snapshot = await getDocs(
    query(personaCollection(userId), orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((item) =>
    mapPersona(item.id, item.data() as Record<string, unknown>)
  );
}

export async function getPersona(
  userId: string,
  personaId: string
): Promise<TeamPersona | null> {
  const snapshot = await getDoc(
    doc(db, "users", userId, "personas", personaId)
  );

  if (!snapshot.exists()) return null;
  return mapPersona(
    snapshot.id,
    snapshot.data() as Record<string, unknown>
  );
}

export async function updatePersona(
  userId: string,
  personaId: string,
  updates: Pick<TeamPersona, "accountName" | "city" | "teamType" | "values">
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "personas", personaId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function removePersona(
  userId: string,
  personaId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "personas", personaId));
}
