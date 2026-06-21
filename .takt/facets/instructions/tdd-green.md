# Instruction: TDD — GREEN

直前のステップ: {previous_response}

## やること（GREEN）
1. 失敗しているテストを通す**最小限の実装**を書く。過剰実装しない。
2. `pnpm test`（全テスト通過）と `pnpm exec tsc --noEmit`（型チェック）を満たす（quality gate が検証）。
3. テストを通すためにテストを甘くしない。テストが誤りと証明できた場合のみテストを直す。

## 差し戻しを受けた場合（review / security からのループ）
- 指摘（CRITICAL/HIGH、またはセキュリティ問題）を解消する実装に集中する。
- 必要なら追加の失敗テストのために RED へ戻る。

## 制約
- `yomoyo-architecture` の Firebase/iOS 制約を厳守。不変パターンを守る。デバッグログを残さない。

出力は `report_formats.tdd` の様式に従うこと。
