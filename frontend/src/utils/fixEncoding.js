const REPLACEMENTS = [
  ["Ã©", "é"], ["Ã¨", "è"], ["Ãª", "ê"], ["Ã«", "ë"],
  ["Ã ", "à"], ["Ã¢", "â"], ["Ã¤", "ä"],
  ["Ã®", "î"], ["Ã¯", "ï"],
  ["Ã´", "ô"], ["Ã¶", "ö"], ["Ã²", "ò"], ["Ã³", "ó"],
  ["Ã¹", "ù"], ["Ã»", "û"], ["Ã¼", "ü"],
  ["Ã§", "ç"],
  ["Ã±", "ñ"],
  ["Ã‰", "É"], ["Ã€", "À"], ["Ãˆ", "È"], ["ÃŠ", "Ê"],
  ["Ã‡", "Ç"], ["Ã\u0152", "Ô"], ["Ã™", "Ù"], ["Ã›", "Û"],
  ["\u00c5\u0092", "œ"], ["\u00c5'", "Œ"],
  ["â€™", "'"], ["â€˜", "'"],
  ["â€œ", "\u201C"], ["â€", "\u201D"],
  ["â€\u201D", "–"], ["â€\u201D", "—"],
  ["â€¦", "…"],
  ["Â«", "«"], ["Â»", "»"],
  ["Â ", "\u00A0"],

  ["\u00e9", "é"], ["\u00e8", "è"], ["\u00ea", "ê"], ["\u00eb", "ë"],
  ["\u00e0", "à"], ["\u00e2", "â"], ["\u00e4", "ä"],
  ["\u00ee", "î"], ["\u00ef", "ï"],
  ["\u00f4", "ô"], ["\u00f6", "ö"],
  ["\u00f9", "ù"], ["\u00fb", "û"], ["\u00fc", "ü"],
  ["\u00e7", "ç"],
  ["\u00c9", "É"], ["\u00c0", "À"], ["\u00c8", "È"],
  ["\u00c7", "Ç"],

];

export function fix(str) {
  if (typeof str !== "string") return str;
  let out = str;
  for (const [bad, good] of REPLACEMENTS) {
    out = out.split(bad).join(good);
  }
  return out;
}

export function fixDeep(value) {
  if (typeof value === "string") return fix(value);
  if (Array.isArray(value)) return value.map(fixDeep);
  if (value && typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = fixDeep(value[key]);
    }
    return result;
  }
  return value;
}
