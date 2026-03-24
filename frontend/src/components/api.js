export function getAuthToken() {
  return localStorage.getItem("token");
}

export function setAuthSession({ token, role }) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
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

  if (!token) {
    return extraHeaders;
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}
