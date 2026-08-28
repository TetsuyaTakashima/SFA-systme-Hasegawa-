import { z } from "zod";

interface ContactFields {
  email: string | null;
  website: string | null;
}

function isEmailList(value: string) {
  return value
    .split(/[,;、]/u)
    .map((email) => email.trim())
    .every((email) => z.email().safeParse(email).success);
}

export function validateChangedContactFields(next: ContactFields, previous: ContactFields) {
  if (next.email !== previous.email && next.email && !isEmailList(next.email)) {
    return "メールアドレスを確認してください。";
  }
  if (next.website !== previous.website && next.website && !z.url().safeParse(next.website).success) {
    return "URLを確認してください。";
  }
  return null;
}
