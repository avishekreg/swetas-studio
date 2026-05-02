import React from 'react';
import { ROLE_LABELS, SUPER_ADMIN_ROLE } from '../lib/auth';
import type { UserRole } from '../types';

const styles: Record<UserRole, string> = {
  super_admin: 'bg-black text-white',
  admin: 'bg-[#D4AF37]/15 text-[#a17f1a] border border-[#D4AF37]/30',
  order_fulfillment: 'bg-blue-50 text-blue-700 border border-blue-100',
  shipping: 'bg-violet-50 text-violet-700 border border-violet-100',
  customer_care: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  promotions: 'bg-rose-50 text-rose-700 border border-rose-100',
  customer: 'bg-white text-black/55 border border-black/10',
};

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-bold ${styles[role]}`}
    title={role === SUPER_ADMIN_ROLE ? 'Full recovery and access control' : ROLE_LABELS[role]}
  >
    {ROLE_LABELS[role]}
  </span>
);

export default RoleBadge;
