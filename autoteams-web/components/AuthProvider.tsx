"use client";

import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, db } from "@/lib/firebase";

type SignUpInput = {
  displayName: string;
  email: string;
  password: string;
  city?: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent: boolean;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function upsertUserProfile(
  user: User,
  extras: {
    displayName?: string;
    city?: string;
    ageConfirmed?: boolean;
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    marketingConsent?: boolean;
  } = {}
) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email,
      displayName: extras.displayName || user.displayName || "",
      city: extras.city || "",
      photoURL: user.photoURL || "",
      providerIds: user.providerData.map((provider) => provider.providerId),
      ageConfirmed: extras.ageConfirmed ?? true,
      termsAccepted: extras.termsAccepted ?? true,
      privacyAccepted: extras.privacyAccepted ?? true,
      marketingConsent: extras.marketingConsent ?? false,
      registrationVersion: "11.5",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,

      async signUp({
        displayName,
        email,
        password,
        city,
        ageConfirmed,
        termsAccepted,
        privacyAccepted,
        marketingConsent,
      }) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(credential.user, { displayName });
        await upsertUserProfile(credential.user, {
          displayName,
          city,
          ageConfirmed,
          termsAccepted,
          privacyAccepted,
          marketingConsent,
        });
        await sendEmailVerification(credential.user);
      },

      async signIn(email, password) {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        await upsertUserProfile(credential.user);
      },

      async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const credential = await signInWithPopup(auth, provider);
        await upsertUserProfile(credential.user);
      },

      async resetPassword(email) {
        await sendPasswordResetEmail(auth, email);
      },

      async resendVerification() {
        if (!auth.currentUser) {
          throw new Error("No authenticated user.");
        }
        await sendEmailVerification(auth.currentUser);
      },

      async reloadUser() {
        if (!auth.currentUser) return;
        await auth.currentUser.reload();
        setUser(auth.currentUser);
      },

      async logout() {
        await signOut(auth);
      },
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
