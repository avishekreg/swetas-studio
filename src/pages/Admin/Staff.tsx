import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminAccessNotice from '../../components/AdminAccessNotice';
import AdminShell from '../../components/AdminShell';
import StaffManagementPanel from '../../components/StaffManagementPanel';

const AdminStaff = () => {
  const { canManageStaff, isSuperAdmin } = useAuth();

  if (!canManageStaff) {
    return <AdminAccessNotice />;
  }

  return (
    <AdminShell
      title={isSuperAdmin ? <>Super <span className="italic">Admin Console</span></> : <>Team <span className="italic">Access Hub</span></>}
      subtitle={
        isSuperAdmin
          ? 'Recover admin access, rotate passwords, and keep every internal seat under control'
          : 'Provision boutique staff, assign limited roles, and keep daily operations tidy'
      }
    >
      <StaffManagementPanel />
    </AdminShell>
  );
};

export default AdminStaff;
