
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Navbar from './components/Navbar';
import { User, AuthState } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('hq_user');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isAuthenticated: !!savedUser,
    };
  });

  const login = (user: User) => {
    localStorage.setItem('hq_user', JSON.stringify(user));
    setAuth({ user, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('hq_user');
    setAuth({ user: null, isAuthenticated: false });
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!auth.isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        {auth.isAuthenticated && auth.user && (
          <Navbar user={auth.user} onLogout={logout} />
        )}

        <main className="flex-grow">
          <Routes>
            <Route
              path="/login"
              element={
                !auth.isAuthenticated
                  ? <LoginPage onLogin={login} />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/signup"
              element={
                !auth.isAuthenticated
                  ? <SignupPage onSignup={login} />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage user={auth.user!} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage user={auth.user!} />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
