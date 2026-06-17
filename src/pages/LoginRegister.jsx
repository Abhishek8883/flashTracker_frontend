import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { clearError } from '../features/authSlice';
import { useLoginMutation, useRegisterMutation } from '../store/apiSlice';
import { Zap, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Mutations
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();

  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear redux error on component load or tab switch
    dispatch(clearError());
    setValidationError(null);
  }, [dispatch, isLogin]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    // Basic Validation
    if (isLogin) {
      if (!email || !password) {
        setValidationError('Please fill in all fields');
        return;
      }
    } else {
      if (!username || !email || !password || !confirmPassword) {
        setValidationError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters long');
        return;
      }
    }

    try {
      if (isLogin) {
        await login({ email, password }).unwrap();
      } else {
        await register({ username, email, password }).unwrap();
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mb-3">
            <Zap className="h-8 w-8 text-indigo-400 fill-indigo-400/20" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-450 mt-1.5">
            {isLogin ? 'Sign in to access your subjects' : 'Sign up to begin tracking your study progress'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${isLogin ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-450 hover:text-slate-200'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${!isLogin ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-450 hover:text-slate-200'
              }`}
          >
            Register
          </button>
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-start space-x-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-650"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-650"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white outline-none transition-all placeholder:text-slate-650"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white outline-none transition-all placeholder:text-slate-650"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.99] text-white font-semibold py-2.5 px-4 mt-2 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 "
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
