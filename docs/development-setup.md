## 開発セットアップ

**前提条件:** Node.js, pnpm, Xcode (for iOS)があること。

### 1. 依存パッケージのインストール

```sh
pnpm install
```

ビルドの承認を求められた場合は追加で以下を実行:

```sh
pnpm approve-builds
```

### 2. 環境変数の設定

```sh
cp .env.example .env
```

.envファイルを開いて、以下を埋めること:

- `IOS_BUNDLE_IDENTIFIER` / `ANDROID_PACKAGE_NAME` — 開発者自身のXコードで登録した署名を利用する (例： `com.yourname.yomoyo`) 
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google Cloud Console → Credentials → OAuth 2.0 → Web application
- `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` — Google Cloud Console → Credentials → API key
- `EXPO_PUBLIC_FIREBASE_*` — Firebase Console → Project settings → Your apps → `GoogleService-Info.plist`

### 3. FirebaseのConfigファイルを設置

FirebaseコンソールからiOSアプリ・アンドロイドアプリの以下設定ファイルをダウンロード後、プロジェクトルートに配置する (Git管理はしない):

- `GoogleService-Info.plist`
- `google-services.json`

### 4. ネイティブ一式（ios/android）をビルド

```sh
pnpm run prebuild
cd ios && pod install && cd ..
```

### 5. スマホで起動

スマホをPCに繋いだ後、以下を実行する:

```sh
pnpm run ios
```

---

## 2回目以降のビルド

**JavaScriptだけの変更** — 再ビルドは不要で、以下を実行すればよい:

```sh
pnpm run start
```

**環境変数の変更** (`EXPO_PUBLIC_*` の値など) — Metroのキャッシュクリアを実行:

```sh
pnpm run start --clear
```

**ネイティブ機能の変更** (新しいパッケージやプラグインの追加、ネイティブ依存の設定変更、署名変更など):

```sh
pnpm run prebuild
cd ios && pod install && cd ..
pnpm run ios
```

## Firebase変更時の反映

通知など、Firebase側の変更をした場合は deploy が必要です。

### 対象になる変更

- Firebase Functions の追加・修正
- Firestore Rules の変更
- Firestore Indexes の追加・修正
- Push通知の server-side ロジック変更
- 読了記録トリガーなど、Firebase上で動く処理の変更

### Firestore Rules を反映

```sh
npx firebase-tools deploy --only firestore:rules --project <your-firebase-project-id>
```

### Firestore Indexes を反映

```sh
npx firebase-tools deploy --only firestore:indexes --project <your-firebase-project-id>
```

### Firebase Functions を反映

```sh
cd functions
npm install
npm run build
cd ..
npx firebase-tools deploy --only functions --project <your-firebase-project-id>
```
