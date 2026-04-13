import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from './firebase';
import { 
  signInWithRedirect, 
  getRedirectResult,
  onAuthStateChanged, 
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, collection, query, where, getDocs, 
  onSnapshot, orderBy, serverTimestamp, addDoc, updateDoc 
} from 'firebase/firestore';
import CryptoJS from 'crypto-js';

// ==================== ENCRYPTION ====================
const SECRET_KEY = 'ryedz-secret-2024';
const encrypt = (text) => CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
const decrypt = (text) => {
  try {
    return CryptoJS.AES.decrypt(text, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  } catch { return text; }
};

// ==================== GENERATE ID ====================
const generateId = () => Math.floor(10000 + Math.random() * 90000).toString();

// ==================== SPLASH SCREEN ====================
function SplashScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => { setTimeout(() => setShow(false), 2000); }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-8xl mb-4 animate-bounce">💬</div>
        <h1 className="text-5xl font-bold text-white">Ryedz Chat</h1>
        <p className="text-white/80 mt-2">Modern Chat Experience</p>
      </div>
    </div>
  );
}

// ==================== LOGIN PAGE ====================
function Login() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [showName, setShowName] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          const uniqueId = generateId();
          await setDoc(userRef, {
            uid: user.uid, name: user.displayName, email: user.email,
            photoURL: user.photoURL, uniqueId, bio: 'Hai! Saya pakai Ryedz Chat',
            createdAt: serverTimestamp(), isOnline: true,
          });
        }
        navigate('/');
      }
    }).catch(err => { if (err.code !== 'auth/cancelled-popup-request') setError(err.message); });
  }, [navigate]);

  useEffect(() => {
    if (method === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha', { size: 'invisible' });
    }
  }, [method]);

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmResult(confirmation); setShowOtp(true);
      alert('OTP terkirim! Untuk testing gunakan: 123456');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await confirmResult.confirm(otp);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) { setShowName(true); setShowOtp(false); }
      else { navigate('/'); }
    } catch (err) { setError('OTP salah! Coba 123456'); }
    setLoading(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    const uniqueId = generateId();
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid, name, phoneNumber: user.phoneNumber, uniqueId,
      bio: 'Hai! Saya pakai Ryedz Chat', photoURL: null,
      createdAt: serverTimestamp(), isOnline: true,
    });
    navigate('/');
  };

  const googleLogin = () => signInWithRedirect(auth, googleProvider);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-3xl font-bold text-gray-800">Ryedz Chat</h1>
          <p className="text-gray-500">Login dengan Nomor HP atau Google</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {showName ? (
          <form onSubmit={saveProfile}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkap" className="w-full px-4 py-3 border rounded-lg mb-4" />
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-full font-semibold">{loading ? 'Menyimpan...' : 'Lanjutkan'}</button>
          </form>
        ) : showOtp ? (
          <form onSubmit={verifyOTP}>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Kode OTP (123456)" maxLength="6" className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-2xl" />
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-full font-semibold">{loading ? 'Verifikasi...' : 'Verifikasi'}</button>
          </form>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMethod('phone')} className={`flex-1 py-2 rounded-lg ${method === 'phone' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>Nomor HP</button>
              <button onClick={() => setMethod('google')} className={`flex-1 py-2 rounded-lg ${method === 'google' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>Google</button>
            </div>
            {method === 'phone' ? (
              <form onSubmit={sendOTP}>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+6281234567890" className="w-full px-4 py-3 border rounded-lg mb-4" />
                <div id="recaptcha"></div>
                <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-full font-semibold">{loading ? 'Mengirim...' : 'Kirim OTP'}</button>
                <p className="text-xs text-gray-500 mt-2 text-center">Testing: OTP selalu 123456</p>
              </form>
            ) : (
              <button onClick={googleLogin} className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-full font-semibold flex items-center justify-center gap-2">🔐 Login dengan Google</button>
            )}
          </>
        )}
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
    getDoc(doc(db, 'users', user.uid)).then(doc => { if (doc.exists()) setUserData(doc.data()); });
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        const other = data.participants.find(id => id !== user.uid);
        const contact = await getDoc(doc(db, 'users', other));
        return { id: d.id, ...data, contact: contact.data() };
      }));
      setChats(list.sort((a,b) => (b.lastMessageTime?.seconds||0) - (a.lastMessageTime?.seconds||0)));
    });
    return () => unsubscribe();
  }, []);

  const addContact = async () => {
    if (!searchId || searchId.length !== 5) return alert('Masukkan ID 5-digit');
    setLoading(true);
    const q = query(collection(db, 'users'), where('uniqueId', '==', searchId));
    const snap = await getDocs(q);
    if (snap.empty) { alert('User tidak ditemukan'); setLoading(false); return; }
    const contact = snap.docs[0].data();
    if (contact.uid === auth.currentUser.uid) { alert('Ini ID kamu sendiri!'); setLoading(false); return; }
    const chatId = [auth.currentUser.uid, contact.uid].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
      await setDoc(chatRef, { participants: [auth.currentUser.uid, contact.uid], createdAt: serverTimestamp() });
      alert('Kontak berhasil ditambahkan!');
    } else { alert('Kontak sudah ada!'); }
    setShowAdd(false); setSearchId(''); setLoading(false);
  };

  const logout = async () => {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { isOnline: false });
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#e9edef]">
      <div className="bg-[#00a884] text-white p-4 pt-safe">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userData?.photoURL && <img src={userData.photoURL} alt="" className="w-10 h-10 rounded-full" />}
            <div>
              <h1 className="text-xl font-bold">Ryedz Chat</h1>
              <p className="text-xs opacity-90">ID: {userData?.uniqueId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/profile')} className="p-2">👤</button>
            <button onClick={logout} className="p-2">🚪</button>
          </div>
        </div>
      </div>

      <div className="p-3">
        <button onClick={() => setShowAdd(true)} className="w-full bg-white py-3 rounded-full text-[#00a884] font-semibold shadow">+ Tambah Kontak</button>
      </div>

      <div className="bg-white rounded-t-3xl min-h-screen">
        {chats.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-6xl mb-4">💬</p>
            <p>Belum ada chat</p>
            <p className="text-sm">Tambah kontak untuk mulai chat</p>
          </div>
        ) : (
          chats.map(chat => (
            <div key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)} className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                  {chat.contact?.photoURL ? <img src={chat.contact.photoURL} alt="" className="w-full h-full rounded-full" /> : chat.contact?.name?.[0]}
                </div>
                {chat.contact?.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{chat.contact?.name}</h3>
                  <span className="text-xs text-gray-400">{chat.lastMessageTime?.toDate?.().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage ? decrypt(chat.lastMessage) : 'Mulai chat'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Kontak</h2>
            <input type="text" value={searchId} onChange={e => setSearchId(e.target.value.replace(/\D/g, '').slice(0,5))} placeholder="Masukkan ID 5-digit" maxLength="5" className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-2xl font-mono" />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-gray-200 rounded-full">Batal</button>
              <button onClick={addContact} disabled={loading} className="flex-1 py-3 bg-green-500 text-white rounded-full">{loading ? '...' : 'Tambah'}</button>
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
  const [newMsg, setNewMsg] = useState('');
  const [contact, setContact] = useState(null);
  const bottomRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!id || !user) return;
    getDoc(doc(db, 'chats', id)).then(async (d) => {
      if (d.exists()) {
        const other = d.data().participants.find(uid => uid !== user.uid);
        const c = await getDoc(doc(db, 'users', other));
        if (c.exists()) setContact(c.data());
      }
    });
    const q = query(collection(db, 'chats', id, 'messages'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = []; snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
      setMessages(msgs);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => unsub();
  }, [id, user]);

  const send = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const encrypted = encrypt(newMsg);
    await addDoc(collection(db, 'chats', id, 'messages'), { text: encrypted, senderId: user.uid, timestamp: serverTimestamp() });
    await setDoc(doc(db, 'chats', id), { lastMessage: encrypted, lastMessageTime: serverTimestamp() }, { merge: true });
    setNewMsg('');
  };

  return (
    <div className="h-screen flex flex-col bg-[#e5ded5]">
      <div className="bg-[#00a884] text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-2xl">←</button>
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center font-bold">{contact?.photoURL ? <img src={contact.photoURL} alt="" className="w-full h-full rounded-full" /> : contact?.name?.[0]}</div>
        <div className="flex-1"><h2 className="font-semibold">{contact?.name}</h2><p className="text-xs opacity-90">{contact?.isOnline ? 'Online' : 'Offline'}</p></div>
        <button className="p-2">📞</button>
        <button className="p-2">⋮</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => {
          const isMe = m.senderId === user?.uid;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-4 py-2 shadow ${isMe ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                <p className="text-sm">{decrypt(m.text)}</p>
                <p className="text-[10px] text-gray-500 text-right mt-1">{m.timestamp?.toDate?.().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="bg-white p-4 flex gap-2 items-center">
        <button type="button" className="text-2xl">😊</button>
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Ketik pesan" className="flex-1 px-4 py-3 bg-gray-100 rounded-full" />
        <button type="button" className="text-2xl">📎</button>
        <button type="submit" className="w-10 h-10 bg-[#00a884] text-white rounded-full flex items-center justify-center">➤</button>
      </form>
    </div>
  );
}

// ==================== PROFILE PAGE ====================
function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(d => { if (d.exists()) { setUserData(d.data()); setName(d.data().name); setBio(d.data().bio); } });
  }, []);

  const save = async () => {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { name, bio });
    setUserData({ ...userData, name, bio });
    setEditing(false);
  };

  const copyId = () => { navigator.clipboard.writeText(userData?.uniqueId); alert('ID disalin!'); };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#00a884] text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-2xl">←</button>
        <h1 className="text-xl font-bold">Profile</h1>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {userData?.photoURL ? <img src={userData.photoURL} alt="" className="w-full h-full rounded-full" /> : userData?.name?.[0]}
            </div>
            {editing ? (
              <div className="w-full space-y-3">
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Nama" />
                <input value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Bio" />
                <div className="flex gap-2">
                  <button onClick={save} className="flex-1 py-2 bg-green-500 text-white rounded-lg">Simpan</button>
                  <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-gray-300 rounded-lg">Batal</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold">{userData?.name}</h2>
                <p className="text-gray-500">{userData?.bio}</p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full text-center">
                  <p className="text-sm text-gray-500">ID Kamu</p>
                  <p className="text-2xl font-mono font-bold text-green-600">{userData?.uniqueId}</p>
                  <button onClick={copyId} className="mt-2 text-sm text-green-600">📋 Salin ID</button>
                </div>
                <button onClick={() => setEditing(true)} className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg">Edit Profile</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN PAGE ====================
function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [stats, setStats] = useState({ users: 0, chats: 0, online: 0 });

  useEffect(() => {
    onSnapshot(collection(db, 'users'), (snap) => {
      const list = []; snap.forEach(d => list.push(d.data()));
      setUsers(list); setStats({ users: list.length, online: list.filter(u => u.isOnline).length, chats: stats.chats });
    });
    onSnapshot(collection(db, 'chats'), (snap) => {
      const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setChats(list); setStats({ ...stats, chats: list.length });
    });
  }, []);

  const logout = () => { signOut(auth); navigate('/admin-login'); };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🛡️ Admin Dashboard</h1>
        <button onClick={logout} className="bg-purple-700 px-3 py-1 rounded-full text-sm">Logout</button>
      </div>
      <div className="p-4 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow text-center"><p className="text-gray-500">Users</p><p className="text-2xl font-bold">{stats.users}</p></div>
        <div className="bg-white p-4 rounded-xl shadow text-center"><p className="text-gray-500">Chats</p><p className="text-2xl font-bold">{stats.chats}</p></div>
        <div className="bg-white p-4 rounded-xl shadow text-center"><p className="text-gray-500">Online</p><p className="text-2xl font-bold">{stats.online}</p></div>
      </div>
      <div className="p-4">
        <h2 className="font-semibold mb-2">Semua User</h2>
        {users.map(u => (
          <div key={u.uid} className="bg-white p-3 rounded-lg mb-2 flex justify-between">
            <div><span className="font-semibold">{u.name}</span><span className="text-sm text-gray-500 ml-2">ID: {u.uniqueId}</span></div>
            <span className={u.isOnline ? 'text-green-500' : 'text-gray-400'}>{u.isOnline ? 'Online' : 'Offline'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN LOGIN ====================
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const login = (e) => {
    e.preventDefault();
    if (email === 'admin@ryedz.com' && pass === 'admin123') {
      localStorage.setItem('admin', 'true');
      navigate('/admin');
    } else { alert('Email: admin@ryedz.com / Pass: admin123'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <form onSubmit={login} className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">🛡️ Admin Login</h1>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 border rounded-lg mb-3" />
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" className="w-full px-4 py-3 border rounded-lg mb-4" />
        <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold">Login</button>
        <p className="text-xs text-gray-500 text-center mt-4">Default: admin@ryedz.com / admin123</p>
      </form>
    </div>
  );
}

// ==================== PROTECTED ROUTE ====================
function ProtectedRoute({ children, admin }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }), []);
  if (loading) return <SplashScreen />;
  if (admin) return localStorage.getItem('admin') ? children : <Navigate to="/admin-login" />;
  if (!user) return <Navigate to="/login" />;
  return children;
}

// ==================== APP ====================
import { useParams, useRef } from 'react';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
