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
