import { auth } from '../firebase';
import type { StaffAccount, StaffAccountActionResult, StaffAccountInput, UserRole } from '../types';

const endpoint = '/.netlify/functions/admin-users';

async function authedFetch<T>(init?: RequestInit): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please sign in again to continue.');
  }

  const token = await user.getIdToken(true);
  const response = await fetch(endpoint, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error || 'Unable to complete the staff management request.');
  }

  return data as T;
}

export const AdminApi = {
  listStaff: () => authedFetch<{ users: StaffAccount[]; requesterRole: UserRole }>(),
  createStaff: (payload: StaffAccountInput) =>
    authedFetch<{ user: StaffAccount; credentials: { email: string; password: string } }>({
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRole: (uid: string, role: UserRole) =>
    authedFetch<StaffAccountActionResult>({
      method: 'PATCH',
      body: JSON.stringify({ action: 'role', uid, role }),
    }),
  setDisabled: (uid: string, disabled: boolean) =>
    authedFetch<StaffAccountActionResult>({
      method: 'PATCH',
      body: JSON.stringify({ action: disabled ? 'disable' : 'enable', uid }),
    }),
  resetPassword: (uid: string, newPassword: string) =>
    authedFetch<StaffAccountActionResult>({
      method: 'PATCH',
      body: JSON.stringify({ action: 'reset_password', uid, newPassword }),
    }),
};
