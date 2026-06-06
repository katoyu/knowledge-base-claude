---
title: このナレッジベースについて
date: 2026-06-06
category: meta
tags: [運用, claude-code]
description: 何のためのサイトで、どうやってノートを増やすのか
---

## これは何

気になったことをその場で Claude Code に聞いて、答えを **Markdown のノート**として
ここに貯めていく、自分専用の技術ナレッジベース。
push すると GitHub Actions が HTML に変換し、GitHub Pages に公開される。

## ノートの増やし方

スマホでも PC でも、Claude Code に話しかけるだけ。

> 質問〜 React の useEffect の依存配列って何のためにあるの？

`質問〜` で始めると、Claude Code が調べて `notes/<カテゴリ>/<slug>.md` を作り、
コミット & push する。あとは Actions が勝手に公開してくれる。

## 仕組み

```
notes/**/*.md   ← 自分が書く（Claude が書く）ところ
   │  push
   ▼
GitHub Actions (scripts/build.mjs)
   │  Markdown → HTML
   ▼
dist/ → GitHub Pages で公開
```

ビルドの細かい設定は気にしなくてよい。書くのは Markdown だけ。

## 参考

- [移動中でも就寝前でも、Codexと育てる「技術ノート」](https://zenn.dev/ttaniguchi/articles/instant-question-html-notes) — この仕組みの元ネタ
