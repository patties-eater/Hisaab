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
