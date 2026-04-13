import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { FloatingChatProvider } from './hooks/useFloatingChat';
import SplashScreen from './components/common/SplashScreen';
import Login from './components/auth/Login';
import AdminLogin from './components/admin/AdminLogin';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import FloatingChatContainer from './components/chat/FloatingChatContainer';

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <div className="App h-screen w-full overflow-hidden bg-gray-100">
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#00a884',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#00a884',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Floating Chat Container */}
        <FloatingChatContainer />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <FloatingChatProvider>
          <AppContent />
        </FloatingChatProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
