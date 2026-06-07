# 技術ノート（knowledge-base-claude）

気になったことをその場で **Claude Code** に聞いて、答えを Markdown ノートとして
貯めていく、自分専用の技術ナレッジベース。push すると GitHub Actions が HTML に変換し、
GitHub Pages に公開する。ビルドは不要、書くのは Markdown だけ。

> 元ネタ: [移動中でも就寝前でも、Codexと育てる「技術ノート」](https://zenn.dev/ttaniguchi/articles/instant-question-html-notes)
> （記事は Codex。こちらは Claude Code で運用する版）

## 使い方

スマホでも PC でも、Claude Code に話しかけるだけ。

```
質問〜 React の useEffect の依存配列って何のためにあるの？
```

`質問〜` で始めると、Claude Code が調べて `notes/<カテゴリ>/<slug>.md` を作り、
コミット & push する。あとは Actions が公開してくれる。
ふるまいの定義は [`CLAUDE.md`](./CLAUDE.md) にある。

## サイトから投稿する

公開サイトの右上「✍️ ノートを投稿」ボタンから、**ブラウザ（スマホ可）だけ**で投稿できる。

```
[✍️ ノートを投稿] → 入力フォーム付き GitHub Issue → Actions が md 化して PR → マージで公開
```

- 投稿フォーム: `.github/ISSUE_TEMPLATE/note.yml`（タイトル / カテゴリ / slug / タグ / 出典 / 本文）
- 変換: `.github/workflows/issue-to-note.yml` + `scripts/issue-to-note.mjs`（本文を原文のまま md 化）
- 他AIで深めた md は、本文欄に貼ってそのまま投稿すればよい。

### 初回セットアップ（1回だけ）

Actions が PR を作れるように、リポジトリ設定を1つ有効化する:

1. **Settings → Actions → General → Workflow permissions**
2. **「Read and write permissions」** を選択
3. **「Allow GitHub Actions to create and approve pull requests」** にチェック → Save

## ディレクトリ構成

```
.
├── CLAUDE.md            # Claude Code への運用指示（ノートの増やし方の定義）
├── config.json          # サイトのタイトル・説明
├── notes/               # ノート本体（Markdown）← ここが増えていく
│   └── <category>/<slug>.md
├── templates/
│   ├── page.html        # ノートページの HTML レイアウト
│   ├── index.html       # トップページのレイアウト
│   └── note.md          # 新規ノートのテンプレート
├── assets/style.css     # スタイル（ライト/ダーク対応）
├── scripts/
│   ├── build.mjs        # Markdown → HTML 変換 + 一覧生成
│   └── serve.mjs        # ローカルプレビュー用サーバ
└── .github/workflows/deploy.yml  # Pages への自動デプロイ
```

## ローカルで確認する

```bash
npm install
npm run build      # dist/ に生成
npm run preview    # http://localhost:4173 で確認
```

## 公開（初回セットアップ）

1. この PR を `main` にマージする。
2. GitHub の **Settings → Pages → Build and deployment → Source** を
   **「GitHub Actions」** に設定する。
3. 以降は `main` への push（＝ノート追加）ごとに自動で公開される。

公開 URL は `https://<ユーザー名>.github.io/knowledge-base-claude/`。

## カスタマイズ

- サイト名・説明 → `config.json`
- 見た目 → `assets/style.css`, `templates/*.html`
- ノートの分類ルール → `CLAUDE.md`
