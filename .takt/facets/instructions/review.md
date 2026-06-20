# Instruction: Code Review

レビュー対象の実装: {previous_response}

## やること（読み取り専用）
1. `git diff` で差分全体を確認する（最新コミットだけでなく作業ツリー全体）。
2. `coding-style` / `testing` ポリシーに照らして指摘を **深刻度付き**（CRITICAL/HIGH/MEDIUM/LOW）で列挙。
3. 観点: 可読性・命名、関数/ファイルサイズ、ネスト深さ、不変パターン、エラーハンドリング境界、
   `console.log` 等のデバッグログ残存、マジックナンバー/ハードコード、外部入力の検証、テストの十分性。

## 判定
- CRITICAL/HIGH が無ければ **承認** → security へ。
- CRITICAL または HIGH があれば **修正要求** → tdd-green へ差し戻す（具体的な修正方針を添える）。

## 制約
- コードを編集しない。指摘と判定のみを返す。

出力は `report_formats.review` の様式に従うこと。
