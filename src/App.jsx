import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Chat from './Chat';

// Generate 5-digit unique ID
const generateUniqueId = () => Math.floor(10000 + Math.random() * 90000).toString();

// LOGIN PAGE
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

  // Setup Recaptcha
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  // Send OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    if (!phone) return alert('Masukkan nomor HP');
    
    setLoading(true);
    try {
      const verifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmResult(confirmation);
      setShowOtp(true);
      alert('OTP terkirim! Gunakan kode: 123456 (untuk testing)');
    } catch (err) {
      alert('Gagal kirim OTP: ' + err.message);
    }
    setLoading(false);
  };

  // Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return alert('Masukkan kode OTP');
    
    setLoading(true);
    try {
      const result = await confirmResult.confirm(otp);
      const user = result.user;
      
      // Cek user udah ada di database?
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        setShowName(true);
        setShowOtp(false);
      } else {
        navigate('/');
      }
    } catch (err) {
      alert('OTP salah! Coba 123456');
    }
    setLoading(false);
  };

  // Save Profile
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!name) return alert('Masukkan nama');
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      const uniqueId = generateUniqueId();
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        phoneNumber: user.phoneNumber,
        uniqueId: uniqueId,
        bio: 'Hai! Saya pakai Ryedz Chat',
        photoURL: null,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isOnline: true,
      });
      
      navigate('/');
    } catch (err) {
      alert('Gagal simpan profil');
    }
    setLoading(false);
  };

  // Google Login
  const googleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const uniqueId = generateUniqueId();
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          uniqueId: uniqueId,
          bio: 'Hai! Saya pakai Ryedz Chat',
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
          isOnline: true,
        });
      }
      
      navigate('/');
    } catch (err) {
      alert('Google login gagal: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-3xl font-bold text-gray-800">Ryedz Chat</h1>
          <p className="text-gray-500 mt-1">Login dengan Nomor HP atau Google</p>
        </div>

        {showName ? (
          <form onSubmit={saveProfile}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-full font-semibold">
              {loading ? 'Menyimpan...' : 'Lanjutkan'}
            </button>
          </form>
        ) : showOtp ? (
          <form onSubmit={verifyOTP}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Kode OTP (123456)"
              maxLength="6"
              className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-2xl"
            />
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-full font-semibold">
              {loading ? 'Verifikasi...' : 'Verifikasi'}
            </button>
          </form>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMethod('phone')} className={`flex-1 py-2 rounded-lg ${method === 'phone' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                Nomor HP
              </button>
              <button onClick={() => setMethod('google')} className={`flex-1 py-2 rounded-lg ${method === 'google' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                Google
              </button>
            </div>

            {method === 'phone' ? (
              <form onSubmit={sendOTP}>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="ID"
                  value={phone}
                  onChange={setPhone}
                  className="mb-4 border rounded-lg p-2"
                />
                <div id="recaptcha-container"></div>
                <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-full font-semibold">
                  {loading ? 'Mengirim...' : 'Kirim OTP'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">Testing: OTP selalu 123456</p>
              </form>
            ) : (
              <button onClick={googleLogin} disabled={loading} className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-full font-semibold flex items-center justify-center gap-2">
                🟢 Login dengan Google
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// HOME PAGE
function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(doc => {
        if (doc.exists()) setUserData(doc.data());
      });
    }
    
    setChats([
      { id: 'general', name: '💬 General Chat', lastMessage: 'Halo semua!', time: '09:30' },
      { id: 'random', name: '🎲 Random', lastMessage: 'Ada yang online?', time: '08:15' },
    ]);
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">💬 Ryedz Chat</h1>
            <p className="text-xs text-green-100">ID: {userData?.uniqueId || 'Loading...'}</p>
          </div>
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

// APP
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
