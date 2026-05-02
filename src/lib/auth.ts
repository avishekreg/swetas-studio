import type { UserRole } from '../types';

export const SUPER_ADMIN_ROLE = 'super_admin' as const;
export const ADMIN_ROLE = 'admin' as const;
export const CUSTOMER_ROLE = 'customer' as const;
export const STAFF_ROLES = ['order_fulfillment', 'shipping', 'customer_care', 'promotions'] as const;
export const INTERNAL_ROLES = [SUPER_ADMIN_ROLE, ADMIN_ROLE, ...STAFF_ROLES] as const;
export const PRIVILEGED_ROLES = [SUPER_ADMIN_ROLE, ADMIN_ROLE] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  order_fulfillment: 'Order Fulfillment',
  shipping: 'Shipping',
  customer_care: 'Customer Care',
  promotions: 'Promotions',
  customer: 'Customer',
};

export const isPrivilegedRole = (role?: string | null) => {
  return !!role && PRIVILEGED_ROLES.includes(role as (typeof PRIVILEGED_ROLES)[number]);
};

export const canManageStaff = (role?: UserRole | null) => role === SUPER_ADMIN_ROLE || role === ADMIN_ROLE;

export const canAccessInventory = (role?: UserRole | null) => role === SUPER_ADMIN_ROLE || role === ADMIN_ROLE;
export const canAccessPromotions = (role?: UserRole | null) =>
  role === SUPER_ADMIN_ROLE || role === ADMIN_ROLE || role === 'promotions';
export const canAccessOrders = (role?: UserRole | null) =>
  role === SUPER_ADMIN_ROLE || role === ADMIN_ROLE || role === 'order_fulfillment' || role === 'shipping' || role === 'customer_care';
export const canAccessDashboard = (role?: UserRole | null) => role === SUPER_ADMIN_ROLE || role === ADMIN_ROLE;

export const getAssignableRoles = (actorRole?: UserRole | null): UserRole[] => {
  if (actorRole === SUPER_ADMIN_ROLE) {
    return [ADMIN_ROLE, ...STAFF_ROLES];
  }

  if (actorRole === ADMIN_ROLE) {
    return [...STAFF_ROLES];
  }

  return [];
};

export const canModifyUserRole = (actorRole?: UserRole | null, targetRole?: UserRole | null) => {
  if (!actorRole || !targetRole) {
    return false;
  }

  if (actorRole === SUPER_ADMIN_ROLE) {
    return targetRole !== SUPER_ADMIN_ROLE;
  }

  if (actorRole === ADMIN_ROLE) {
    return STAFF_ROLES.includes(targetRole as (typeof STAFF_ROLES)[number]);
  }

  return false;
};

export const canResetManagedAccount = (actorRole?: UserRole | null, targetRole?: UserRole | null) => {
  if (!actorRole || !targetRole) {
    return false;
  }

  if (actorRole === SUPER_ADMIN_ROLE) {
    return targetRole !== SUPER_ADMIN_ROLE;
  }

  if (actorRole === ADMIN_ROLE) {
    return STAFF_ROLES.includes(targetRole as (typeof STAFF_ROLES)[number]);
  }

  return false;
};


export const getAdminHomeRoute = (role?: UserRole | null) => {
  switch (role) {
    case 'promotions':
      return '/admin/promotions';
    case 'order_fulfillment':
    case 'shipping':
    case 'customer_care':
      return '/admin/orders';
    default:
      return '/admin';
  }
};
