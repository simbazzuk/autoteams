"use client";

import {
  User,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirebaseAuth,
} from "@/lib/firebase/client";

export function waitForFirebaseUser(): Promise<User | null> {
  const auth =
    getFirebaseAuth();

  if (auth.currentUser) {
    return Promise.resolve(
      auth.currentUser,
    );
  }

  return new Promise(
    (resolve) => {
      const unsubscribe =
        onAuthStateChanged(
          auth,
          (user) => {
            unsubscribe();
            resolve(user);
          },
          () => {
            unsubscribe();
            resolve(null);
          },
        );
    },
  );
}

export function subscribeToFirebaseUser(
  listener: (
    user: User | null,
  ) => void,
): () => void {
  return onAuthStateChanged(
    getFirebaseAuth(),
    listener,
  );
}
