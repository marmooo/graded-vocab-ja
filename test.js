import { readLines } from "https://deno.land/std/io/mod.ts";
import { MeCab } from "https://deno.land/x/deno_mecab/mod.ts";

const lemma = "ご苦労";
const mecab = new MeCab(["mecab"]);
const parsed = await mecab.parse(lemma);
console.log(parsed);

