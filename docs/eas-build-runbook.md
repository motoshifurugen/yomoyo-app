# よもーよ / Yomoyo — Expo EAS 本番ビルド & ストア申請 ランブック

対象: iOS (App Store) / Android (Google Play) の**申請可能な本番ビルド**を、ソロ開発の CEO がゼロから作るまで。
検証元: `main` の `eas.json` / `app.config.ts` / `app.json` / `.firebaserc` を実読して作成。

> リポジトリからの確認事実（重要）
> - Expo SDK **54** / `eas.json` の CLI 要件 **>= 16.0.0** / `appVersionSource: "remote"`。
> - 本番プロファイル `production`: `autoIncrement: true`、`APP_ENV=production`、Firebase は **`yomoyo-prod`** を指す `EXPO_PUBLIC_*`、AdMob 本番 App ID、Google Web Client ID を注入。
> - `submit.production` は **空**（＝申請設定は未記入。Step 6 で埋める）。
> - `app.config.ts`: `APP_ENV=production` のとき `GoogleService-Info.prod.plist` / `google-services.prod.json` を選択。これらは **`.gitignore` 済み**（`GoogleService-Info.*.plist` / `google-services.*.json`）→ 手動配置か EAS シークレットが必須。
> - bundle id / package = **`com.furugenisland.yomoyo`**（iOS/Android 共通）。
> - `app.json` に **`ios.appleTeamId = "7V3MCCJ4SW"`**、`owner = "cocoa_hearts"`、`extra.eas.projectId = "71ec785f-5e72-4040-a14e-c0542ab07ae9"` が**既に設定済み**（＝プロジェクトは Expo にリンク済み。Apple Team ID も既知）。
> - `.firebaserc`: development=`yomoyo-d9c4a` / production=`yomoyo-prod`。

---

## Step 0. 用語の前提（EAS が初めての人向け）

- **EAS Build** = Expo のクラウドで .ipa（iOS）/ .aab（Android）を作るサービス。ローカルの Xcode/Android Studio は不要。
- **EAS Submit** = 作った成果物を App Store Connect / Google Play に自動アップロードするサービス。
- **managed credentials** = 署名証明書・鍵を EAS が生成・保管してくれるモード（推奨）。手元で証明書を管理しなくてよい。
- このリポは既に `owner=cocoa_hearts` / `projectId` 付き。**必ず `cocoa_hearts` アカウントでログイン**すること（別アカウントだと後述のクレデンシャルが噛み合わない）。

---

## Step 1. 前提条件のセットアップ

### 1-1. eas-cli のインストールとログイン
```sh
npm install -g eas-cli
eas --version    # 16.x 以上であること（eas.json の cli.version >= 16.0.0）
eas login        # ← Expo アカウント cocoa_hearts でログイン  ★要入力（cocoa_hearts の資格情報）
eas whoami       # cocoa_hearts が表示されればOK
```

### 1-2. プロジェクトリンクの確認
`app.json` に `projectId` があるため `eas init` は原則不要。念のため確認:
```sh
eas project:info   # Yomoyo / projectId 71ec785f-... が出ればリンク済み
```
> もし別アカウントで作り直すことになった場合のみ `eas init` を実行（既存 projectId を上書きする点に注意）。

### 1-3. ストア側の登録（申請前に必須・審査に数日かかることあり）
- **Apple Developer Program**（年 $99）に加入。Team ID は既に `7V3MCCJ4SW`。
- **App Store Connect** で「Yomoyo」アプリレコードを作成（bundle id `com.furugenisland.yomoyo`）。ここで採番される **App ID（ascAppId）** は **★要入力**（Step 6 で使用）。
- **Google Play Console**（初回登録 $25）に加入し、`com.furugenisland.yomoyo` でアプリを作成。
- Google Play への `eas submit` 用に **サービスアカウント JSON** が必要（Step 6 で作成）。

---

## Step 2. gitignore された google-services ファイルの扱い（本番の要）

`app.config.ts` は本番で以下を読む。両方とも Git 管理外なので、**EAS のクラウドビルドに届ける必要がある**。

- iOS: `./GoogleService-Info.prod.plist`
- Android: `./google-services.prod.json`

### 2-1. 取得
Firebase Console → プロジェクト **`yomoyo-prod`** → プロジェクトの設定 → マイアプリ:
- iOS アプリ（bundle `com.furugenisland.yomoyo`）から `GoogleService-Info.plist` をダウンロード → **`GoogleService-Info.prod.plist` にリネーム**。
- Android アプリ（package `com.furugenisland.yomoyo`）から `google-services.json` をダウンロード → **`google-services.prod.json` にリネーム**。

> 注意: 取り違え防止。`yomoyo-prod`（本番）から取ること。`yomoyo-d9c4a`（dev）のファイルを入れると本番ビルドが dev DB を叩く。

### 2-2. EAS への届け方 — **推奨: EAS File Secrets**
ローカル配置でもビルドは通るが、CI/クリーン環境の再現性・秘匿性のため **EAS のファイルシークレット**を推奨。`app.config.ts` が参照する**相対パスに一致するキー名**で登録するとビルド時にルートへ復元される。

```sh
# iOS
eas secret:create --scope project \
  --name GoogleService-Info.prod.plist \
  --type file --value ./GoogleService-Info.prod.plist

# Android
eas secret:create --scope project \
  --name google-services.prod.json \
  --type file --value ./google-services.prod.json

eas secret:list   # 2件登録されたか確認
```
> 代替（ローカル配置）: 上の2ファイルをリポジトリのルートに置いたままビルドすれば読まれる。手軽だが「手元にしか無い＝紛失/取り違えリスク」。ソロでもシークレット方式を推奨。
>
> 補足: `.env` の `EXPO_PUBLIC_FIREBASE_*` はビルドには不要（本番値は `eas.json` の `production.env` に直書き済み）。ローカル `expo start` 用のみ。

---

## Step 3. 署名クレデンシャル（EAS managed 推奨）

初回の `eas build` 実行時に対話で自動生成される。**Remote(EAS 管理)を選べば手元で証明書を触らない。**

- **iOS**: Apple ログインを求められる → Distribution Certificate と Provisioning Profile を EAS が生成・保管。Apple Team は `7V3MCCJ4SW`。App Store 配布用プロファイルが自動で作られる。
- **Android**: Upload Keystore を EAS が生成・保管（**この鍵は再発行できないので EAS 管理に任せるのが安全**）。

事前に中身を見たい/確認したい場合:
```sh
eas credentials         # 対話で platform を選び現在の資格情報を確認
```
> Apple のログインには Apple ID（2FA）が **★要入力**。App-specific password を使うと非対話で通しやすい。

---

## Step 4. バージョン & ビルド番号（`appVersionSource: remote` + `autoIncrement`）

意味:
- **`appVersionSource: "remote"`** … `app.json` の `version`（現在 `1.0.0`）や iOS `buildNumber` / Android `versionCode` を**手で上げる必要はなく、EAS サーバー側が採番・管理**する。ローカルの数字は無視される。
- **`production.autoIncrement: true`** … 本番ビルドのたびに **build number / versionCode が自動で +1** される。「同じ番号で再アップロードして弾かれる」事故を防ぐ。

CEO の作業:
- 通常は**何もしなくてよい**（番号は自動）。
- ユーザー向け表示バージョン（例 `1.0.0 → 1.1.0`）を上げたいときだけ、機能追加の節目に:
  ```sh
  eas build:version:set --platform ios     # 表示versionやbuild番号をリモートに設定
  eas build:version:set --platform android
  ```
  （マーケ的な version は自分で決める **★要入力**。ビルド番号は自動でよい。）

---

## Step 5. 本番ビルドの実行

各プラットフォームを個別に。初回は Step 3 のクレデンシャル対話が入る。

```sh
# iOS（App Store 配布用 .ipa）
eas build --profile production --platform ios

# Android（Google Play 用 .aab）
eas build --profile production --platform android
```
まとめて回すなら:
```sh
eas build --profile production --platform all
```
- 進捗はターミナルのリンク（expo.dev のビルドページ）で確認。完了まで十数分〜。
- 成功後、`eas build:list` で成果物 URL を確認できる。

> ビルド時に `production.env` が効くため、この成果物は **`yomoyo-prod` を指し、AdMob 本番 App ID** で焼かれる（Step 7 で検証）。

---

## Step 6. `submit.production` を埋めて申請

現状 `eas.json` の `submit.production` は空。以下を追記する（**★要入力**箇所あり）。

```jsonc
"submit": {
  "production": {
    "ios": {
      "appleId": "APPLE_ID_EMAIL",          // ★要入力: Apple ID(メール)
      "ascAppId": "APP_STORE_CONNECT_APP_ID", // ★要入力: App Store Connect のアプリApple ID(数字)
      "appleTeamId": "7V3MCCJ4SW"           // 既知(app.json と一致)
    },
    "android": {
      "serviceAccountKeyPath": "./play-service-account.json", // ★要入力: 下記で作成
      "track": "internal"   // まず internal / closed testing から。公開は production
    }
  }
}
```

### Android サービスアカウント JSON の作り方（★要入力の実体）
1. Google Play Console → 設定 → API アクセス → 新しいサービスアカウントを Google Cloud で作成。
2. 作成した SA に「リリース管理」権限を付与。
3. Cloud Console で JSON 鍵をダウンロード → `play-service-account.json` としてローカル配置（**commit しないこと**。パスを合わせるかシークレット化推奨）。

### 申請コマンド
```sh
# iOS（App Store Connect へアップロード）
eas submit --profile production --platform ios --latest

# Android（Google Play の指定トラックへ）
eas submit --profile production --platform android --latest
```
> `--latest` で Step 5 の最新ビルドを使用。特定ビルドを指定したい場合は `--id <build-id>`。

---

## Step 7. 申請前チェックリスト（このアプリ固有の紐付け込み）

- [ ] **本番プロジェクト検証**: ビルドログ or 実機で Firebase が **`yomoyo-prod`** を指すか（`EXPO_PUBLIC_FIREBASE_PROJECT_ID=yomoyo-prod`）。dev の `yomoyo-d9c4a` になっていないこと。
- [ ] **google-services 整合**: iOS=`GoogleService-Info.prod.plist` / Android=`google-services.prod.json` が **prod プロジェクト由来**（Step 2）。
- [ ] **AdMob 本番 ID**: `eas.json` の `EXPO_PUBLIC_ADMOB_*_APP_ID`（`~4061380533` / `~8730377571`）が使われ、**`app.config.ts` のフォールバック（Google のテスト用 `ca-app-pub-3940256099942544~...`）に落ちていない**こと。広告ユニット側もテスト ID でないか確認。
- [ ] **ストアメタデータ**: アプリ名・説明・カテゴリ（読書/ソーシャル）、年齢レーティング。
- [ ] **スクリーンショット**: iPhone 各サイズ / Android。
- [ ] **プライバシーポリシー & 利用規約 URL**: 両ストア必須（**★要入力**の公開 URL）。広告 + アカウント連携 + カメラ利用があるため必須級。
- [ ] **App Store: Data Privacy（Nutrition Label）**: Firebase Auth・AdMob のデータ収集を申告。
- [ ] **Google Play: Data Safety フォーム**: 同上を申告。
- [ ] **Apple Sign In**: `app.json` で `usesAppleSignIn: true`。Google ログインを出すなら **Apple Sign In の提供が Apple 審査で必須**（既に対応済み構成）。
- [ ] **ATT（トラッキング許可）**: `expo-tracking-transparency` あり。広告計測のため ATT プロンプトが出る。App Privacy と整合させる。

---

## Step 8. この構成で特にハマりやすい落とし穴

1. **google-services の取り違え / 未配置** — 最頻。dev(`yomoyo-d9c4a`) のファイルを本番に入れる、またはシークレット/ローカルどちらにも無くビルドがデフォルト(dev)を拾う。→ Step 2 のシークレット名は `app.config.ts` の相対パスと**完全一致**必須。
2. **`APP_ENV` が立っていない** — `--profile production` を使えば `eas.json` が `APP_ENV=production` を注入するので OK。だが profile 無し/preview で回すと **dev 構成のまま**焼ける。本番は必ず `--profile production`。
3. **AdMob テスト ID のまま出荷** — env が効かないと**広告が出ない/収益ゼロ**。逆に審査中に本物広告をクリックするとポリシー違反リスク → 申請前は挙動確認、公開後に収益計測。
4. **`expo-dev-client` プラグインが本番に混入** — `production` プロファイルは `developmentClient` を立てないのでリリース版になるが、成果物のプロファイルが production であることを確認。
5. **owner アカウント不一致** — `owner=cocoa_hearts`。別 Expo アカウントだと credentials/secret/projectId が噛み合わずビルド失敗。`eas whoami` を毎回確認。
6. **Apple/Google 審査（読書 SNS + 広告 特有）**
   - Apple: UGC がある場合は**通報/ブロック/不適切コンテンツ対策**が無いと Guideline 1.2 で差し戻し。ATT 文言と実挙動の一致も要確認。Apple Sign In は提供済み。
   - Google: **Data Safety** の不備、AdMob 広告ポリシー（誤クリック誘発 UI 禁止）、ターゲット SDK 要件の追随。
   - 両ストア: **プライバシーポリシー/ToS の実在 URL** が無いと即差し戻し。

---

## 付録: コマンド早見表
```sh
# 準備
npm install -g eas-cli && eas login && eas whoami
eas project:info

# シークレット（本番 google-services）
eas secret:create --scope project --name GoogleService-Info.prod.plist --type file --value ./GoogleService-Info.prod.plist
eas secret:create --scope project --name google-services.prod.json --type file --value ./google-services.prod.json
eas secret:list

# クレデンシャル確認
eas credentials

# 本番ビルド
eas build --profile production --platform ios
eas build --profile production --platform android
eas build:list

# 申請（eas.json の submit.production を埋めてから）
eas submit --profile production --platform ios --latest
eas submit --profile production --platform android --latest
```

**★要入力 サマリ**: (1) Expo `cocoa_hearts` 資格情報 / (2) Apple ID + App-specific password / (3) App Store Connect の ascAppId(数字) / (4) Google Play サービスアカウント JSON / (5) プライバシーポリシー & 利用規約の公開 URL / (6) マーケ表示バージョン（任意）。Apple Team ID は `7V3MCCJ4SW` で既知。
