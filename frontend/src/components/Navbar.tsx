import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, LogIn, LayoutDashboard, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="glass-panel sticky top-0 z-40 px-6 py-4 border-b border-slate-200/20 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
            S
          </div>
          <span className="text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
            Slotify <span className="gradient-text font-extrabold">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isAdminRoute ? (
                <Link
                  to="/"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <Calendar className="w-4 h-4" />
                  View Storefront
                </Link>
              ) : (
                <Link
                  to="/admin/dashboard"
                  className="bg-gradient-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}

              <span className="hidden md:inline text-sm font-medium text-slate-600 dark:text-slate-400">
                {user?.fullName}
              </span>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-850 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Admin Portal
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
