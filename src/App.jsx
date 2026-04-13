import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA4LmonPFC7CfjD3Y3xZbVsUWr-WEKrN0c",
  authDomain: "ryedzoffc-2d40f.firebaseapp.com",
  projectId: "ryedzoffc-2d40f",
  storageBucket: "ryedzoffc-2d40f.firebasestorage.app",
  messagingSenderId: "1053013297416",
  appId: "1:1053013297416:web:07741babea215a8bb5c4bd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Halaman Login Simple
function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const loginGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      navigate('/');
    } catch (err) {
      alert('Login gagal: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-3xl font-bold text-gray-800">Ryedz Chat</h1>
          <p className="text-gray-500 mt-1">WhatsApp Clone Modern</p>
        </div>
        
        <button 
          onClick={loginGuest}
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Masuk sebagai Guest'}
        </button>
      </div>
    </div>
  );
}

// Halaman Chat List
function Home() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([
    { id: '1', name: 'Sarah Chen', lastMessage: 'Halo! Apa kabar?', time: '09:30', unread: 2 },
    { id: '2', name: 'Alex Kumar', lastMessage: 'Besok meeting jam 3', time: '08:15', unread: 0 },
    { id: '3', name: 'Maria Garcia', lastMessage: 'Oke siap!', time: 'Kemarin', unread: 1 },
  ]);

  const logout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">💬 Ryedz Chat</h1>
          <button onClick={logout} className="text-sm bg-green-700 px-3 py-1 rounded-full">
            Logout
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="divide-y divide-gray-200">
        {chats.map(chat => (
          <div 
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="bg-white p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-lg">
              {chat.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
        <button className="text-green-600 font-semibold">Chats</button>
        <button className="text-gray-400">Panggilan</button>
        <button className="text-gray-400">Kontak</button>
        <button className="text-gray-400">Setelan</button>
      </div>
    </div>
  );
}

// Halaman Chat Room
function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Data dummy chat
  const dummyMessages = [
    { id: 1, text: 'Halo!', sender: 'them', time: '09:30' },
    { id: 2, text: 'Hai! Apa kabar?', sender: 'me', time: '09:31' },
    { id: 3, text: 'Baik! Kamu gimana?', sender: 'them', time: '09:32' },
    { id: 4, text: 'Aku juga baik. Lagi ngapain?', sender: 'me', time: '09:33' },
    { id: 5, text: 'Lagi santai aja nih', sender: 'them', time: '09:34' },
  ];

  useEffect(() => {
    setMessages(dummyMessages);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-200">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-xl">←</button>
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold">
          S
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">Sarah Chen</h2>
          <p className="text-xs text-green-100">Online</p>
        </div>
        <button className="text-xl">📞</button>
        <button className="text-xl">⋮</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
              msg.sender === 'me' 
                ? 'bg-green-100 text-gray-800' 
                : 'bg-white text-gray-800'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className="text-[10px] text-gray-500 text-right mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white p-4 border-t border-gray-200 flex gap-2">
        <button type="button" className="text-2xl text-gray-500">😊</button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <button type="button" className="text-2xl text-gray-500">📎</button>
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="text-2xl text-green-600 disabled:opacity-50"
        >
          ➤
        </button>
      </form>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

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

// Fix Navigate import
import { Navigate } from 'react-router-dom';

export default App;
