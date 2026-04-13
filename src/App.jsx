import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Simpan ke Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const uniqueId = Math.floor(10000 + Math.random() * 90000).toString();
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uniqueId: uniqueId,
          createdAt: serverTimestamp(),
        });
        alert('Akun berhasil dibuat! ID kamu: ' + uniqueId);
      } else {
        alert('Login berhasil! ID kamu: ' + userDoc.data().uniqueId);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      alert('Login gagal: ' + err.message);
    }
    
    setLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (!user) {
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
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>💬</h1>
          <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>Ryedz Chat</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Login dengan Google</p>
          
          {error && (
            <div style={{
              background: '#fee',
              color: '#c00',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <button
            onClick={login}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#ccc' : '#fff',
              border: '1px solid #ddd',
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
            Pastikan Google Sign-In sudah diaktifkan di Firebase Console
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <img 
          src={user.photoURL} 
          alt="Profile" 
          style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '20px' }}
        />
        <h2>Halo, {user.displayName}!</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>{user.email}</p>
        <button
          onClick={logout}
          style={{
            padding: '12px 30px',
            background: '#00a884',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
