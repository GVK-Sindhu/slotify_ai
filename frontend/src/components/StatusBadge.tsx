import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Active':
      case 'Available':
      case 'Confirmed':
      case 'Paid':
      case 'Sent':
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20';

      case 'Pending':
      case 'Draft':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';

      case 'Paused':
      case 'Closed':
      case 'No Show':
      case 'Refunded':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';

      case 'Cancelled':
      case 'Expired':
      case 'Failed':
      case 'Full':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';

      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getStyles()}`}>
      {status}
    </span>
  );
};
