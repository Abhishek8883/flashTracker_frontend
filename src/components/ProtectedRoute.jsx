import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useGetCurrentUserQuery } from '../store/apiSlice';

export const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAppSelector((state) => state.auth);

  // RTK Query hook will automatically trigger me endpoint when token exists but user is not loaded
  useGetCurrentUserQuery(undefined, {
    skip: !token || !!user,
  });

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium">Restoring your session...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
