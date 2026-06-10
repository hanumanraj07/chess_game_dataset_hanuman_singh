# ♟ Chess Match Analytics — Frontend

A **production-ready, brutalist-styled** Chess Match Analytics dashboard built with React 18 + Vite, fully integrated with a live MongoDB backend.

> **Live Backend:** `https://chess-dataset.onrender.com`
> **API Docs:** [Postman Collection](https://documenter.getpostman.com/view/50839390/2sBXwnuCeK)

---

## 🎨 Design System

Brutalist UI — off-white & deep green palette, thick black borders (2–6px), hard offset drop-shadows, zero border-radius, monospaced fonts (`Space Mono`, `IBM Plex Mono`, `Courier Prime`), uppercase labels.

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI Framework |
| Vite | 8 | Build Tool |
| Tailwind CSS | v4 | Utility CSS |
| MUI | 9 | Overridden UI primitives |
| Redux Toolkit | 2 | State Management |
| React Router | 7 | Routing |
| Axios | 1 | HTTP Client |
| Formik + Yup | 2/1 | Forms + Validation |
| Recharts | 3 | Charts |
| React Hot Toast | 2 | Notifications |
| React Helmet Async | 3 | SEO |
| Lucide React | 1 | Icons |
| JWT Decode | 4 | Token parsing |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/    Sidebar, Navbar, DashboardLayout, route guards
│   └── ui/        Button, Input, Card, Table, Modal, Badge, Pagination, Skeleton
├── features/
│   ├── auth/      LoginPage, RegisterPage
│   ├── admin/     AdminDashboard, UsersManagement
│   ├── matches/   MatchesPage (full CRUD), MatchDetail
│   ├── players/   PlayersPage, PlayerDetail
│   ├── openings/  OpeningsPage
│   ├── analytics/ AnalyticsDashboard
│   ├── search/    SearchPage
│   └── profile/   ProfilePage, SettingsPage
├── hooks/         useAuth, usePagination, useDebounce
├── services/      api.js (Axios), auth/match/player/opening/analytics/search services
├── store/         Redux store + slices (auth, match, player, ui)
├── styles/        globals.css (CSS vars), brutalist.css (component styles)
└── utils/         formatters.js, constants.js
```

---

## 🚀 Installation

```bash
# 1. Clone and navigate
git clone <repo-url>
cd chess-analytics-frontend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Start dev server
npm run dev
# → http://localhost:5173
```

---

## 🗂️ Features

- ✅ **JWT Auth** — Login / Register with token stored in `localStorage`
- ✅ **Role-based routing** — Admin routes blocked for regular users
- ✅ **Admin Dashboard** — Stats cards, victory pie chart, openings bar chart, recent matches, backend health
- ✅ **Matches** — Full CRUD: paginated table, search, filters (rated/type/result/sort), create/edit modals, delete confirmation
- ✅ **Players** — Grid/list view toggle, player cards with stats, player detail with charts
- ✅ **Openings** — Sortable table with ECO codes, win rates, top 10 chart
- ✅ **Analytics** — Victory distribution, opening success rates, rating analysis, time control breakdown
- ✅ **Search** — Debounced global search across matches/players/openings, tab filters
- ✅ **Users (Admin)** — User management with delete
- ✅ **Profile & Settings** — Edit profile, theme toggle (light/dark), page size preferences
- ✅ **Dark Mode** — Full CSS variable dark theme toggle
- ✅ **Brutalist Design** — Consistent across all 11 pages
- ✅ **Skeleton Loaders** — Shown during all API calls
- ✅ **Toast Notifications** — On all CRUD operations and auth events
- ✅ **Debounced Search** — 300ms debounce on all search inputs
- ✅ **SEO** — React Helmet on all pages
- ✅ **Lazy Loading** — All page-level components

---

## 🌐 API Endpoints

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/v1/auth/login`, `/auth/register` |
| Matches | `GET/POST/PUT/DELETE /api/v1/matches` |
| Players | `GET /api/v1/players`, `/players/:id` |
| Openings | `GET /api/v1/openings` |
| Analytics | `GET /api/v1/analytics/victories`, `/openings`, `/ratings`, `/stats` |
| Search | `GET /api/v1/search/matches|players|openings?q=` |
| Admin | `GET/DELETE /api/v1/admin/users` |

---

## 🔒 Environment Variables

```env
VITE_API_BASE_URL=https://chess-dataset.onrender.com/api/v1
VITE_BACKEND_URL=https://chess-dataset.onrender.com
```

---

## 📦 Build & Deploy

```bash
# Production build
npm run build

# Preview build
npm run preview

# Deploy dist/ folder to Render/Vercel/Netlify
```

---

## 🖼️ Screenshots

> _Login Page, Dashboard, Matches Table, Analytics Charts — see app at http://localhost:5173_

---

*Built with the Chess Match Analytics Brutalist Design System — Raw. Bold. Functional.*
