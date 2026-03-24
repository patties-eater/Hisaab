export function getAuthToken() {
  return localStorage.getItem("token");
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
