import { apiFetch } from './api';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string | null;
  organizationName: string | null;
  mustChangePassword?: boolean;
};

export async function login(email: string, password: string) {
  return apiFetch<{ mustChangePassword: boolean; user: AuthUser }>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return apiFetch<AuthUser>('/admin/auth/me');
}

export async function logout() {
  return apiFetch('/admin/auth/logout', { method: 'POST' });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ ok: boolean; user: AuthUser }>('/admin/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
