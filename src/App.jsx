import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from './firebase';
import { 
  signInWithRedirect, 
  getRedirectResult,
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot, orderBy, serverTimestamp, addDoc 
} from 'firebase/firestore';

// Generate 5-digit ID
const generateId = () => Math.floor(10000 + Math.random() * 90000).toString();

// ==================== LOGIN PAGE ====================
function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cek redirect result
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          const uniqueId = generateId();
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uniqueId: uniqueId,
            bio: 'Hai! Saya pakai Ryedz Chat',
            createdAt: serverTimestamp(),
            isOnline: true,
          });
        }
        navigate('/');
      }
    }).catch((err) => {
      console.error('Redirect error:', err);
      if (err.code !== 'auth/cancelled-popup-request') {
        setError(err.message);
      }
    });
  }, [navigate]);

  const googleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        <div className="text-6xl mb-4">💬</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ryedz Chat</h1>
        <p className="text-gray-500 mb-6">Login dengan Google</p>
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <button 
          onClick={googleLogin}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <span className="text-xl">🔐</span>
          {loading ? 'Mengalihkan...' : 'Login dengan Google'}
        </button>
        
        <p className="text-xs text-gray-400 mt-4">
          Kamu akan dialihkan ke halaman Google
        </p>
      </div>
    </div>
  );
}

// ==================== HOME PAGE ====================
function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chats, setChats] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    getDoc(doc(db, 'users', user.uid)).then(doc => {
      if (doc.exists()) setUserData(doc.data());
    });

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const otherId = data.participants.find(id => id !== user.uid);
          const otherUser = await getDoc(doc(db, 'users', otherId));
          return {
            id: docSnap.id,
            ...data,
            contact: otherUser.data(),
          };
        })
      );
      setChats(chatList);
    });

    return () => unsubscribe();
  }, []);

  const addContact = async () => {
    if (!searchId || searchId.length !== 5) return alert('Masukkan ID 5-digit');
    
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uniqueId', '==', searchId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        alert('User tidak ditemukan');
        setLoading(false);
        return;
      }
      
      const contactData = snapshot.docs[0].data();
      const contactId = contactData.uid;
      const userId = auth.currentUser.uid;
      
      if (contactId === userId) {
        alert('Ini ID kamu sendiri!');
        setLoading(false);
        return;
      }
      
      const chatId = [userId, contactId].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          participants: [userId, contactId],
          createdAt: serverTimestamp(),
        });
        alert('Kontak berhasil ditambahkan!');
      } else {
        alert('Kontak sudah ada!');
      }
      
      setShowAdd(false);
      setSearchId('');
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
    setLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userData?.photoURL && (
              <img src={userData.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <h1 className="text-xl font-bold">Ryedz Chat</h1>
              <p className="text-xs text-green-100">ID Kamu: {userData?.uniqueId || '...'}</p>
            </div>
          </div>
          <button onClick={logout} className="text-sm bg-green-700 px-3 py-1 rounded-full">
            Logout
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <p className="text-sm text-gray-500">ID Kamu</p>
          <p className="text-3xl font-mono font-bold text-green-600">{userData?.uniqueId}</p>
          <p className="text-xs text-gray-400 mt-1">Bagikan ID ini ke teman untuk ditambahkan</p>
        </div>
        
        <button 
          onClick={() => setShowAdd(true)}
          className="w-full bg-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition"
        >
          + Tambah Kontak
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {chats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">💬</p>
            <p>Belum ada chat</p>
            <p className="text-sm">Tambah kontak untuk mulai chat</p>
          </div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="bg-white p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold text-lg">
                {chat.contact?.photoURL ? (
                  <img src={chat.contact.photoURL} alt="" className="w-full h-full rounded-full" />
                ) : (
                  chat.contact?.name?.[0] || '?'
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{chat.contact?.name}</h3>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'Mulai chat'}</p>
              </div>
              {chat.contact?.isOnline && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Kontak</h2>
            <p className="text-sm text-gray-500 mb-2">Masukkan ID 5-digit teman kamu</p>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="48291"
              maxLength="5"
              className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-2xl font-mono"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-gray-200 rounded-full">
                Batal
              </button>
              <button onClick={addContact} disabled={loading} className="flex-1 py-3 bg-green-500 text-white rounded-full">
                {loading ? '...' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CHAT PAGE ====================
function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contact, setContact] = useState(null);
  const messagesEndRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!id || !user) return;

    const loadContact = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', id));
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        const otherId = data.participants.find(uid => uid !== user.uid);
        const contactDoc = await getDoc(doc(db, 'users', otherId));
        if (contactDoc.exists()) setContact(contactDoc.data());
      }
    };
    loadContact();

    const messagesRef = collection(db, 'chats', id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [id, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, 'chats', id, 'messages'), {
      text: newMessage,
      senderId: user.uid,
      timestamp: serverTimestamp(),
    });
    
    await setDoc(doc(db, 'chats', id), {
      lastMessage: newMessage,
      lastMessageTime: serverTimestamp(),
    }, { merge: true });
    
    setNewMessage('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-200">
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-2xl">←</button>
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold">
          {contact?.photoURL ? (
            <img src={contact.photoURL} alt="" className="w-full h-full rounded-full" />
          ) : (
            contact?.name?.[0] || '?'
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{contact?.name || 'Loading...'}</h2>
          <p className="text-xs text-green-100">{contact?.isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-4 py-2 ${isMe ? 'bg-green-100' : 'bg-white'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-[10px] text-gray-500 text-right mt-1">
                  {msg.timestamp?.toDate?.().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-white p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <button type="submit" className="px-6 bg-green-600 text-white rounded-full font-semibold">
          Kirim
        </button>
      </form>
    </div>
  );
}

// ==================== PROTECTED ROUTE ====================
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

// ==================== IMPORTS & APP ====================
import { useParams, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

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
