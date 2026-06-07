// GitHub Issue（ノート投稿フォーム）の本文を notes/<category>/<slug>.md に変換する。
// .github/workflows/issue-to-note.yml から呼ばれる。
// 入力は環境変数 ISSUE_BODY / ISSUE_NUMBER / ISSUE_TITLE。
// 生成したファイルのパスを GITHUB_OUTPUT に file= で出力する。

import { writeFile, mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

const body = process.env.ISSUE_BODY || "";
const issueNumber = process.env.ISSUE_NUMBER || "0";

// Issue Form の本文は「### ラベル」見出しごとに値が並ぶ。見出し単位に分解する。
function parseSections(text) {
  const sections = {};
  let cur = null;
  let buf = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^###\s+(.*)$/);
    if (m) {
      if (cur !== null) sections[cur] = buf.join("\n").trim();
      cur = m[1].trim();
      buf = [];
    } else if (cur !== null) {
      buf.push(line);
    }
  }
  if (cur !== null) sections[cur] = buf.join("\n").trim();
  return sections;
}

const sections = parseSections(body);
function val(label) {
  let v = sections[label] ?? "";
  if (v === "_No response_") v = "";
  return v.trim();
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// YAML のダブルクオート文字列（JSON.stringify で十分に安全）
const y = (s) => JSON.stringify(String(s));

const title = val("タイトル") || `note-${issueNumber}`;
const category = slugify(val("カテゴリ") || "misc") || "misc";
let slug = slugify(val("slug"));
if (!slug) slug = `note-${issueNumber}`;
const tags = val("タグ")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
const source = val("出典");

// 本文は最後のフィールドなので「### 本文」以降を丸ごと採用する
// （本文中に ### 見出しがあっても欠けないように）。
function extractBody(text) {
  const m = text.match(/^###\s+本文\s*$/m);
  if (!m) return val("本文") || "";
  let v = text.slice(m.index + m[0].length).trim();
  if (v === "_No response_") v = "";
  return v;
}
const content = extractBody(body);
const date = new Date().toISOString().slice(0, 10);

const fm = [
  "---",
  `title: ${y(title)}`,
  `date: ${date}`,
  `category: ${category}`,
  tags.length ? `tags: [${tags.map(y).join(", ")}]` : "tags: []",
  source ? `source: ${y(source)}` : null,
  `source_issue: ${issueNumber}`,
  "---",
]
  .filter((l) => l !== null)
  .join("\n");

const md = `${fm}\n\n${content}\n`;
const rel = path.posix.join("notes", category, `${slug}.md`);

await mkdir(path.dirname(rel), { recursive: true });
await writeFile(rel, md, "utf8");

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `file=${rel}\n`);
  await appendFile(process.env.GITHUB_OUTPUT, `slug=${slug}\n`);
}
console.log(`created ${rel}`);
