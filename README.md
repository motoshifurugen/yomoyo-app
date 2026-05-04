# Yomoyo

A warm reading app where one person's reading quietly inspires another to read.

## Concept

One app, one role.

Yomoyo exists for one thing: the quiet spread of reading between people. When someone you follow finishes a book, that simple signal can become the start of your own reading — "maybe I'll read that too." No reviews required. No ranking. Just a gentle presence.

The real world is the center. The app gently supports it.

We want something people can use without being told how — intuitive before instructional, calm before clever. When an app over-organizes information, users spend energy deciding how to sort things rather than just reading. Yomoyo avoids that.

## What We Value

- Single focused role — no feature overload
- Quiet, warm experience over engagement metrics
- Lightweight actions — a single tap is enough
- Cognitive lightness — no sorting overhead, no organizational burden
- The real-world act of reading as the center
- Intuitive before instructional
- Emotional warmth over social performance

## What We Avoid

- Feature bloat and all-in-one creep
- Over-organized systems that force users to sort or categorize
- Noisy SNS patterns or aggressive engagement loops
- Review-heavy or rating-heavy UX
- Competitive reading metrics or streaks
- Ads that interrupt emotionally important moments
- Premature architecture or doc sprawl

## Notification Philosophy

Notifications are intentionally limited.

One event triggers a notification: someone you follow has **finished a book**.

Not started. Not bookmarked. Finished.

Notifications only come from people you actively follow. No algorithmic suggestions, no strangers.

## Ad Policy

Yomoyo is ad-supported. Ads must never break the emotional experience of reading.

**Ads are never shown:**
- During onboarding or first launch
- On the login or signup screen
- Immediately after logging a book start or finish
- In any flow that carries emotional weight for the user

**Ads may appear** in natural pause points: between feed items (not at the very top), in the settings screen, or in other low-sensitivity surfaces.

Paid ad removal may be considered in a future version. For now, ads stay rare and tasteful.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Mobile | React Native |
| Backend / Auth | Firebase |
| Target platforms | iOS + Android |
| Target market | Global |
| i18n | First-class concern from day one |

Multilingual support is built in from the start, not added later.

### Localization rule

All user-facing strings must be provided in both Japanese and English.
Do not add new UI text in only one language.
When adding or updating a screen or component, update both `src/lib/i18n/locales/en.ts` and `src/lib/i18n/locales/ja.ts`.

## Development Approach

- 2-person team
- Agile, issue-based iteration
- Claude + Cursor as development partners
- Small PRs, short cycles
- Durable decisions documented in GitHub Issues — not in premature docs

## GitHub Workflow

1. Pick an issue from the project board
2. Branch off `main`
3. Small, focused PR
4. Review → merge → close issue
5. Significant decisions get a comment in the issue; no separate decision documents

## Development Setup

**Prerequisites:** Node.js, pnpm, Xcode (for iOS)

### 1. Install dependencies

```sh
pnpm install
```

If prompted to approve native build scripts:

```sh
pnpm approve-builds
```

### 2. Configure environment

```sh
cp .env.example .env
```

Fill in all values. Key items:

- `IOS_BUNDLE_IDENTIFIER` / `ANDROID_PACKAGE_NAME` — use your own unique ID (e.g. `com.yourname.yomoyo`) to avoid collisions with other developers
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google Cloud Console → Credentials → OAuth 2.0 → Web application
- `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` — Google Cloud Console → Credentials → API key
- `EXPO_PUBLIC_FIREBASE_*` — Firebase Console → Project settings → Your apps → `GoogleService-Info.plist`

### 3. Place Firebase config files

Get these from the Firebase Console and place them at the project root (do not commit):

- `GoogleService-Info.plist`
- `google-services.json`

### 4. Build native project

```sh
pnpm run prebuild
cd ios && pod install && cd ..
```

### 5. Run on device

Connect your iOS device, then:

```sh
pnpm run ios
```

---

## Daily Development

**JS-only changes** — no native rebuild needed:

```sh
pnpm run start
```

**After env-only changes** (`EXPO_PUBLIC_*` values) — clear Metro cache:

```sh
pnpm run start --clear
```

**After native changes** (new packages with native modules, plugin config, or `.env` identifier changes):

```sh
pnpm run prebuild
cd ios && pod install && cd ..
pnpm run ios
```

---

## Network Issues

If your device cannot reach Metro on the local network, switch your Mac to your iPhone's personal hotspot and restart Metro. Tunnel mode (`--host tunnel`) is a last resort.