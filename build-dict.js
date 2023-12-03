import { readLines } from "https://deno.land/std/io/mod.ts";
import { Kanji, JKAT } from "npm:@marmooo/kanji@0.0.2";

async function loadInappropriateWordsJa() {
  const dict = {};
  const fileReader = await Deno.open("inappropriate-words-ja/Sexual.txt");
  for await (const word of readLines(fileReader)) {
    if (!word) continue;
    if (!["イク", "催眠"].includes(word)) {
      dict[word] = true;
    }
  }
  dict["性病"] = true;
  return dict;
}

async function loadSudachiFilter() {
  const dict = {};
  const paths = [
    "SudachiDict/src/main/text/small_lex.csv",
    "SudachiDict/src/main/text/core_lex.csv",
  ];
  for (const path of paths) {
    const fileReader = await Deno.open(path);
    for await (const line of readLines(fileReader)) {
      if (!line) continue;
      const arr = line.split(",");
      const lemma = arr[0];
      const leftId = arr[1];
      const pos1 = arr[5];
      const pos2 = arr[6];
      const form = arr[10];
      const abc = arr[14];
      if (leftId == "-1") continue;
      if (pos1 == "補助記号") continue;
      if (pos2 == "固有名詞") continue;
      if (abc != "A") continue;
      if (form != "*" && !form.includes("終止形")) continue;
      dict[lemma] = true;
    }
  }
  return dict;
}

async function parseLemma() {
  const filterRegexp = /^[ぁ-ゔァ-ヴー\u3400-\u9FFF\uF900-\uFAFF\u{20000}-\u{2FFFF}]+$/u;
  const inappropriateWordsJa = await loadInappropriateWordsJa();
  const sudachiFilter = await loadSudachiFilter();

  const dict = {};
  for (let i = 1; i <= 7; i++) {
    const fileReader = await Deno.open(
      `nwc2010-ngrams/word/over999/${i}gms/${i}gm-0000`,
    );
    for await (const line of readLines(fileReader)) {
      if (!line) continue;
      const arr = line.split(/\s/);
      const lemma = arr.slice(0, -1).join("");
      if (lemma in sudachiFilter === false) continue;
      if (lemma in inappropriateWordsJa) continue;
      if (lemma.length == 1) continue; // 一文字の語彙は無視
      if (!filterRegexp.test(lemma)) continue; // 数字記号は無視
      const kanjis = lemma.replaceAll(/[ぁ-ゔァ-ヴー]/g, "");
      const grades = Array.from(kanjis).map((kanji) => jkat.getGrade(kanji));
      if (grades.includes(-1)) continue; // サポート外漢字を含む場合は無視
      const count = parseInt(arr.slice(-1));
      if (lemma in dict) {
        dict[lemma] += count;
      } else {
        dict[lemma] = count;
      }
    }
  }
  const arr = Object.entries(dict).sort((a, b) => b[1] - a[1]);
  return arr;
}

function splitByGrade(arr) {
  const graded = new Array(JKAT.length + 1);
  for (let grade = 0; grade <= JKAT.length; grade++) {
    graded[grade] = [];
  }
  for (const [lemma, count] of arr) {
    const kanjis = lemma.replaceAll(/[ぁ-ゔァ-ヴー]/g, "");
    if (kanjis.length == 0) {
      graded[0].push([lemma, count]);
    } else {
      const grade = jkat.getGrade(kanjis) + 1;
      graded[grade].push([lemma, count]);
    }
  }
  return graded;
}

const outDir = "dist";
const jkat = new Kanji(JKAT);
const result = await parseLemma();
Deno.writeTextFile(
  `${outDir}/all.csv`,
  result.map((x) => x.join(",")).join("\n"),
);
const graded = splitByGrade(result);
for (let grade = 0; grade < graded.length; grade++) {
  Deno.writeTextFile(
    `${outDir}/${grade}.csv`,
    graded[grade].map((x) => x.join(",")).join("\n"),
  );
}

const hira = [];
const kana = [];
const fileReader = await Deno.open("dist/0.csv");
for await (const line of readLines(fileReader)) {
  if (!line) continue;
  const [word, count] = line.split(",");
  if (/[ぁ-ゔー]/.test(word)) {
    hira.push([word, count]);
  } else if (/[ァ-ヴー]/.test(word)) {
    kana.push([word, count]);
  }
}
Deno.writeTextFile(
  `${outDir}/h.csv`,
  hira.map((x) => x.join(",")).join("\n"),
);
Deno.writeTextFile(
  `${outDir}/k.csv`,
  kana.map((x) => x.join(",")).join("\n"),
);
