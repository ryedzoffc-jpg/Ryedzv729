import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from './firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// ==================== GENERATE ID ====================
const generateId = () => Math.floor(10000 + Math.random() * 90000).toString();

// ==================== LOGIN PAGE ====================
function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
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
      
      // LANGSUNG REDIRECT
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00a884, #008069)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>💬</h1>
        <h1 style={{ fontSize: '28px', marginBottom: '30px', color: '#333' }}>Ryedz Chat</h1>
        
        {error && (
          <div style={{ background: '#fee', color: '#c00', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        
        <button
          onClick={googleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#ccc' : 'white',
            border: '2px solid #ddd',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '20px' }}>G</span>
          {loading ? 'Loading...' : 'Login dengan Google'}
        </button>
        
        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          Kamu akan mendapatkan ID 5-digit unik
        </p>
      </div>
    </div>
  );
}

// ==================== HOME PAGE ====================
function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }
    
    getDoc(doc(db, 'users', user.uid)).then(doc => {
      if (doc.exists()) setUserData(doc.data());
    });
  }, [navigate]);

  const logout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!userData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e9edef' }}>
      {/* Header */}
      <div style={{ background: '#00a884', color: 'white', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {userData.photoURL && (
              <img src={userData.photoURL} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            )}
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Ryedz Chat</h1>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>ID: {userData.uniqueId}</p>
            </div>
          </div>
          <button onClick={logout} style={{ background: '#007a5e', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
          <img 
            src={userData.photoURL || 'https://via.placeholder.com/100'} 
            alt="" 
            style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px' }}
          />
          <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>{userData.name}</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{userData.bio}</p>
          
          <div style={{ background: '#f0f0f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>ID Kamu</p>
            <p style={{ fontSize: '32px', fontFamily: 'monospace', fontWeight: 'bold', color: '#00a884' }}>{userData.uniqueId}</p>
            <button 
              onClick={() => { navigator.clipboard.writeText(userData.uniqueId); alert('ID disalin!'); }}
              style={{ marginTop: '8px', padding: '8px 16px', background: '#00a884', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
            >
              📋 Salin ID
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
          <p>💬 Fitur chat akan segera hadir!</p>
        </div>
      </div>
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

// ==================== APP ====================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
