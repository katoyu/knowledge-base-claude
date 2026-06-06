# CLAUDE.md

このリポジトリは **Claude Code と一緒に育てる、個人用の技術ナレッジベース** です。
あなた（Claude Code）の主な仕事は、ユーザーの質問に答え、その答えをノートとして
保存・公開することです。

## いちばん大事なルール

ユーザーのメッセージが **「質問」** で始まる、または「ノートにして」「メモして」
「これを残して」といった保存の意図がある場合は、次の手順でノートを追加してください。

1. **まず質問にしっかり答える**（チャット上で簡潔に答えてよい）。必要なら Web 検索や
   コードベース調査で裏を取る。憶測で書かない。
2. `notes/<カテゴリ>/<slug>.md` に新しいノートを作る（フォーマットは下記）。
3. 内容は **日本語** で、`templates/note.md` の構成（結論 → 詳しく → 参考）に沿って書く。
4. コミットして push する。GitHub Actions が自動で HTML 化して GitHub Pages に公開する。
   **ローカルでビルドする必要はない**（確認したいときだけ `npm run build`）。

質問でない普通の会話・依頼のときは、勝手にノートを作らないこと。

## ノートのフォーマット

各ノートは Markdown で、先頭に YAML フロントマターを付けます。

```markdown
---
title: 簡潔なタイトル
date: 2026-06-06          # 作成日（today を使う）
category: javascript      # 下記のカテゴリ規約を参照
tags: [react, hooks]      # 小文字・短め・複数可
question: 元の質問文       # 「質問〜」の中身をほぼそのまま。任意だが原則入れる
description: 一覧用の一行要約  # 任意
---

## 結論
まず答え・要点から。

## 詳しく
背景・理由・仕組み。コード例は ```言語 ``` のフェンスで。

## 参考
- [タイトル](URL)
```

`date` は **今日の日付**を使うこと（コンテキストの currentDate を参照）。

## カテゴリと slug の規約

- **カテゴリ** = `notes/` 直下のディレクトリ名。既存のものを優先して使い、
  当てはまらなければ新規作成してよい。小文字・英語・ケバブケース推奨。
  - 例: `javascript`, `typescript`, `react`, `css`, `git`, `infra`,
    `database`, `ai`, `tooling`, `career`, `misc`, `meta`
- **slug** = ファイル名（`.md` を除く）。内容を表す **英語のケバブケース**。
  - 良い例: `react-useeffect-deps.md`, `css-container-queries.md`
  - 避ける: 日本語ファイル名、スペース、大文字
- フロントマターに `category:` を書けばディレクトリと違う分類にもできるが、
  基本はディレクトリ名と一致させる。

## コミットと公開

- 1 ノート = 1 コミットを基本とし、メッセージは内容がわかるように。
  - 例: `Add note: React useEffect の依存配列`
- push 先は作業ブランチ。`main` にマージされると GitHub Pages が更新される
  （Claude Code on the web では PR 経由になる）。
- 既存ノートの修正・追記も歓迎。その場合 `date` はそのままでよい。

## ビルドの仕組み（参考）

- `scripts/build.mjs` が `notes/**/*.md` を読み、`templates/` と `assets/style.css`
  を使って `dist/` に静的 HTML を生成する。
- 依存は `marked` と `gray-matter` のみ。設定は `config.json`。
- サイトのタイトルや説明を変えたいときは `config.json` を編集する。
- デザインを変えたいときは `assets/style.css` と `templates/*.html`。

## やらないこと

- ビルド成果物 `dist/` や `node_modules/` はコミットしない（`.gitignore` 済み）。
- 1 ノートに複数トピックを詰め込まない。1 トピック 1 ファイル。
- 出典のない断定をしない。わからないことは「未確認」と書く。
