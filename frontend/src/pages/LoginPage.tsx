import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { LogIn, KeyRound, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Make sure details are correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] relative py-8">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 left-10 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl animate-pulse-slow" />

      <GlassCard className="w-full max-w-md p-8 space-y-6 rounded-3xl" hoverEffect={false}>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Admin Portal</h2>
          <p className="text-xs text-slate-500">
            Sign in to manage active offer slots, waitlists, and insights.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@slotify.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input pl-10"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-10"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center bg-slate-200/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-805/40 p-3 rounded-2xl">
          <p className="text-[11px] text-slate-500 leading-normal font-medium">
            Demo Credentials:
            <br />
            <span className="font-bold text-slate-800 dark:text-slate-350">admin@slotify.ai</span> / <span className="font-bold text-slate-800 dark:text-slate-350">Admin123!</span>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
