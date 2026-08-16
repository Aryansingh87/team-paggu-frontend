# Team Paggu — Frontend

React + Vite + React Router project for the Team Paggu powerlifting coaching platform.
Now fully wired to the real backend — no more mocked data.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** — copy `.env.example` to `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
   (Change these if your backend runs elsewhere, e.g. after deploying it.)

3. **Make sure the backend is running first** — see `team-paggu-backend/README.md`.
   You need it running (and seeded with `npm run seed`) for login, memberships, and
   dashboards to work.

4. **Run the frontend**
   ```bash
   npm run dev
   ```
   Then open the local URL Vite prints (usually http://localhost:5173).

## Pages included

| Route          | Page               | What it does |
|----------------|---------------------|---------------|
| `/`            | Landing Page        | Hero, scoreboard stats, program overview, coach bio, video wall, CTA |
| `/memberships` | Memberships         | Real pricing tiers fetched from the backend + live Razorpay checkout |
| `/login`       | Login / Signup      | Real signup/login against the backend, JWT stored client-side |
| `/dashboard`   | Client Dashboard    | **Protected** (client role only) — real program, video upload, real-time chat with coach |
| `/coach`       | Coach Dashboard     | **Protected** (coach role only) — real client roster, program assignment, video review queue, real-time chat |

## What's real now

Everything is live against the backend:

- **Auth** — signup/login call the real API, JWT is stored in `localStorage`, and `/dashboard` + `/coach` are protected routes that redirect to `/login` if you're not authenticated (or to the correct dashboard if your role doesn't match).
- **Chat** — real-time via Socket.io, authenticated with your JWT. Message history loads from the backend on open.
- **Video upload** — actually uploads to Cloudinary via the backend, appears in the coach's review queue.
- **Programs** — coach assigns a program to a client from the real roster; the client sees it on their dashboard.
- **Payments** — "Choose Plan" opens a real Razorpay checkout (test mode). On success, it verifies the payment with the backend, which activates the membership on your account.

## Project structure

```
team-paggu/
├── index.html                # includes the Razorpay checkout.js script
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                # React entry point, imports the shared theme
    ├── App.jsx                  # Routes, wrapped in AuthProvider
    ├── lib/
    │   ├── api.js                 # axios instance — auto-attaches JWT to every request
    │   └── socket.js               # authenticated Socket.io client singleton
    ├── context/
    │   └── AuthContext.jsx          # current user, login/signup/logout
    ├── styles/
    │   └── theme.css               # shared colors, fonts, nav/button/section base styles
    ├── components/
    │   ├── Navbar.jsx                # shows Log In vs. logged-in state
    │   ├── Footer.jsx
    │   ├── ProtectedRoute.jsx         # guards /dashboard and /coach by auth + role
    │   └── ChatWidget.jsx             # real-time chat, used in both dashboards
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── MembershipsPage.jsx        # real plans + Razorpay checkout
    │   ├── LoginPage.jsx               # real signup/login
    │   ├── ClientDashboard.jsx         # real program/videos/chat
    │   └── CoachDashboard.jsx          # real roster/assignment/review queue/chat
    └── assets/
        ├── logo.png, hero-bg.png, coach-photo.png, team-photo.jpg
```

## Build for production

```bash
npm run build
```

Output goes to `dist/` — deployable to Vercel, Netlify, or any static host.
Remember to set `VITE_API_URL` / `VITE_SOCKET_URL` to your deployed backend's URL
in your host's environment variable settings.
