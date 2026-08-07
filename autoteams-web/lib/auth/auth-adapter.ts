"use client";

import {
  readAuthProvider,
} from "@/lib/config/autoteams-config";
import {
  signInWithGoogle,
  signOutFirebase,
  subscribeToFirebaseAuth,
  type FirebaseSessionUser,
} from "@/lib/firebase/auth-client";

export type AutoTeamsAuthUser = {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: "local" | "firebase";
};

export async function signInWithConfiguredProvider(): Promise<AutoTeamsAuthUser> {
  const provider =
    readAuthProvider();

  if (provider === "firebase") {
    const user =
      await signInWithGoogle();

    return mapFirebaseUser(
      user,
    );
  }

  throw new Error(
    "Local auth continues to use the existing AutoTeams login flow.",
  );
}

export async function signOutConfiguredProvider(): Promise<void> {
  if (
    readAuthProvider() ===
    "firebase"
  ) {
    await signOutFirebase();
  }
}

export function subscribeToConfiguredAuth(
  listener: (
    user:
      | AutoTeamsAuthUser
      | null,
  ) => void,
): () => void {
  if (
    readAuthProvider() ===
    "firebase"
  ) {
    return subscribeToFirebaseAuth(
      (user) =>
        listener(
          user
            ? mapFirebaseUser(
                user,
              )
            : null,
        ),
    );
  }

  listener(null);

  return () => undefined;
}

function mapFirebaseUser(
  user: FirebaseSessionUser,
): AutoTeamsAuthUser {
  return {
    id: user.uid,
    displayName:
      user.displayName,
    email:
      user.email,
    photoURL:
      user.photoURL,
    provider: "firebase",
  };
}
