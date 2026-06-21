# Instruction: Security Review

レビュー対象の実装: {previous_response}

## やること（読み取り専用）
1. `git diff` で差分を確認し、`security` ポリシーのコミット前チェックを 1 項目ずつ評価する。
2. 重点: ハードコード秘密情報、外部入力の検証、認証/認可、エラーメッセージの情報漏洩、
   `.env` 等の秘密ファイルがコミットされていないか、Firebase env（`EXPO_PUBLIC_FIREBASE_*`）の扱い。
3. 各項目を Pass / Fail で示し、Fail には深刻度と修正方針を添える。

## 判定
- CRITICAL なセキュリティ問題が無ければ **コミット可** → commit へ。
- CRITICAL があれば **修正要求** → tdd-green へ差し戻す。安全性に疑義があれば「安全でない」と仮定する。

## 制約
- コードを編集しない。リスクと判定のみを返す。

出力は `report_formats.security` の様式に従うこと。
