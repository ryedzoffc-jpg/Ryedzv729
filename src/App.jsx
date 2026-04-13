import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, set, get, child, onValue, push, update, serverTimestamp } from 'firebase/database';

const generateId = () => Math.floor(10000 + Math.random() * 90000).toString();

// ==================== LOGIN ====================
function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Cek user di Realtime DB
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        const uniqueId = generateId();
        await set(userRef, {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          photoURL: user.photoURL,
          uniqueId: uniqueId,
          bio: 'Hai! Saya pakai Ryedz Chat',
          createdAt: Date.now(),
          isOnline: true,
        });
      } else {
        await update(userRef, { isOnline: true });
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        <div className="text-6xl mb-4">💬</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ryedz Chat</h1>
        <p className="text-gray-500 mb-6">Login dengan Google</p>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <button onClick={googleLogin} disabled={loading} className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50">
          {loading ? 'Loading...' : 'Login dengan Google'}
        </button>
        <p className="text-xs text-gray-400 mt-4">Kamu akan mendapatkan ID 5-digit unik</p>
      </div>
    </div>
  );
}

// ==================== HOME ====================
function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chats, setChats] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { navigate('/login'); return; }

    // Load user data
    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, (snap) => { if (snap.exists()) setUserData(snap.val()); });

    // Load chats
    const chatsRef = ref(db, `userChats/${user.uid}`);
    onValue(chatsRef, async (snap) => {
      if (!snap.exists()) return setChats([]);
      const chatList = [];
      for (const [chatId, data] of Object.entries(snap.val())) {
        const contactSnap = await get(ref(db, `users/${data.contactId}`));
        chatList.push({ id: chatId, contact: contactSnap.val(), lastMessage: data.lastMessage, lastTime: data.lastTime });
      }
      setChats(chatList.sort((a,b) => (b.lastTime||0) - (a.lastTime||0)));
    });
  }, [navigate]);

  const addContact = async () => {
    if (!searchId || searchId.length !== 5) return alert('Masukkan ID 5-digit');
    const usersRef = ref(db, 'users');
    const snap = await get(usersRef);
    if (!snap.exists()) return alert('User tidak ditemukan');
    
    let contact = null;
    snap.forEach((child) => { if (child.val().uniqueId === searchId) contact = child.val(); });
    
    if (!contact) return alert('User tidak ditemukan');
    if (contact.uid === auth.currentUser.uid) return alert('Ini ID kamu sendiri!');
    
    const chatId = [auth.currentUser.uid, contact.uid].sort().join('_');
    
    await set(ref(db, `userChats/${auth.currentUser.uid}/${chatId}`), { contactId: contact.uid });
    await set(ref(db, `userChats/${contact.uid}/${chatId}`), { contactId: auth.currentUser.uid });
    
    alert('Kontak berhasil ditambahkan!');
    setShowAdd(false); setSearchId('');
  };

  const logout = async () => {
    await update(ref(db, `users/${auth.currentUser.uid}`), { isOnline: false });
    await signOut(auth);
    navigate('/login');
  };

  if (!userData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userData.photoURL && <img src={userData.photoURL} alt="" className="w-10 h-10 rounded-full" />}
            <div><h1 className="text-xl font-bold">Ryedz Chat</h1><p className="text-xs">ID: {userData.uniqueId}</p></div>
          </div>
          <button onClick={logout} className="bg-green-700 px-3 py-1 rounded-full text-sm">Logout</button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg p-4 mb-4 shadow text-center">
          <p className="text-sm text-gray-500">ID Kamu</p>
          <p className="text-3xl font-mono font-bold text-green-600">{userData.uniqueId}</p>
          <button onClick={() => { navigator.clipboard.writeText(userData.uniqueId); alert('ID disalin!'); }} className="mt-2 text-sm text-green-600">📋 Salin ID</button>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-full bg-green-500 text-white py-3 rounded-full font-semibold">+ Tambah Kontak</button>
      </div>

      <div className="divide-y">
        {chats.length === 0 ? (
          <div className="text-center py-20 text-gray-500"><p className="text-4xl mb-2">💬</p><p>Belum ada chat</p></div>
        ) : (
          chats.map(chat => (
            <div key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)} className="bg-white p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center font-bold text-lg">{chat.contact?.photoURL ? <img src={chat.contact.photoURL} alt="" className="w-full h-full rounded-full" /> : chat.contact?.name?.[0]}</div>
              <div className="flex-1"><h3 className="font-semibold">{chat.contact?.name}</h3><p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'Mulai chat'}</p></div>
              {chat.contact?.isOnline && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Kontak</h2>
            <input value={searchId} onChange={e => setSearchId(e.target.value.replace(/\D/g,'').slice(0,5))} placeholder="Masukkan ID 5-digit" maxLength="5" className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-2xl font-mono" />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-gray-200 rounded-full">Batal</button>
              <button onClick={addContact} className="flex-1 py-3 bg-green-500 text-white rounded-full">Tambah</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CHAT ====================
function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [contact, setContact] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!id || !user) return;
    const chatRef = ref(db, `chats/${id}`);
    get(chatRef).then(async (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const otherId = data.participants.find(uid => uid !== user.uid);
        const contactSnap = await get(ref(db, `users/${otherId}`));
        if (contactSnap.exists()) setContact(contactSnap.val());
      }
    });
    const msgRef = ref(db, `messages/${id}`);
    onValue(msgRef, (snap) => {
      const msgs = []; snap.forEach((d) => msgs.push({ id: d.key, ...d.val() }));
      setMessages(msgs.sort((a,b) => a.timestamp - b.timestamp));
    });
  }, [id, user]);

  const send = async (e) => {
    e.preventDefault(); if (!newMsg.trim()) return;
    const msgRef = push(ref(db, `messages/${id}`));
    await set(msgRef, { text: newMsg, senderId: user.uid, timestamp: Date.now() });
    await update(ref(db, `userChats/${user.uid}/${id}`), { lastMessage: newMsg, lastTime: Date.now() });
    await update(ref(db, `userChats/${contact?.uid}/${id}`), { lastMessage: newMsg, lastTime: Date.now() });
    setNewMsg('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-200">
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-2xl">←</button>
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center font-bold">{contact?.photoURL ? <img src={contact.photoURL} alt="" className="w-full h-full rounded-full" /> : contact?.name?.[0]}</div>
        <div className="flex-1"><h2 className="font-semibold">{contact?.name}</h2><p className="text-xs">{contact?.isOnline ? 'Online' : 'Offline'}</p></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => {
          const isMe = m.senderId === user?.uid;
          return <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] rounded-lg px-4 py-2 ${isMe ? 'bg-green-100' : 'bg-white'}`}><p className="text-sm">{m.text}</p><p className="text-[10px] text-gray-500 text-right mt-1">{new Date(m.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</p></div></div>;
        })}
      </div>
      <form onSubmit={send} className="bg-white p-4 flex gap-2">
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Ketik pesan..." className="flex-1 px-4 py-3 bg-gray-100 rounded-full" />
        <button type="submit" className="px-6 bg-green-600 text-white rounded-full font-semibold">Kirim</button>
      </form>
    </div>
  );
}

// ==================== PROTECTED ====================
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }), []);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

// ==================== APP ====================
import { useParams } from 'react-router-dom';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
