export const SUPER_ADMIN_ROLE = 'super_admin';
export const ADMIN_ROLE = 'admin';
export const CUSTOMER_ROLE = 'customer';

export const PRIVILEGED_ROLES = [SUPER_ADMIN_ROLE, ADMIN_ROLE] as const;

export const isPrivilegedRole = (role?: string | null) => {
  return !!role && PRIVILEGED_ROLES.includes(role as (typeof PRIVILEGED_ROLES)[number]);
};
