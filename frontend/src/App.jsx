import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DebateProvider } from './context/DebateContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DebatePage from './pages/DebatePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from './components/ui/Toast';
import BackgroundEffects from './components/layout/BackgroundEffects';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DebateProvider>
          <div className="flex flex-col min-h-screen bg-transparent text-primary transition-all duration-300 relative">
            {/* Floating Background Glows & Grid */}
            <BackgroundEffects />

            {/* Navbar Header */}
            <Navbar />

            {/* Main Layout Area */}
            <div className="flex flex-1 w-full">
              <Sidebar />
              <main className="flex-grow flex flex-col min-w-0">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected routes */}
                  <Route
                    path="/debate"
                    element={
                      <ProtectedRoute>
                        <DebatePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <HistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all redirects */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>

            {/* Footer */}
            <Footer />

            {/* Custom styled hot-toasts */}
            <Toaster />
          </div>
        </DebateProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
