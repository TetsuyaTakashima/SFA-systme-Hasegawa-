import { describe, expect, it } from "vitest";
import { decodeCsvBuffer } from "@/lib/csv-encoding";

function asBuffer(bytes: number[] | Uint8Array) {
  return Uint8Array.from(bytes).buffer;
}

function utf16Bytes(text: string, littleEndian: boolean, withBom = true) {
  const bytes: number[] = withBom ? (littleEndian ? [0xff, 0xfe] : [0xfe, 0xff]) : [];
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (littleEndian) bytes.push(code & 0xff, code >> 8);
    else bytes.push(code >> 8, code & 0xff);
  }
  return asBuffer(bytes);
}

describe("decodeCsvBuffer", () => {
  it("decodes UTF-8 with a BOM and removes Excel's separator directive", () => {
    const body = new TextEncoder().encode("sep=,\n営業先名,電話番号\n文化会館,03-1234-5678");
    const bytes = new Uint8Array(body.length + 3);
    bytes.set([0xef, 0xbb, 0xbf]);
    bytes.set(body, 3);

    expect(decodeCsvBuffer(bytes.buffer)).toEqual({
      text: "営業先名,電話番号\n文化会館,03-1234-5678",
      encoding: "UTF-8",
    });
  });

  it("falls back to Shift-JIS when UTF-8 decoding fails", () => {
    expect(decodeCsvBuffer(asBuffer([0x82, 0xa0, 0x2c, 0x31]))).toEqual({
      text: "あ,1",
      encoding: "Shift-JIS",
    });
  });

  it("decodes UTF-16 LE and BE files", () => {
    const csv = "営業先名,電話番号\r\n文化会館,03-1234-5678";
    expect(decodeCsvBuffer(utf16Bytes(csv, true))).toEqual({ text: csv, encoding: "UTF-16 LE" });
    expect(decodeCsvBuffer(utf16Bytes(csv, false))).toEqual({ text: csv, encoding: "UTF-16 BE" });
  });

  it("detects UTF-16 LE without a BOM", () => {
    const csv = "name,phone\nHall,03-1234-5678";
    expect(decodeCsvBuffer(utf16Bytes(csv, true, false))).toEqual({ text: csv, encoding: "UTF-16 LE" });
  });
});
