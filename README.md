# Couply App

React Native mobile client for Couply — a shared finance app for couples. Tracks shared and personal expenses, shows real-time balance between partners, and supports flexible split modes (equal, custom, or proportional to income).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 (React Native) |
| Language | TypeScript (strict) |
| Navigation | React Navigation v6 (native-stack + bottom-tabs) |
| UI | React Native Paper (Material Design 3) |
| State | Zustand + AsyncStorage (persist) |
| HTTP | Axios (Bearer interceptor + 401 token refresh) |
| Auth | Firebase JS SDK v10 (modular) |
| Forms | React Hook Form |
| i18n | i18next + react-i18next + expo-localization |
| Fonts | DM Serif Display + DM Sans (expo-google-fonts) |
| Testing | Jest + React Native Testing Library |
| Config | app.config.js + dotenv (.env) |

---

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator, or physical device with Expo Go
- A Firebase project with Web SDK configuration
- The `couply-api` backend running locally or deployed

---

## Local Setup

### 1. Install dependencies

```bash
cd couply-app
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

> **Important**: When testing on a physical device, set `API_BASE_URL` to your machine's local IP address (e.g. `http://192.168.1.x:8000`), not `localhost`. The device cannot reach the host machine via `localhost`.

### 3. Start the development server

```bash
npx expo start
```

Press `i` for iOS Simulator, `a` for Android, or scan the QR code with Expo Go on a physical device.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `FIREBASE_API_KEY` | Firebase Web API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |
| `API_BASE_URL` | Backend base URL (e.g. `http://192.168.1.x:8000`) |

Copy `.env.example` → `.env` and fill in all values before running.

---

## Running Tests

```bash
npm test               # run all tests
npm test -- --watch    # watch mode
npm test -- --coverage # with coverage report
```

Tests use React Native Testing Library with mocked API calls and navigation. No real network or Firebase calls are made.

---

## Project Structure

```
couply-app/
├── src/
│   ├── api/
│   │   ├── client.ts                  # Axios instance — Bearer interceptor + 401 token refresh
│   │   └── endpoints/
│   │       ├── auth.ts                # register (409→getMe fallback), getMe, updateMe
│   │       ├── couple.ts              # create, join, get, updateSplit
│   │       ├── expenses.ts            # list, create, update, delete
│   │       └── balance.ts             # get (GET /balance)
│   ├── i18n/
│   │   ├── index.ts                   # i18next init — auto-detects device language
│   │   └── locales/
│   │       ├── en.json                # English strings
│   │       └── es.json                # Spanish strings
│   ├── lib/
│   │   └── firebase.ts                # Firebase v10 modular init — exports firebaseAuth
│   ├── navigation/
│   │   └── index.tsx                  # Root navigator — auth/app stack switch
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx      # App landing page
│   │   │   ├── LoginScreen.tsx        # Email + password login
│   │   │   └── RegisterScreen.tsx     # Account creation
│   │   └── app/
│   │       ├── HomeScreen.tsx         # Balance dashboard + recent expenses + settle up
│   │       ├── ProfileScreen.tsx      # User profile, split mode, logout
│   │       ├── couple/
│   │       │   ├── CoupleWelcomeScreen.tsx       # Create or join a couple entry point
│   │       │   ├── CreateCoupleScreen.tsx         # Generate invite code + poll for partner
│   │       │   ├── JoinCoupleScreen.tsx           # Enter invite code to join
│   │       │   ├── SplitSetupScreen.tsx           # Choose split mode (couple creator)
│   │       │   └── PartnerSplitReviewScreen.tsx   # Second partner accepts/declines proposal
│   │       └── expenses/
│   │           ├── ExpensesListScreen.tsx         # Shared/personal expense list with filters
│   │           ├── AddExpenseScreen.tsx           # Create new expense
│   │           └── EditExpenseScreen.tsx          # Edit or delete existing expense
│   ├── store/
│   │   └── useAuthStore.ts            # Zustand + persist — user, token, couple, coupleSetupComplete
│   ├── theme/
│   │   └── index.ts                   # Colors, FontFamily, FontSize, Spacing, BorderRadius, paperTheme
│   └── types/
│       └── index.ts                   # All shared TypeScript interfaces and navigation param lists
├── App.tsx                            # Fonts + SplashScreen + PaperProvider + RootNavigator
├── app.config.js                      # Dynamic Expo config — reads Firebase vars from .env
├── babel.config.js                    # module-resolver: '@/' → 'src/'
├── tsconfig.json                      # strict + paths alias @/*
├── jest.config.js                     # Jest config for Expo
├── .env.example                       # Documents required env vars
└── package.json
```

---

## Navigation Structure

```
RootStack
├── Auth (not authenticated)
│   ├── Welcome
│   ├── Login
│   └── Register
└── App (authenticated)
    ├── MainTabs (couple setup complete)
    │   ├── Home          → HomeScreen
    │   ├── Expenses      → ExpensesStack
    │   │   ├── ExpensesList
    │   │   ├── AddExpense
    │   │   └── EditExpense
    │   └── Profile       → ProfileScreen
    └── Couple setup flow (no couple yet)
        ├── CoupleWelcome
        ├── CreateCouple
        ├── JoinCouple
        ├── SplitSetup
        └── PartnerSplitReview
```

---

## Key Architecture Decisions

- **Conditional screen registration** (not `navigate()`) for auth/app switch — React Navigation v6 best practice; avoids race conditions.
- **`isLoading: true`** default in Zustand prevents AuthStack flash before AsyncStorage hydration completes.
- **`useAuthStore.getState()`** (not the hook) used inside Axios interceptors — outside React component tree.
- **401 interceptor** calls `firebaseAuth.currentUser.getIdToken(true)` to force-refresh the token, retries once (`_retry` flag). On failure → `clearAuth()`.
- **409 fallback** in `authApi.register()`: on app reinstall, Firebase account exists but the backend returns 409 → falls back to `GET /auth/me` automatically.
- **`coupleSetupComplete`** flag in Zustand gates navigation to MainTabs — set only after both partners have accepted a split mode.
- **Firebase JS SDK v10 modular only** — no `firebase/compat`. Tree-shaking + future-proof.
- **`@/` path alias** configured in both `tsconfig.json` (paths) and `babel.config.js` (module-resolver).
- All colors sourced from `Colors` in `src/theme/index.ts` — never hardcoded in components.

---

## Design System

| Token | Value |
|-------|-------|
| `Colors.background` | `#FAFAF8` |
| `Colors.primary` | `#4A7C59` (sage green) |
| `Colors.accent` | `#C4714A` (terracotta) |
| `Colors.text` | `#1A1A1A` |
| `Colors.textMuted` | `#6B7280` |
| `Colors.surface` | `#FFFFFF` |
| `FontFamily.display` | `DMSerifDisplay_400Regular` |
| `FontFamily.bodyRegular` | `DMSans_400Regular` |
| `FontFamily.bodyMedium` | `DMSans_500Medium` |
| `FontFamily.bodyBold` | `DMSans_700Bold` |

---

## Features

- **Auth**: Firebase email/password login and registration with backend user sync
- **Couple setup**: Create a couple (generates invite code), join via invite code, choose split mode
- **Split modes**: Equal (50/50), Custom (user-defined percentages), Auto (proportional to salary)
- **Split review**: Second partner reviews and accepts or declines the proposed split
- **Expenses**: Create, edit, and delete shared or personal expenses with category, date, paid-by, and optional custom split
- **Balance dashboard**: Real-time balance card showing who owes whom and how much
- **Settle up**: One-tap debt settlement that creates a zero-balance settlement expense
- **Filters**: Filter expenses by type (shared/personal) and month
- **i18n**: English and Spanish, auto-detected from device locale
