// ============================================================
// PRIMILM — Auth module
// Three separate identity flows: Creator, Buyer, Admin
// ============================================================
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ------------------------------------------------------------
// CREATORS — full account, email+password or Google
// ------------------------------------------------------------

export async function signUpCreator(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Create their creator profile doc — this is what the onboarding
  // wizard reads/writes as they move through each step.
  await setDoc(doc(db, "creators", cred.user.uid), {
    email,
    role: null,
    businessName: "",
    category: null,
    paymentMethod: null,
    theme: null,
    storeUrl: null,
    published: false,
    plan: null,
    createdAt: serverTimestamp()
  });
  return cred.user;
}

export async function signInCreator(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInCreatorWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  // If this is their first time, create a profile doc too
  const ref = doc(db, "creators", cred.user.uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, {
      email: cred.user.email,
      role: null, businessName: "", category: null,
      paymentMethod: null, theme: null, storeUrl: null,
      published: false, plan: null, createdAt: serverTimestamp()
    });
  }
  return cred.user;
}

export async function signOutCreator() {
  await signOut(auth);
}

export function watchCreatorAuth(callback) {
  // Use this on every protected page (dashboard, onboarding) to redirect
  // to login if there's no signed-in creator.
  return onAuthStateChanged(auth, callback);
}

// ------------------------------------------------------------
// BUYERS — no upfront account. Email + magic link only.
// They never set a password. This is intentional — see the
// conversation notes: forcing signup before checkout kills conversions.
// ------------------------------------------------------------

const actionCodeSettings = {
  // This must be a page on your real domain once deployed, e.g.
  // https://primilm.com/buyer-login-complete.html
  url: window.location.origin + "/buyer-login-complete.html",
  handleCodeInApp: true
};

export async function sendBuyerMagicLink(email) {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // Store the email locally so we can complete sign-in when they
  // click the link back (Firebase requires this on the same device,
  // or the buyer re-enters it manually if opening on another device).
  window.localStorage.setItem("primilm_buyer_email", email);
}

export async function completeBuyerSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;
  let email = window.localStorage.getItem("primilm_buyer_email");
  if (!email) {
    email = window.prompt("Please confirm your email to finish signing in");
  }
  const cred = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem("primilm_buyer_email");

  // Create a lightweight buyer record (purchase history lives here,
  // not a full profile) if one doesn't exist yet.
  const ref = doc(db, "buyers", cred.user.uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, { email, createdAt: serverTimestamp() });
  }
  return cred.user;
}

// ------------------------------------------------------------
// ADMIN — no visible entry point anywhere in the UI.
// Checked against a Firestore "admins" collection, NOT a client-side
// email list — the real enforcement lives in firestore.rules, this
// function is just for showing/hiding admin UI after the fact.
// ------------------------------------------------------------

export async function isCurrentUserAdmin() {
  if (!auth.currentUser) return false;
  const ref = doc(db, "admins", auth.currentUser.uid);
  const snap = await getDoc(ref);
  return snap.exists();
}
