const USERS_KEY = "culturalVenueCrm.users.v1";
const CURRENT_USER_KEY = "culturalVenueCrm.currentUser.v1";
const AUTH_SESSION_KEY = "culturalVenueCrm.authSession.v1";

const roleLabels = {
  admin: "管理",
  staff: "スタッフ",
};

const seedUsers = [
  {
    id: "local-admin",
    name: "管理者",
    loginId: "admin",
    email: "admin@example.jp",
    role: "admin",
    active: true,
    authPassword: "password",
  },
  {
    id: "local-staff",
    name: "営業スタッフ",
    loginId: "staff",
    email: "staff@example.jp",
    role: "staff",
    active: true,
    authPassword: "password",
  },
];

const loginForm = document.querySelector("#loginForm");
const loginHelp = document.querySelector("#loginHelp");

loginForm?.addEventListener("submit", handleLogin);
showSignedInState();

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const loginId = normalizeLoginId(formData.get("loginId"));
  const password = String(formData.get("password") ?? "");

  if (isSupabaseEnabled()) {
    try {
      setHelp(loginHelp, "ログイン確認中です。", "");
      const user = await window.crmSupabase.signIn(loginId, password);
      signIn(user.id);
      setHelp(loginHelp, `${user.name}としてログインしました。`, "success");
      window.location.href = getSafeNextPath();
    } catch (error) {
      setHelp(loginHelp, friendlyAuthError(error), "error");
    }
    return;
  }

  const users = loadUsers();
  const user = users.find((item) => normalizeLoginId(item.loginId || item.email) === loginId && item.active !== false);

  if (!user || String(user.authPassword || "password") !== password) {
    setHelp(loginHelp, "ログインIDまたはパスワードが一致しません。", "error");
    return;
  }

  signIn(user.id);
  setHelp(loginHelp, `${user.name}としてログインしました。`, "success");
  window.location.href = getSafeNextPath();
}

async function showSignedInState() {
  if (isSupabaseEnabled()) {
    try {
      const profile = await window.crmSupabase.getCurrentProfile();
      if (profile?.active) {
        signIn(profile.id);
        setHelp(loginHelp, `${profile.name}としてログイン中です。`, "success");
      }
    } catch {
      setHelp(loginHelp, "Supabaseのログイン状態を確認できませんでした。", "error");
    }
    return;
  }

  const session = readJsonStorage(AUTH_SESSION_KEY, null);
  const user = loadUsers().find((item) => item.id === session?.userId && item.active !== false);
  if (user) {
    setHelp(loginHelp, `${user.name}としてログイン中です。`, "success");
  }
}

function signIn(userId) {
  writeJsonStorage(CURRENT_USER_KEY, userId);
  writeJsonStorage(AUTH_SESSION_KEY, {
    userId,
    signedInAt: new Date().toISOString(),
  });
}

function loadUsers() {
  const saved = readJsonStorage(USERS_KEY, null);
  const users = Array.isArray(saved) && saved.length ? saved : seedUsers;
  const normalizedUsers = users.map(normalizeUser);
  if (!Array.isArray(saved) || JSON.stringify(saved) !== JSON.stringify(normalizedUsers)) {
    writeJsonStorage(USERS_KEY, normalizedUsers);
  }
  return normalizedUsers;
}

function normalizeUser(user) {
  const loginId = normalizeLoginId(user.loginId || defaultLoginIdForEmail(user.email) || user.email || user.name);
  return {
    id: user.id || makeId(),
    name: String(user.name || "").trim() || "未設定ユーザー",
    loginId,
    email: String(user.email || "").trim(),
    role: roleLabels[user.role] ? user.role : "staff",
    active: user.active !== false,
    authPassword: String(user.authPassword || "password"),
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
}

function defaultLoginIdForEmail(value = "") {
  const email = String(value ?? "").trim().toLowerCase();
  if (email === "admin@example.jp") return "admin";
  if (email === "staff@example.jp") return "staff";
  return "";
}

function getSafeNextPath() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "index.html";
  if (/^(https?:|file:|\/\/)/i.test(next) || next.includes("..")) return "./index.html";
  return next.startsWith("./") ? next : `./${next}`;
}

function setHelp(element, message, tone = "") {
  if (!element) return;
  element.textContent = message;
  element.className = `auth-help ${tone}`.trim();
}

function normalizeLoginId(value = "") {
  return String(value ?? "").trim().toLowerCase();
}

function isSupabaseEnabled() {
  return Boolean(window.crmSupabase?.isEnabled?.());
}

function friendlyAuthError(error) {
  const message = String(error?.message || "");
  if (message.includes("Invalid login credentials")) {
    return "ログインIDまたはパスワードが一致しません。初期管理者はSupabase Authの admin@crm.local / password を確認してください。";
  }
  if (message.includes("Email not confirmed")) return "メール確認が完了していません。SupabaseのAuth設定を確認してください。";
  if (message) return message;
  return "ログインに失敗しました。";
}

function readJsonStorage(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function makeId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
