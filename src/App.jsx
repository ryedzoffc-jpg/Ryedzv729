import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import Chat from './Chat';  // ← IMPORT CHAT

// Login Page
function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const loginGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      navigate('/');
    } catch (err) {
      alert('Login gagal');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        <div className="text-6xl mb-4">💬</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ryedz Chat</h1>
        <p className="text-gray-500 mb-6">Modern Chat Experience</p>
        <button onClick={loginGuest} disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition">
          {loading ? 'Loading...' : 'Masuk sebagai Guest'}
        </button>
      </div>
    </div>
  );
}

// Home Page (Chat List)
function Home() {
  const navigate = useNavigate();
  const [chats] = useState([
    { id: 'room1', name: 'General Chat', lastMessage: 'Halo semua!', time: '09:30' },
    { id: 'room2', name: 'Random', lastMessage: 'Ada yang online?', time: '08:15' },
  ]);

  const logout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">💬 Ryedz Chat</h1>
          <button onClick={logout} className="text-sm bg-green-700 px-3 py-1 rounded-full">Logout</button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {chats.map(chat => (
          <div key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)} className="bg-white p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-lg">
              {chat.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
