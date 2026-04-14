const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? "https://hisaab-2.onrender.com" : "");

export function apiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function setAuthSession({ token, role }) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

export function setStoredLanguage(language) {
  localStorage.setItem("app_language", language);
}

export function getStoredAccountMode() {
  return localStorage.getItem("account_mode") || "personal";
}

export function setStoredAccountMode(accountMode) {
  localStorage.setItem("account_mode", accountMode === "shop" ? "shop" : "personal");
}

export function getStoredAiEnabled() {
  return localStorage.getItem("ai_enabled") === "true";
}

export function setStoredAiEnabled(enabled) {
  localStorage.setItem("ai_enabled", enabled ? "true" : "false");
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export function getStoredRole() {
  return localStorage.getItem("role");
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const accountMode = getStoredAccountMode();

  if (!token) {
    return {
      ...extraHeaders,
      "X-Account-Mode": accountMode,
    };
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
    "X-Account-Mode": accountMode,
  };
}

export function getFriendlyErrorMessage({
  status,
  defaultMessage = "Server is busy right now. Please try again in a moment.",
} = {}) {
  if (status === 400) {
    return "Please check your details and try again.";
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to do that.";
  }

  if (status === 404) {
    return "We could not find that record.";
  }

  return defaultMessage;
}
