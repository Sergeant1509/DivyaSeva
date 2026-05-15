# DivyaSeva — Multi-page Firebase-ready Website

DivyaSeva is a modern Indian online puja, daan and sankalp seva website. This version is not a single-page layout. It has separate pages, cleaner colors, simpler UI, mobile bottom navigation and Firebase-ready code.

## Pages included

- `public/index.html` — Homepage
- `public/puja.html` — Puja listing with search, category filter and price sorting
- `public/daan.html` — Daan seva listing with search, category filter and price sorting
- `public/booking.html` — Sankalp / booking form
- `public/dashboard.html` — Saved booking dashboard
- `public/auth.html` — Login / signup page, Firebase-ready
- `public/about.html` — Startup/about page with FAQ
- `public/contact.html` — Contact/enquiry form

## Features

- Multi-page structure
- Mobile-first responsive UI
- Modern Indian devotional color palette
- Font Awesome icons
- Smooth reveal animations
- Puja and daan filters
- Booking form with local storage fallback
- Dashboard for submitted bookings
- Contact form with local storage fallback
- Firebase Authentication ready
- Firestore booking/contact ready
- Firebase Hosting ready

## How to run on Windows

### Recommended: VS Code Live Server

1. Open the project folder in VS Code.
2. Install the extension named **Live Server**.
3. Open `public/index.html`.
4. Right-click and choose **Open with Live Server**.

### If Node.js is installed

From the `public` folder:

```powershell
npx serve .
```

or:

```powershell
npx http-server .
```

## Firebase setup

Open:

```text
public/js/firebase-config.js
```

Replace this placeholder config:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Then enable:

1. Firebase Authentication > Email/Password
2. Firestore Database
3. Firebase Hosting

## Deploy to Firebase Hosting

From the main project folder:

```powershell
firebase login
firebase use --add
firebase deploy
```

The public directory is already set in `firebase.json`:

```json
"public": "public"
```

## Important before real launch

This is a startup-ready frontend. For real business launch, add:

- Verified puja/service fulfilment workflow
- Admin panel for bookings
- Real payment gateway such as Razorpay, PhonePe or Cashfree
- Real refund/cancellation policy
- Real privacy policy and terms
- Real support email and phone number
- Real service images and temple/partner verification
