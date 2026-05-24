import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, DollarSign, Percent, Award, Info, 
  Settings, Briefcase, FileSpreadsheet, CheckCircle2, AlertTriangle, Sparkles 
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { aiService } from '../services/aiService';
import { DashboardSummary, Business, Booking } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Modal } from '../components/Modal';
import { useForm } from 'react-hook-form';
import { csvExporter } from '../utils/csvExporter';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Business Info edit modal state
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [bizSaving, setBizSaving] = useState(false);
  
  const { register, handleSubmit, setValue } = useForm<Partial<Business>>();

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const sumData = await apiClient.dashboard.getSummary();
        setSummary(sumData);
        
        const bizData = await apiClient.business.get();
        setBusiness(bizData);
        
        // Initialize form values
        Object.entries(bizData).forEach(([key, value]) => {
          setValue(key as any, value);
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [setValue]);

  const handleEditBiz = async (data: Partial<Business>) => {
    if (!business) return;
    setBizSaving(true);
    try {
      const updated = await apiClient.business.update(business.id, data);
      setBusiness(updated);
      setBizModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update business settings.');
    } finally {
      setBizSaving(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const bookings = await apiClient.bookings.getAll();
      csvExporter.exportBookings(bookings);
    } catch (err: any) {
      alert('Failed to export bookings: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !summary || !business) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Dashboard Error</h2>
        <p className="text-slate-500">{error || 'Could not load metrics.'}</p>
      </div>
    );
  }

  // Get AI insights
  const aiInsights = aiService.getAiAnalyticsInsights(summary, business);

  // Color mapping based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 50) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  // Pie chart colors
  const COLORS = ['#6366f1', '#10b981']; // indigo, emerald

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">Business Analytics</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {business.name}
            <button
              onClick={() => setBizModalOpen(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Edit Profile"
            >
              <Settings className="w-5 h-5" />
            </button>
          </h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-slate-200/60 dark:bg-slate-900 border border-slate-350 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Bookings CSV
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Total Revenue</span>
            <span className="text-xl font-bold font-sans">${summary.revenue}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Total Bookings</span>
            <span className="text-xl font-bold font-sans">{summary.totalBookings}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 block">+{summary.todaysBookings} today</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl shadow-sm">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-bold font-sans">{summary.conversionRate}%</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Active Campaigns</span>
            <span className="text-xl font-bold font-sans">{summary.activeOffers} / {summary.totalOffers}</span>
          </div>
        </GlassCard>
      </div>

      {/* AI INSIGHTS BLOCK WITH GAUGES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-1 flex flex-col items-center justify-between gap-6 relative">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI Booking Health
          </div>

          {/* Radial Circular Gauge */}
          <div className="relative flex items-center justify-center mt-6">
            <svg className="w-36 h-36">
              <circle
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="72"
                cy="72"
              />
              <circle
                className={`transition-all duration-500 ${getScoreColor(aiInsights.score)}`}
                strokeWidth="10"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * aiInsights.score) / 100}
                strokeLinecap="round"
                fill="transparent"
                r="58"
                cx="72"
                cy="72"
                transform="rotate(-90 72 72)"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{aiInsights.score}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Health Index</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h4 className="text-sm font-bold">{aiInsights.headline}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-500 px-4">
              Evaluated based on overall capacity utilization, funnel completions, and active promotion slots.
            </p>
          </div>
        </GlassCard>

        {/* Actionable Recommendations */}
        <GlassCard className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
            <Info className="w-4 h-4" />
            AI Optimization Plan
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {aiInsights.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-200/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
                <div className="shrink-0 mt-0.5">
                  {rec.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : rec.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Info className="w-5 h-5 text-indigo-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold">{rec.title}</h4>
                  <p className="text-xs text-slate-650 dark:text-slate-400">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Trends Chart */}
        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Weekly Booking Velocity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.bookingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1}/>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Revenue Trends Chart */}
        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Weekly Revenue Trends</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.revenueTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1}/>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* TOP CAMPAIGNS & SEAT UTILIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Campaigns */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Top Performing Offers</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/40 dark:border-slate-800/40 text-slate-400 dark:text-slate-500 text-xs uppercase font-bold">
                  <th className="pb-3">Offer Title</th>
                  <th className="pb-3 text-center">Booked seats</th>
                  <th className="pb-3 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/30">
                {summary.offerPerformance.map((op, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/10">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{op.title}</td>
                    <td className="py-3 text-center font-bold text-indigo-500">{op.bookings}</td>
                    <td className="py-3 text-right font-bold text-emerald-500">${op.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Capacity Utilization Pie Chart */}
        <GlassCard className="lg:col-span-1 space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Capacity Allocation</h3>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.capacityUtilization}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {summary.capacityUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
              <span>Booked: {summary.bookedSeats}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              <span>Available: {summary.availableSeats}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Edit Business Profile Modal */}
      <Modal isOpen={bizModalOpen} onClose={() => setBizModalOpen(false)} title="Edit Business Settings">
        <form onSubmit={handleSubmit(handleEditBiz)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Business Name</label>
              <input type="text" className="glass-input" {...register('name', { required: true })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Owner Name</label>
              <input type="text" className="glass-input" {...register('ownerName', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Phone Number</label>
              <input type="text" className="glass-input" {...register('phone')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Email Address</label>
              <input type="email" className="glass-input" {...register('email')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Address</label>
              <input type="text" className="glass-input" {...register('address')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">City</label>
              <input type="text" className="glass-input" {...register('city')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Opening Time</label>
              <input type="text" placeholder="HH:mm" className="glass-input" {...register('openingTime')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Closing Time</label>
              <input type="text" placeholder="HH:mm" className="glass-input" {...register('closingTime')} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold block">Logo Image URL</label>
            <input type="text" className="glass-input" {...register('logoUrl')} />
          </div>

          <button
            type="submit"
            disabled={bizSaving}
            className="w-full py-3 bg-gradient-primary rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-white"
          >
            {bizSaving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
