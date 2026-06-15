import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../features/authSlice';
import { apiSlice } from '../store/apiSlice';
import { Zap, LayoutDashboard, Bookmark, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/75 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-indigo-400 font-extrabold text-xl tracking-wider hover:opacity-90 transition-opacity">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <Zap className="h-5 w-5 fill-indigo-400" />
          </div>
          <span>
            flash<span className="text-white">Tracker</span>
          </span>
        </Link>

        {/* Auth specific navigation */}
        {user && (
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-indigo-400 bg-indigo-500/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/pinned"
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/pinned')
                    ? 'text-indigo-400 bg-indigo-500/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>Pinned Cards</span>
              </Link>
            </div>

            <div className="h-4 w-px bg-slate-800"></div>

            {/* Profile & Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full select-none">
                <div className="p-1 bg-indigo-500/20 rounded-full text-indigo-400">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-350">{user.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
