export type CsvEncoding = "UTF-8" | "Shift-JIS" | "UTF-16 LE" | "UTF-16 BE";

export interface DecodedCsv {
  text: string;
  encoding: CsvEncoding;
}

function decode(bytes: Uint8Array, encoding: string) {
  return new TextDecoder(encoding, { fatal: true }).decode(bytes);
}

function normalizeCsvText(text: string) {
  return text
    .replace(/^\uFEFF/u, "")
    .replace(/^sep=([^\r\n])\r?\n/iu, "");
}

function detectBom(bytes: Uint8Array): { encoding: CsvEncoding; decoder: string; offset: number } | null {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { encoding: "UTF-8", decoder: "utf-8", offset: 3 };
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { encoding: "UTF-16 LE", decoder: "utf-16le", offset: 2 };
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { encoding: "UTF-16 BE", decoder: "utf-16be", offset: 2 };
  }
  return null;
}

function detectBomlessUtf16(bytes: Uint8Array): { encoding: CsvEncoding; decoder: string } | null {
  const sampleLength = Math.min(bytes.length - (bytes.length % 2), 4096);
  const pairs = sampleLength / 2;
  if (pairs < 4) return null;

  let evenNulls = 0;
  let oddNulls = 0;
  for (let index = 0; index < sampleLength; index += 2) {
    if (bytes[index] === 0) evenNulls += 1;
    if (bytes[index + 1] === 0) oddNulls += 1;
  }

  const minimumNulls = Math.max(2, Math.ceil(pairs * 0.1));
  if (oddNulls >= minimumNulls && oddNulls >= evenNulls * 3) {
    return { encoding: "UTF-16 LE", decoder: "utf-16le" };
  }
  if (evenNulls >= minimumNulls && evenNulls >= oddNulls * 3) {
    return { encoding: "UTF-16 BE", decoder: "utf-16be" };
  }
  return null;
}

function decodedCsv(text: string, encoding: CsvEncoding): DecodedCsv {
  const normalized = normalizeCsvText(text);
  if (normalized.includes("\u0000")) throw new Error("CSVの文字コードを判定できませんでした。");
  return { text: normalized, encoding };
}

export function decodeCsvBuffer(buffer: ArrayBuffer): DecodedCsv {
  const bytes = new Uint8Array(buffer);
  if (!bytes.length) throw new Error("CSVファイルが空です。");

  const bom = detectBom(bytes);
  if (bom) return decodedCsv(decode(bytes.subarray(bom.offset), bom.decoder), bom.encoding);

  const utf16 = detectBomlessUtf16(bytes);
  if (utf16) return decodedCsv(decode(bytes, utf16.decoder), utf16.encoding);

  try {
    return decodedCsv(decode(bytes, "utf-8"), "UTF-8");
  } catch {
    try {
      return decodedCsv(decode(bytes, "shift-jis"), "Shift-JIS");
    } catch {
      throw new Error("CSVの文字コードを判定できませんでした。UTF-8、Shift-JIS、UTF-16のいずれかで保存してください。");
    }
  }
}
