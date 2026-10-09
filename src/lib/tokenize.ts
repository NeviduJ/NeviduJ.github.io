// An illustrative subword split for the title hover effect. It mimics how BPE-style
// tokenisers break text (leading spaces attach to the next token, long words split
// into stems and suffixes) without shipping a real tokeniser to the browser.

const SUFFIXES = ["ation", "ition", "tion", "sion", "ment", "ness", "ical", "ing", "ity", "ous", "ive", "al", "ed", "er", "ly", "es", "s"];

function splitLowercase(part: string): string[] {
  if (part.length <= 5) return [part];
  const lower = part.toLowerCase();
  const suffix = SUFFIXES.find((s) => lower.endsWith(s) && part.length - s.length >= 3);
  const stem = suffix ? part.slice(0, part.length - suffix.length) : part;
  const chunks: string[] = [];
  for (let i = 0; i < stem.length; ) {
    const size = stem.length - i <= 6 ? stem.length - i : 4;
    chunks.push(stem.slice(i, i + size));
    i += size;
  }
  return suffix ? [...chunks, part.slice(part.length - suffix.length)] : chunks;
}

// "SiDiaC" -> "Si", "Dia", "C"
const splitWord = (word: string) => word.split(/(?<=[a-z])(?=[A-Z])/).flatMap(splitLowercase);

export function pseudoTokenize(text: string): string[] {
  const tokens: string[] = [];
  for (const [, space, word] of text.matchAll(/(\s*)([A-Za-z]+|\d+|[^\sA-Za-z\d])/g)) {
    const pieces = /^[A-Za-z]+$/.test(word) ? splitWord(word) : [word];
    pieces.forEach((piece, i) => tokens.push(i === 0 ? space + piece : piece));
  }
  const trailing = text.match(/\s+$/)?.[0];
  if (trailing && tokens.length) tokens[tokens.length - 1] += trailing;
  return tokens;
}
