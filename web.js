import { readLines } from "https://deno.land/std/io/mod.ts";
import * as dejs from "https://deno.land/x/dejs@0.10.2/mod.ts";

const fileNames = ["h", "k", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const dirNames = [
  "ひらがな",
  "カタカナ",
  "小1",
  "小2",
  "小3",
  "小4",
  "小5",
  "小6",
  "中2",
  "中3",
  "常用",
  "常用外",
];
const gradeNames = [
  "ひらがな",
  "カタカナ",
  "小学1年生",
  "小学2年生",
  "小学3年生",
  "小学4年生",
  "小学5年生",
  "小学6年生",
  "中学1〜2年生",
  "中学3年生",
  "常用漢字",
  "常用外漢字",
];

function toContent(words) {
  const n = 100;
  let html = "";
  for (let i = 0; i < words.length; i += n) {
    const from = i;
    const to = i + n;
    const wordLinks = words.slice(from, to)
      .map((word) => toLink(word)).join("\n");
    html += `
      <div class="card">
        <div class="card-header">${from + 1}〜${to}</div>
        <div class="card-body">
          ${wordLinks}
        </div>
      </div>
    `;
  }
  return html;
}

function toLink(word) {
  let html = "\n";
  const url = "https://www.google.com/search?q=" + word + "とは";
  html += '<a href="' + url +
    '" class="mx-2" target="_blank" rel="noopener noreferer">' +
    word + "</a>\n";
  return html;
}

function selected(grade, index) {
  if (grade == index) {
    return "selected";
  } else {
    return "";
  }
}

const template = Deno.readTextFileSync("page.ejs");
for (let i = 0; i < dirNames.length; i++) {
  const words = [];
  const fileReader = await Deno.open(
    `dist/${fileNames[i]}.csv`,
  );
  for await (const line of readLines(fileReader)) {
    words.push(line.split(",")[0]);
  }
  const dir = "src/" + dirNames[i];
  Deno.mkdirSync(dir, { recursive: true });
  const html = await dejs.renderToString(template, {
    words: words,
    grade: fileNames[i],
    gradeName: gradeNames[i],
    toContent: toContent,
    selected: selected,
  });
  Deno.writeTextFileSync(dir + "/index.html", html);
}
