const SUPABASE_URL = process.env.SUPABASE_URL || "https://oyqbdscgihysjwzykdzq.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const PUBLIC_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || SERVICE_ROLE_KEY;

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "POSTのみ対応しています。" });
    return;
  }

  if (!SERVICE_ROLE_KEY) {
    response.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY または SUPABASE_SECRET_KEY が未設定です。" });
    return;
  }

  const keyProblem = getElevatedKeyProblem(SERVICE_ROLE_KEY);
  if (keyProblem) {
    response.status(500).json({ error: keyProblem });
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
      response.status(403).json({ error: "管理者のみユーザーを削除できます。" });
      return;
    }

    const body = await readBody(request);
    const targetId = String(body.id || "").trim();
    if (!targetId) {
      response.status(400).json({ error: "削除対象ユーザーを確認できません。" });
      return;
    }
    if (targetId === requester.id) {
      response.status(400).json({ error: "自分のアカウントは削除できません。" });
      return;
    }

    const targetProfile = await getProfileWithService(targetId);
    if (!targetProfile) {
      response.status(404).json({ error: "削除対象ユーザーが見つかりません。" });
      return;
    }
    if (targetProfile.active !== false) {
      response.status(400).json({ error: "ユーザーを削除するには、先に停止してください。" });
      return;
    }

    await clearProfileReference("venues", "assigned_user_id", targetId);
    await clearProfileReference("venues", "call_updated_by_user_id", targetId);
    await clearProfileReference("venues", "created_by", targetId, true);
    await clearProfileReference("venues", "updated_by", targetId, true);
    await clearProfileReference("call_histories", "changed_by_user_id", targetId, true);
    await deleteRelatedRows("user_preferences", "user_id", targetId, true);
    await deleteAuthUser(targetId);
    await deleteRelatedRows("profiles", "id", targetId, true);

    response.status(200).json({ ok: true });
  } catch (error) {
    response.status(error.status || 500).json({ error: error.message || "ユーザー削除に失敗しました。" });
  }
}

async function getRequester(accessToken) {
  return supabaseFetch("/auth/v1/user", {
    headers: {
      apikey: PUBLIC_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function getProfile(userId, accessToken) {
  const rows = await supabaseFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,role,active`, {
    headers: userHeaders(accessToken),
  });
  return Array.isArray(rows) ? rows[0] : null;
}

async function getProfileWithService(userId) {
  const rows = await supabaseFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,active`, {
    headers: serviceHeaders(),
  });
  return Array.isArray(rows) ? rows[0] : null;
}

async function clearProfileReference(table, column, userId, optional = false) {
  try {
    await supabaseFetch(`/rest/v1/${table}?${column}=eq.${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: serviceHeaders(),
      body: JSON.stringify({ [column]: null }),
    });
  } catch (error) {
    if (!(optional && isMissingSchemaError(error))) throw error;
  }
}

async function deleteRelatedRows(table, column, userId, optional = false) {
  try {
    await supabaseFetch(`/rest/v1/${table}?${column}=eq.${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: serviceHeaders(),
    });
  } catch (error) {
    if (!(optional && isMissingSchemaError(error))) throw error;
  }
}

async function deleteAuthUser(userId) {
  try {
    await supabaseFetch(`/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: serviceHeaders(),
    });
  } catch (error) {
    if (error.status !== 404) throw error;
  }
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
    error.code = data?.code || data?.error || "";
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
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) return request.body;
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
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

function isMissingSchemaError(error) {
  const message = String(error?.message || error?.details || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  return ["PGRST204", "42P01", "42703"].includes(code) || message.includes("could not find") || message.includes("does not exist");
}
