# Atlas

Privacy-first travel companion: **plan the trip**, then let Atlas **journal it** into a print-ready book.

**Codename:** Atlas · **Stack:** Expo (React Native) + TypeScript · **Status:** Functional MVP (plan + journal)

## What works

- Trust-first onboarding (location + photo permissions)
- **Discover & plan:** destination catalog, Ask Atlas…, plan wizard, day itinerary
- **Plan → travel:** start a planned trip to begin live journaling
- Live trip tracking via `expo-location` (demo simulator on web)
- On-device journaling: GPS points → visit/transit/flight steps
- Heuristic photo curation (junk filter + quality score + clustering)
- Trip timeline with manual step editing
- Book preview + demo checkout (Stripe/POD-ready order model)
- Local-first storage (AsyncStorage) — no Firebase required for MVP
- **Phase 2 agent layer:** Ask Atlas chat with weather (Open-Meteo), trending activities, and flight/hotel deep-links (no OTA checkout)

## Spec changes vs original PRD

| PRD | MVP choice | Why |
|-----|------------|-----|
| Journal-only (no planning) | Plan + journal loop | Users need help before and after the trip |
| Firebase Cloud Functions journaling | On-device `JournalingService` | Privacy + works offline + no backend setup |
| CoreML / TFLite photo models | Heuristic curation | Ships without native model packaging |
| Mapbox | Lightweight map UI + demo path | No token required for MVP |
| Stripe + Lulu live checkout | Demo checkout with real order model | Same UI/data shape; wire keys later |
| Always-on background GPS | `expo-location` + Paris demo simulator | Verifiable on web and devices |
| Live OTA booking | Planning stubs + partner deep-links | Search/compare elsewhere; Atlas stays plan + journal |
| External LLM agent | On-device intent agent + tools | Works offline-first; no API key required for MVP |

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
  context/       App state (trips, planning, onboarding)
  data/          Destination catalog + Ask Atlas parser
  models/        Trip, ItineraryItem, Step, Photo, BookOrder…
  navigation/    Onboarding + tabs + stacks
  screens/       Onboarding, Home/Discover, Plan, Trip, Book, Settings
  services/      Tracker, Journaling, Curation, Trip, Plan, Book, Permissions
  theme/         Design tokens (forest Atlas brand)
  utils/         Storage, helpers, constants
```

## Privacy

Photo analysis and location processing stay on-device. Photos are never uploaded. Book checkout only sends trip metadata + selected photo references when you place an order (demo mode keeps everything local).
