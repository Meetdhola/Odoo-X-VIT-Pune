import React from 'react';

export const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase() || 'pending';
  const styles = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected'
  };

  return (
    <span className={styles[s] || styles.pending}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const r = role?.toLowerCase() || 'employee';
  const styles = {
    admin: 'badge-admin',
    manager: 'badge-manager',
    employee: 'badge-employee'
  };

  return (
    <span className={styles[r] || styles.employee}>
      {r.charAt(0).toUpperCase() + r.slice(1)}
    </span>
  );
};
