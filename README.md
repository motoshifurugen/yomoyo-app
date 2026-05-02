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

## iOSアプリ起動・開発手順

**前提ツール:** Node.js、pnpm、Xcode（iOS）

### 1. pnpmインストール
```sh
brew install pnpm
```

### 2. 依存関係のインストール

```sh
pnpm install
```

依存関係でエラーが出る場合、以下で手動承認
```sh
pnpm approve-builds
```

### 3. 環境変数と Firebase / Google Sign-In の設定

#### 2-1. 環境変数
`.env.example` を `.env` にコピーし、必要な値を設定します。

```sh
cp .env.example .env
```

最低限、以下を設定する。
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

[Google Cloud(yomoyo)](https://console.cloud.google.com/welcome?project=yomoyo-d9c4a) > APIとサービス > 認証情報 > OAuth 2.0 クライアント ID のウェブアプリケーションタイプ

#### 2-2. Firebase 設定ファイル
Firebase Console から取得した以下のファイルを **プロジェクトルート** に配置します。（以下ファイルはGitで管理しないこと）

- `google-services.json`
- `GoogleService-Info.plist`

### 4. iPhone実機検証用設定

socatをインストール
```sh
brew install socat
```

```sh
socat TCP-LISTEN:7431,bind=172.20.10.9,fork,reuseaddr TCP:127.0.0.1:7430
```

このターミナルは閉じない。

### 5. ビルドする

```sh
pnpm run prebuild
```

### 6. iOS で起動する

実機を使う場合は、iPhone を Mac に接続し、必要に応じて「このコンピュータを信頼」を許可してから実行

```sh
pnpm run ios
```

※ 2回目以降、ネイティブに依存しない機能のみの変更時は以下で十分

```sh
pnpm run start
```
