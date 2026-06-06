---
title: Date から Temporal へ — 日時処理の新API
date: 2026-06-05
category: javascript
tags: [javascript, temporal, date]
question: JavaScript の Date は使いにくいけど、Temporal って何が違うの？
description: 長年つらかった Date を置き換える標準API Temporal の要点
---

## 結論

`Temporal` は JavaScript に新しく入る日時APIで、`Date` の代表的な問題
（ミュータブル、月が0始まり、タイムゾーンが扱いにくい、パースが曖昧）を
根本的に解決する。用途ごとに型が分かれているのが最大の違い。

## Date の何がつらかったか

- `Date` はミュータブル（`setMonth` などで破壊的に変わる）
- 月が **0 始まり**（1月 = 0）
- タイムゾーンは「ローカル」か「UTC」しか扱えない
- 文字列パースの挙動がブラウザ依存で曖昧

## Temporal の主要な型

| 型 | 用途 |
| --- | --- |
| `Temporal.PlainDate` | 時刻なしの日付（誕生日など） |
| `Temporal.PlainTime` | 日付なしの時刻 |
| `Temporal.PlainDateTime` | タイムゾーンなしの日時 |
| `Temporal.ZonedDateTime` | タイムゾーン付きの日時 |
| `Temporal.Instant` | 絶対的な時刻（エポックからの瞬間） |
| `Temporal.Duration` | 期間（差分） |

## 使用例

```js
// 今日の日付（タイムゾーン指定）
const today = Temporal.Now.plainDateISO("Asia/Tokyo");

// イミュータブルに加算（元の値は変わらない）
const nextWeek = today.add({ days: 7 });

// 差分は Duration として得られる
const diff = nextWeek.since(today); // P7D

// タイムゾーンをまたいだ変換も安全
const zoned = Temporal.ZonedDateTime.from("2026-06-05T10:00[Asia/Tokyo]");
const ny = zoned.withTimeZone("America/New_York");
```

## 注意点

- すべての Temporal オブジェクトは **イミュータブル**。操作は新しい値を返す。
- 月は **1 始まり**（やっと直感どおり）。
- 導入状況はランタイムによるため、必要なら polyfill（`@js-temporal/polyfill`）を使う。

## 参考

- [TC39 Temporal Proposal](https://tc39.es/proposal-temporal/docs/)
- [MDN: Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)
