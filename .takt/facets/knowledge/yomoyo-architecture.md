# Knowledge: yomoyo-app Architecture

`CLAUDE.md` から抽出した、変更時に必ず尊重すべきアーキテクチャ制約。

## スタック
- Expo / React Native（TypeScript）。パッケージマネージャは pnpm。
- データアクセスは Firebase JS SDK（`firebase` npm パッケージ）を既定とする。
- テストは Jest（`pnpm test`）、Lint は ESLint（`pnpm lint`）、型は `pnpm exec tsc --noEmit`。

## Firebase アーキテクチャルール
- **既定は Firebase JS SDK**（`firebase/firestore` 等）。Firestore は `src/lib/books/readingActivity.ts`。
- ネイティブ RNFirebase を使うのは OS レイヤが本当に必要な箇所のみ:
  - `@react-native-firebase/app`、`@react-native-firebase/auth`（Google/Apple Sign-In の資格情報交換）
  - `@react-native-google-signin/google-signin`、`@invertase/react-native-apple-authentication`
- **新規の `@react-native-firebase/*`（Storage / Analytics / Messaging 等）を承認なく追加しない。**
  既定回答は「JS SDK 等価物を使う、または機能を避ける」。

## iOS ネイティブ統合ルール
- iOS 互換性パッチは必ず `plugins/` に置く。`ios/Podfile` を手編集しない（`expo prebuild` で再生成される）。
- 現行パッチ: `plugins/withFmtConsteval.js`、`plugins/withFirebaseStaticFramework.js`。
- `useFrameworks: "static"` は **維持必須**。Google の FirebaseAuth が Swift を含み静的ライブラリ化できない
  ためで、削除は `pod install` で失敗する。承認なく削除しない。新規の静的フレームワーク要求 pod を追加しない。

## 設定 / env
- Firebase JS SDK は `src/lib/firebase/index.ts` で初期化、`App.tsx` で読み込み。`EXPO_PUBLIC_FIREBASE_*` を参照。
- `app.config.ts` が env 駆動のバンドル ID で `app.json` を上書き（`IOS_BUNDLE_IDENTIFIER` / `ANDROID_PACKAGE_NAME`）。
- dev（yomoyo-d9c4a）/ prod（yomoyo-prod）の Firebase/AdMob/Google 設定は `APP_ENV` で切替。
  開発者固有値は `app.json` に入れず `.env.example` に env として追加する。

## テストのモック
- `firebase/firestore` と `firebase/app` は `package.json` の moduleNameMapper で手動モックに差し替わる。
  新規 firebase 機能を使う場合は `__mocks__/firebase/firestore.js` 等にエクスポートを追加する。
