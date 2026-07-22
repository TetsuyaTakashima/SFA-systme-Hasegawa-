const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const PUBLIC_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
const AUTH_EMAIL_DOMAIN = process.env.AUTH_EMAIL_DOMAIN || "crm.local";
const MAX_REQUEST_BODY_BYTES = 32 * 1024;

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "POSTのみ対応しています。" });
    return;
  }

  const configProblem = getConfigProblem();
  if (configProblem) {
    response.status(500).json({ error: configProblem });
    return;
  }

  try {
    const accessToken = getBearerToken(request.headers.authorization || "");
    if (!accessToken) {
      response.status(401).json({ error: "ログイン情報を確認できません。" });
      return;
    }

    const requester = await getRequester(accessToken);
    const requesterProfile = await getProfile(requester.id, accessToken);
    if (requesterProfile?.role !== "admin" || requesterProfile?.active === false) {
      response.status(403).json({ error: "管理者のみユーザーを作成できます。" });
      return;
    }

    const body = await readBody(request);
    const name = String(body.name || "").trim();
    const loginId = normalizeLoginId(body.loginId);
    const password = String(body.password || "");

    if (!name || !loginId || password.length < 4) {
      response.status(400).json({ error: "名前、ログインID、4文字以上のパスワードを入力してください。" });
      return;
    }

    const email = loginIdToEmail(loginId);
    const authUser = await createAuthUser(email, password, name, loginId);
    const profile = await getProfileWithService(authUser.id);
    if (!profile) throw new Error("ユーザープロフィールの作成を確認できません。Supabase移行を適用してください。");

    response.status(200).json({ profile });
  } catch (error) {
    if (String(error.message || "").includes("permission denied for table profiles")) {
      response.status(403).json({
        error:
          "profilesの参照権限がありません。VercelのSUPABASE_SERVICE_ROLE_KEYにSupabaseのservice_roleキーが設定されているか確認してください。",
      });
      return;
    }
    response.status(error.status || 500).json({ error: error.message || "ユーザー作成に失敗しました。" });
  }
}

async function getRequester(accessToken) {
  const result = await supabaseFetch("/auth/v1/user", {
    headers: {
      apikey: PUBLIC_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return result;
}

async function getProfile(userId, accessToken) {
  const rows = await supabaseFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,role,active`, {
    headers: userHeaders(accessToken),
  });
  return Array.isArray(rows) ? rows[0] : null;
}

async function getProfileWithService(userId) {
  const rows = await supabaseFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,name,login_id,email,role,active,created_at,updated_at`, {
    headers: serviceHeaders(),
  });
  return Array.isArray(rows) ? rows[0] : null;
}

async function createAuthUser(email, password, name, loginId) {
  return supabaseFetch("/auth/v1/admin/users", {
    method: "POST",
    headers: serviceHeaders(),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, login_id: loginId },
    }),
  });
}

async function supabaseFetch(path, options = {}) {
  const result = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await result.text();
  const data = text ? JSON.parse(text) : null;
  if (!result.ok) {
    const error = new Error(data?.msg || data?.message || data?.error_description || data?.error || "Supabase API error");
    error.status = result.status;
    throw error;
  }
  return data;
}

function serviceHeaders() {
  if (String(SERVICE_ROLE_KEY || "").startsWith("sb_secret_")) {
    return {
      apikey: SERVICE_ROLE_KEY,
    };
  }

  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  };
}

function userHeaders(accessToken) {
  return {
    apikey: PUBLIC_KEY,
    Authorization: `Bearer ${accessToken}`,
  };
}

function getBearerToken(value) {
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

async function readBody(request) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    if (Buffer.byteLength(JSON.stringify(request.body), "utf8") > MAX_REQUEST_BODY_BYTES) {
      const error = new Error("リクエストが大きすぎます。");
      error.status = 413;
      throw error;
    }
    return request.body;
  }
  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;
    let aborted = false;
    request.on("data", (chunk) => {
      if (aborted) return;
      bytes += Buffer.byteLength(chunk);
      if (bytes > MAX_REQUEST_BODY_BYTES) {
        aborted = true;
        const error = new Error("リクエストが大きすぎます。");
        error.status = 413;
        request.resume();
        reject(error);
        return;
      }
      body += chunk;
    });
    request.on("end", () => {
      if (aborted) return;
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function loginIdToEmail(value) {
  return value.includes("@") ? value : `${value}@${AUTH_EMAIL_DOMAIN}`;
}

function normalizeLoginId(value = "") {
  return String(value || "").trim().toLowerCase();
}

function getElevatedKeyProblem(value = "") {
  const key = String(value || "").trim();
  if (!key) return "SUPABASE_SERVICE_ROLE_KEY または SUPABASE_SECRET_KEY が未設定です。";
  if (key.startsWith("sb_publishable_")) return "SUPABASE_SERVICE_ROLE_KEY に publishable key が設定されています。Supabaseのsecret keyまたはservice_role keyを設定してください。";
  if (key.startsWith("sb_secret_")) return "";
  if (!key.includes(".")) return "SUPABASE_SERVICE_ROLE_KEY は service_role key、または SUPABASE_SECRET_KEY は sb_secret_... の値を設定してください。";

  const role = readJwtRole(key);
  if (role && role !== "service_role") {
    return `SUPABASE_SERVICE_ROLE_KEY に role=${role} のキーが設定されています。role=service_role のキーを設定してください。`;
  }
  return "";
}

function getConfigProblem() {
  if (!SUPABASE_URL) return "SUPABASE_URL が未設定です。";
  if (!PUBLIC_KEY) return "SUPABASE_ANON_KEY または SUPABASE_PUBLISHABLE_KEY が未設定です。";
  return getElevatedKeyProblem(SERVICE_ROLE_KEY);
}

function readJwtRole(jwt = "") {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")).role || "";
  } catch {
    return "";
  }
}
