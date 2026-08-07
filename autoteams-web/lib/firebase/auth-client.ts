"use client";

import {
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseFirestore,
} from "@/lib/firebase/client";

export type FirebaseSessionUser = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
};

export async function signInWithGoogle(): Promise<FirebaseSessionUser> {
  const auth = getFirebaseAuth();

  await setPersistence(
    auth,
    browserLocalPersistence,
  );

  const provider =
    new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  const result =
    await signInWithPopup(
      auth,
      provider,
    );

  await bootstrapFirebaseUser(
    result.user,
    true,
  );

  return mapFirebaseUser(
    result.user,
  );
}

export async function signOutFirebase(): Promise<void> {
  await signOut(
    getFirebaseAuth(),
  );
}

export function subscribeToFirebaseAuth(
  listener: (
    user: FirebaseSessionUser | null,
  ) => void,
): () => void {
  return onAuthStateChanged(
    getFirebaseAuth(),
    async (user) => {
      if (!user) {
        listener(null);
        return;
      }

      await bootstrapFirebaseUser(
        user,
        false,
      );

      listener(
        mapFirebaseUser(user),
      );
    },
  );
}

async function bootstrapFirebaseUser(
  user: User,
  explicitLogin: boolean,
): Promise<void> {
  const db =
    getFirebaseFirestore();

  const userRef =
    doc(
      db,
      "users",
      user.uid,
    );

  const existing =
    await getDoc(userRef);

  const base = {
    uid: user.uid,
    displayName:
      user.displayName ||
      emailDisplayName(
        user.email,
      ),
    email:
      user.email || "",
    photoURL:
      user.photoURL || null,
    provider: "google",
    status: "active",
    updatedAt:
      serverTimestamp(),
  };

  if (!existing.exists()) {
    await setDoc(
      userRef,
      {
        ...base,
        createdAt:
          serverTimestamp(),
        lastLoginAt:
          serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    return;
  }

  await setDoc(
    userRef,
    {
      ...base,
      ...(explicitLogin
        ? {
            lastLoginAt:
              serverTimestamp(),
          }
        : {}),
    },
    {
      merge: true,
    },
  );
}

function mapFirebaseUser(
  user: User,
): FirebaseSessionUser {
  return {
    uid: user.uid,
    displayName:
      user.displayName ||
      emailDisplayName(
        user.email,
      ),
    email:
      user.email || "",
    photoURL:
      user.photoURL || undefined,
  };
}

function emailDisplayName(
  email?: string | null,
): string {
  return (email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();
}
