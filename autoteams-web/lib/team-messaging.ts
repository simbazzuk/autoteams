"use client";

import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type TeamScienceConversationType = "opportunity" | "team";

export type TeamScienceMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt?: {
    toDate?: () => Date;
  } | null;
};

export type TeamScienceInboxConversation = {
  id: string;
  conversationId: string;
  type: TeamScienceConversationType;
  entityId: string;
  title: string;
  ownerId?: string;
  candidateId?: string;
  scope?: string;
  participantIds: string[];
  lastMessage: string;
  lastSenderId: string;
  unread: boolean;
  updatedAt?: {
    toDate?: () => Date;
    toMillis?: () => number;
  } | null;
};

function safePart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item))
    : [];
}

export function conversationIdFor(
  type: TeamScienceConversationType,
  entityId: string,
  scope?: string,
) {
  const base = `${type}_${safePart(entityId)}`;
  return scope ? `${base}_${safePart(scope)}` : base;
}

async function teamParticipantIds(teamId: string, currentUserId: string) {
  try {
    const snapshot = await getDoc(doc(db, "teams", teamId));
    if (!snapshot.exists()) return [currentUserId];

    const data = snapshot.data();
    const ownerId = typeof data.ownerId === "string" ? data.ownerId : "";
    const memberIds = asStringArray(data.memberIds);

    return [...new Set([ownerId, ...memberIds, currentUserId].filter(Boolean))];
  } catch {
    return [currentUserId];
  }
}

async function writeInboxReference(input: {
  userId: string;
  conversationId: string;
  type: TeamScienceConversationType;
  entityId: string;
  title: string;
  ownerId?: string;
  candidateId?: string;
  scope?: string;
  participantIds: string[];
  lastMessage?: string;
  lastSenderId?: string;
  unread?: boolean;
}) {
  await setDoc(
    doc(
      db,
      "messageInboxes",
      input.userId,
      "conversations",
      input.conversationId,
    ),
    {
      userId: input.userId,
      conversationId: input.conversationId,
      type: input.type,
      entityId: input.entityId,
      title: input.title,
      ownerId: input.ownerId || null,
      candidateId: input.candidateId || null,
      scope: input.scope || null,
      participantIds: input.participantIds,
      lastMessage: input.lastMessage || "",
      lastSenderId: input.lastSenderId || "",
      unread: Boolean(input.unread),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function ensureConversation(input: {
  type: TeamScienceConversationType;
  entityId: string;
  title: string;
  scope?: string;
  createdBy: string;
  ownerId?: string;
  candidateId?: string;
}) {
  const id = conversationIdFor(input.type, input.entityId, input.scope);

  const participantIds =
    input.type === "opportunity"
      ? [...new Set([input.ownerId, input.candidateId].filter(Boolean) as string[])]
      : await teamParticipantIds(input.entityId, input.createdBy);

  await setDoc(
    doc(db, "conversations", id),
    {
      type: input.type,
      entityId: input.entityId,
      scope: input.scope || null,
      title: input.title,
      createdBy: input.createdBy,
      ownerId: input.ownerId || null,
      candidateId: input.candidateId || null,
      participantIds,
      readByIds: arrayUnion(input.createdBy),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await Promise.all(
    participantIds.map((userId) =>
      writeInboxReference({
        userId,
        conversationId: id,
        type: input.type,
        entityId: input.entityId,
        title: input.title,
        ownerId: input.ownerId,
        candidateId: input.candidateId,
        scope: input.scope,
        participantIds,
        unread: false,
      }),
    ),
  );

  return id;
}

export function subscribeToConversation(
  conversationId: string,
  onMessages: (messages: TeamScienceMessage[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, "conversations", conversationId, "messages"),
    (snapshot) => {
      const messages = snapshot.docs
        .map((item) => {
          const data = item.data();
          return {
            id: item.id,
            senderId: String(data.senderId || ""),
            senderName: String(data.senderName || "TeamScience member"),
            text: String(data.text || ""),
            createdAt: data.createdAt ?? null,
          } as TeamScienceMessage;
        })
        .sort((a, b) => {
          const at = a.createdAt?.toDate?.()?.getTime?.() || 0;
          const bt = b.createdAt?.toDate?.()?.getTime?.() || 0;
          return at - bt;
        });

      onMessages(messages);
    },
    (error) => onError?.(error),
  );
}

export function subscribeToInbox(
  userId: string,
  onItems: (items: TeamScienceInboxConversation[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, "messageInboxes", userId, "conversations"),
    (snapshot) => {
      const items = snapshot.docs
        .map((item) => {
          const data = item.data();
          return {
            id: item.id,
            conversationId: String(data.conversationId || item.id),
            type: data.type === "team" ? "team" : "opportunity",
            entityId: String(data.entityId || ""),
            title: String(data.title || "TeamScience conversation"),
            ownerId: typeof data.ownerId === "string" ? data.ownerId : undefined,
            candidateId:
              typeof data.candidateId === "string" ? data.candidateId : undefined,
            scope: typeof data.scope === "string" ? data.scope : undefined,
            participantIds: asStringArray(data.participantIds),
            lastMessage: String(data.lastMessage || ""),
            lastSenderId: String(data.lastSenderId || ""),
            unread: Boolean(data.unread),
            updatedAt: data.updatedAt ?? null,
          } as TeamScienceInboxConversation;
        })
        .sort((a, b) => {
          const at = a.updatedAt?.toMillis?.() || a.updatedAt?.toDate?.()?.getTime?.() || 0;
          const bt = b.updatedAt?.toMillis?.() || b.updatedAt?.toDate?.()?.getTime?.() || 0;
          return bt - at;
        });

      onItems(items);
    },
    (error) => onError?.(error),
  );
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  try {
    await updateDoc(doc(db, "conversations", conversationId), {
      readByIds: arrayUnion(userId),
    });
  } catch {}

  try {
    await setDoc(
      doc(db, "messageInboxes", userId, "conversations", conversationId),
      {
        userId,
        conversationId,
        unread: false,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {}
}

export async function sendConversationMessage(input: {
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
}) {
  const clean = input.text.trim();
  if (!clean) return;

  const conversationRef = doc(db, "conversations", input.conversationId);
  const conversationSnapshot = await getDoc(conversationRef);

  if (!conversationSnapshot.exists()) {
    throw new Error("Conversation not found.");
  }

  const conversation = conversationSnapshot.data();
  const participantIds = asStringArray(conversation.participantIds);
  const type: TeamScienceConversationType =
    conversation.type === "team" ? "team" : "opportunity";
  const entityId = String(conversation.entityId || "");
  const title = String(conversation.title || "TeamScience conversation");
  const ownerId =
    typeof conversation.ownerId === "string" ? conversation.ownerId : undefined;
  const candidateId =
    typeof conversation.candidateId === "string"
      ? conversation.candidateId
      : undefined;
  const scope =
    typeof conversation.scope === "string" ? conversation.scope : undefined;

  await addDoc(
    collection(db, "conversations", input.conversationId, "messages"),
    {
      senderId: input.senderId,
      senderName: input.senderName,
      text: clean,
      createdAt: serverTimestamp(),
    },
  );

  await setDoc(
    conversationRef,
    {
      updatedAt: serverTimestamp(),
      lastMessage: clean.slice(0, 180),
      lastSenderId: input.senderId,
      readByIds: [input.senderId],
    },
    { merge: true },
  );

  await Promise.all(
    participantIds.map((userId) =>
      writeInboxReference({
        userId,
        conversationId: input.conversationId,
        type,
        entityId,
        title,
        ownerId,
        candidateId,
        scope,
        participantIds,
        lastMessage: clean.slice(0, 180),
        lastSenderId: input.senderId,
        unread: userId !== input.senderId,
      }),
    ),
  );
}