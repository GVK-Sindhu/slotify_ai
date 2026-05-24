import React, { useEffect, useState } from 'react';
import { MessageSquare, Search, Bell, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { NotificationLog } from '../types';
import { GlassCard } from '../components/GlassCard';

export const NotificationsPage: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.notifications.getAll();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.customerName.toLowerCase().includes(search.toLowerCase()) ||
    log.destination.includes(search) ||
    log.message.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-5">
        <div>
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">System Logs</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Notification Logs</h1>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 bg-slate-200/60 dark:bg-slate-900 border border-slate-350 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-xl text-slate-655 dark:text-slate-300 cursor-pointer"
          title="Refresh Logs"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by customer or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-10 py-2 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>
        <span className="text-xs text-slate-500 font-semibold">{filteredLogs.length} messages logged</span>
      </div>

      {/* Logs list */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-20 bg-slate-905/10 border border-slate-805 rounded-3xl p-6">
          <Bell className="w-12 h-12 text-slate-650 mx-auto mb-2" />
          <p className="text-slate-450 text-sm">No notification logs recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <GlassCard key={log.id} className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {log.type}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                    To: {log.customerName} ({log.destination})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-normal bg-slate-100/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850">
                  {log.message}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 text-xs text-emerald-500 font-bold self-end sm:self-center">
                <CheckCircle2 className="w-4 h-4" />
                Sent
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
