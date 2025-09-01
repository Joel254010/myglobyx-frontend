export const TOKEN_KEY = "mx_token";

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function loginMock(email: string) {
  const token = btoa(`${email}|${Date.now()}`);
  localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}
