import { api } from "./client";

export async function login(username, password) {
  const res = await api.post(
    "/auth/login",
    { username, password },
    { withCredentials: true }
  );
  return res.data;
}

export async function logout() {
  await api.post(
    "/auth/logout",
    {},
    { withCredentials: true });
}

export async function getMe() {
  const res = await api.get(
    "/auth/me",
    { withCredentials: true }
  );
  return res.data;
}
