"use client";

import {
  FirebaseApp,
  getApps,
  initializeApp,
} from "firebase/app";
import {
  Auth,
  getAuth,
} from "firebase/auth";
import {
  Firestore,
  getFirestore,
} from "firebase/firestore";
import {
  getFirebasePublicConfig,
  isFirebasePublicConfigComplete,
} from "@/lib/config/firebase-public-config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  if (!isFirebasePublicConfigComplete()) {
    throw new Error(
      "Firebase public configuration is incomplete.",
    );
  }

  app =
    getApps()[0] ||
    initializeApp(
      getFirebasePublicConfig(),
    );

  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(
      getFirebaseApp(),
    );
  }

  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(
      getFirebaseApp(),
    );
  }

  return firestore;
}
