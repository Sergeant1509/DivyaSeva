# DivyaSeva — Firebase Ready Multi-Page Website

A modern, mobile-optimized devotional services website for Indian users. Built with clean HTML, CSS, and JavaScript, with optional Firebase Auth + Firestore support.

## Pages

- `public/index.html` — Home
- `public/puja.html` — Puja services with search and filters
- `public/daan.html` — Daan and seva offerings
- `public/booking.html` — Sankalp/booking form
- `public/dashboard.html` — User booking dashboard using localStorage/Firebase-ready flow
- `public/auth.html` — Login/Register page
- `public/about.html` — About page
- `public/contact.html` — Contact/support page

## Run locally

Use VS Code Live Server and open `public/index.html`.

Alternative with Node:

```bash
cd public
npx serve .
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication > Email/Password.
3. Create Firestore Database.
4. Open `public/js/firebase-config.js` and paste your Firebase web config.
5. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

6. Login and deploy:

```bash
firebase login
firebase use --add
firebase deploy
```

## Hosting settings

When Firebase asks for public directory, use:

```text
public
```

For single-page app rewrite, choose:

```text
No
```

## Notes

- The site works without Firebase using localStorage demo data.
- After Firebase config is added, forms can save to Firestore and Auth can work using Firebase Auth.
- Never commit private admin SDK files like `serviceAccountKey.json`.
