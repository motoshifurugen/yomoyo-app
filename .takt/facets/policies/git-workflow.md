# Policy: Git Workflow

`.claude/rules/git-workflow.md` を要約・強制するポリシー。

## コミットメッセージ形式
```
<type>: <description>

<optional body>
```
type: feat / fix / refactor / docs / test / chore / perf / ci

## コミット規則
- 命令法を使う（"add"、"added" ではない）。
- 説明は簡潔に、72文字以内。
- 1コミット=1論理変更。無関係な変更を混在させない。
- 属性表示（Co-Authored-By 等）はグローバル設定で無効。付与しない。

## push に関する重要事項
- `git push` は手動レビューのため CLAUDE 側のフックでブロックされる。
- **このワークフローでは push を実行しない。** コミットの作成までに留める。
- 新ブランチを push する場合（人手で行う際）は `git push -u origin <branch-name>`。

## PR 作成時（人手で行う際の指針）
- 全コミット履歴と `git diff <base-branch>...HEAD` をレビューする。
- 箇条書き中心の構造化サマリ（何を・なぜ）。
- テスト計画を含め、未テスト領域は TODO として明示する。
