# Instruction: TDD — REFACTOR

直前のステップ: {previous_response}

## やること（REFACTOR）
1. テストを緑に保ったまま、構造・命名・可読性を改善する。振る舞いは変えない。
2. `coding-style` ポリシーに沿って整える: 関数 <50行、ファイル <800行、ネスト深さ <=4、
   不変パターン、マジックナンバー除去、大きなコンポーネントからのユーティリティ抽出。
3. `pnpm test`（全テスト緑のまま）と `pnpm lint` を満たす（quality gate が検証）。

## 判断
- 別の振る舞いの追加が必要なら RED へ戻り TDD サイクルを継続する。
- これ以上の改善が不要ならレビューへ進む。

出力は `report_formats.tdd` の様式に従うこと。
