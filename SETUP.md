# Primilm — Auth & Backend Setup Guide

This connects the three login flows we agreed on:
- **Creators** — full account (email/password or Google)
- **Buyers** — no password, just email + magic link
- **Admin (you)** — invisible in the UI, enforced by security rules, not by a hidden button

## Step 1 — Create the Firebase project
1. Go to https://console.firebase.google.com
2. Create a new project called **Primilm**
3. Project Settings → General → "Your apps" → Add app → Web (</> icon)
4. Copy the config values it gives you into `firebase-config.js` (replace every `PASTE_YOUR_...` placeholder)

## Step 2 — Turn on the sign-in methods you need
In Firebase Console → **Authentication → Sign-in method**, enable:
- Email/Password — for creators
- Email link (passwordless sign-in) — for buyers
- Google — for creator "Sign in with Google"

## Step 3 — Create Firestore
Firebase Console → **Firestore Database** → Create database → start in **production mode** (not test mode — test mode allows anyone to read/write everything, which you don't want even during development).

## Step 4 — Deploy the security rules
The rules in `firestore.rules` are what actually protects your data — not anything in the frontend code. Deploy them with the Firebase CLI:
```
npm install -g firebase-tools
firebase login
firebase init firestore   (point it at your existing project)
firebase deploy --only firestore:rules
```

## Step 5 — Make yourself the admin
This is the important part for "how do I get admin access without a visible login button":

1. Sign up as a normal creator once, using your own email, through the normal onboarding flow.
2. In Firebase Console → Firestore Database, manually create a new collection called `admins`.
3. Add one document to it. The **document ID must be your Firebase Auth UID** (find this in Authentication → Users → your row → the long ID string). The document itself can just have one field, e.g. `addedAt: (today's date)` — the content doesn't matter, only its existence and its ID matter, since the rules check `exists()`.
4. That's it. There's no admin login page anywhere — your own regular login becomes an admin session automatically, because the app checks the `admins` collection after you sign in, and the security rules (Step 4) are the real gate that decides what an admin account is allowed to touch.

This is deliberately manual rather than something the app can do to itself — it means no bug, no exposed route, and no exploited endpoint could ever grant someone admin access. You are the only one who can create an admin, and only from inside the Firebase Console itself, not from the website.

## Step 6 — Wire the onboarding wizard to real accounts
Right now `primilm-onboarding.html` is a visual prototype — nothing typed into it is saved anywhere. The next step is adding a real signup step at the very beginning of that wizard (email + password fields, calling `signUpCreator()` from `auth.js`), and having each subsequent step (role, name, category, payment, theme, URL) write straight into that creator's Firestore document as they go, instead of only living in a JS variable in the browser tab. Say the word and I'll build that wiring next.

## What's still missing after this
- The actual public storefront page buyers land on (`primilm.com/storename`)
- Stripe/Payoneer webhook handling for real subscription billing (never trust the client to mark itself "paid" — see the rules file)
- Hosting (Cloudflare Pages, same as Education Finder, works well for this)
