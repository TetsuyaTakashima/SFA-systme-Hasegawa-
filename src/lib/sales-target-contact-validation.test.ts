import { describe, expect, it } from "vitest";
import { validateChangedContactFields } from "@/lib/sales-target-contact-validation";

describe("validateChangedContactFields", () => {
  it("allows unchanged legacy values so other fields can be saved", () => {
    const legacy = { email: "↑高校と一緒", website: "公式サイト参照" };
    expect(validateChangedContactFields(legacy, legacy)).toBeNull();
  });

  it("validates newly changed email and website values", () => {
    const previous = { email: null, website: null };
    expect(validateChangedContactFields({ email: "郵送希望", website: null }, previous)).toBe("メールアドレスを確認してください。");
    expect(validateChangedContactFields({ email: null, website: "example.com" }, previous)).toBe("URLを確認してください。");
  });

  it("accepts valid single and multiple email addresses", () => {
    const previous = { email: null, website: null };
    expect(validateChangedContactFields({ email: "sales@example.com", website: null }, previous)).toBeNull();
    expect(validateChangedContactFields({ email: "sales@example.com, office@example.com", website: null }, previous)).toBeNull();
  });
});
