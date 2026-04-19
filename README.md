# Yomoyo

A warm reading app where one person's reading quietly inspires another to read.

## Concept

Reading is softly social.

When a friend starts or finishes a book, that simple fact can become the start of your own reading journey — "maybe I'll read that too." Yomoyo is a space where those quiet signals travel between people, without noise, without reviews, without competition.

## What We Value

- Warm, calm, gentle experience
- Quiet propagation of reading activity between friends
- Lightweight actions — a single tap is enough
- Emotional warmth over engagement metrics
- The feeling of a quiet library, not a noisy social feed

## What We Avoid

- Noisy SNS patterns or aggressive engagement loops
- Review-heavy or rating-heavy UX
- Competitive reading metrics or streaks
- Ads that interrupt emotionally important moments
- Feature bloat and premature architecture

## Tech Stack

| Layer | Choice |
|-------|--------|
| Mobile | React Native |
| Target platforms | iOS + Android |
| Target market | Global |
| i18n | First-class concern from day one |

Multilingual support is built in from the start, not added later.

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

## Ad Policy

Yomoyo is ad-supported. Ads must never break the emotional experience of reading.

**Ads are never shown:**
- During onboarding or first launch
- On the login or signup screen
- Immediately after logging a book start ("I started reading this")
- Immediately after logging a book finish ("I finished this")
- In any flow that carries emotional weight for the user

**Ads may appear** in natural pause points: between feed items (not at the very top), in the settings screen, or in other low-sensitivity surfaces.

Paid ad removal may be considered in a future version. For now, ads stay rare and tasteful.

## Next Focus

- App bootstrap and navigation shell
- Authentication (social login)
- Book search integration
- Core reading activity logging (start / finish)
