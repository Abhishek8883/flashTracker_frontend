import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginRegister } from './pages/LoginRegister';
import { Dashboard } from './pages/Dashboard';
import { SubjectView } from './pages/SubjectView';
import { PinnedCards } from './pages/PinnedCards';
import { RevisionWindow } from './pages/RevisionWindow';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginRegister />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects/:id"
              element={
                <ProtectedRoute>
                  <SubjectView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pinned"
              element={
                <ProtectedRoute>
                  <PinnedCards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/topics/:id/revise"
              element={
                <ProtectedRoute>
                  <RevisionWindow />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
