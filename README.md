# Atlas

Privacy-first automated travel journal. Track trips passively, curate photos on-device, order a print book.

**Codename:** Atlas · **Stack:** Expo (React Native) + TypeScript · **Status:** Functional MVP

## What works

- Trust-first onboarding (location + photo permissions)
- Live trip tracking via `expo-location` (demo simulator on web)
- On-device journaling: GPS points → visit/transit/flight steps
- Heuristic photo curation (junk filter + quality score + clustering)
- Trip timeline with manual step editing
- Book preview + demo checkout (Stripe/POD-ready order model)
- Local-first storage (AsyncStorage) — no Firebase required for MVP

## Spec changes vs original PRD

| PRD | MVP choice | Why |
|-----|------------|-----|
| Firebase Cloud Functions journaling | On-device `JournalingService` | Privacy + works offline + no backend setup |
| CoreML / TFLite photo models | Heuristic curation | Ships without native model packaging |
| Mapbox | Lightweight map UI + demo path | No token required for MVP |
| Stripe + Lulu live checkout | Demo checkout with real order model | Same UI/data shape; wire keys later |
| Always-on background GPS | `expo-location` + Paris demo simulator | Verifiable on web and devices |

## Run

```bash
npm install
npx expo start
```

- iOS Simulator: `i`
- Android: `a`
- Web: `w` (demo mode uses a Paris walking path)

## Scripts

```bash
npm run typecheck
node scripts/web-e2e.mjs   # requires Expo web on :8081
```

## Project layout

```
src/
  context/       App state
  models/        Trip, Step, Photo, BookOrder…
  navigation/    Onboarding + tabs + stacks
  screens/       Onboarding, Home, Trip, Book, Settings
  services/      Tracker, Journaling, Curation, Trip, Book, Permissions
  theme/         Design tokens
  utils/         Storage, helpers, constants
```

## Privacy

Photo analysis and location processing stay on-device. Photos are never uploaded. Book checkout only sends trip metadata + selected photo references when you place an order (demo mode keeps everything local).
