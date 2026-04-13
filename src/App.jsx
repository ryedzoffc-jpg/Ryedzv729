import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from './firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// ==================== STYLES ====================
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

// Inject styles
if (!document.querySelector('style[data-app]')) {
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-app', 'true');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c75 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        animation: 'fadeInUp 0.6s ease-out',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '56px',
          marginBottom: '20px',
          animation: 'slideInLeft 0.6s ease-out 0.2s both'
        }}>
          💬
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#f1f5f9',
          letterSpacing: '-0.5px',
          animation: 'slideInLeft 0.6s ease-out 0.3s both'
        }}>
          Ryedz Chat
        </h1>
        
        {/* Subtitle */}
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          marginBottom: '32px',
          animation: 'slideInLeft 0.6s ease-out 0.4s both'
        }}>
          Terhubung dengan siapa saja, kapan saja
        </p>
        
        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '13px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {/* Login Button */}
        <button
          onClick={googleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            boxShadow: loading ? 'none' : '0 8px 16px rgba(59, 130, 246, 0.4)',
            opacity: loading ? 0.7 : 1,
            transform: loading ? 'scale(0.98)' : 'scale(1)',
            animation: 'slideInLeft 0.6s ease-out 0.5s both'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Memproses...' : 'Masuk dengan Google'}
        </button>
        
        {/* Footer */}
        <p style={{
          fontSize: '12px',
          color: '#64748b',
          marginTop: '28px',
          animation: 'slideInLeft 0.6s ease-out 0.6s both'
        }}>
          ✨ Dapatkan ID 5-digit unik untuk berbagi
        </p>
      </div>
    </div>
  );
}

// ==================== HOME PAGE ====================
function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const copyId = () => {
    navigator.clipboard.writeText(userData.uniqueId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!userData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#3b82f6',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          Memuat...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c75 100%)',
      color: '#f1f5f9'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Left */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              fontSize: '24px'
            }}>
              💬
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '700',
                letterSpacing: '-0.3px'
              }}>
                Ryedz Chat
              </h1>
              <p style={{
                fontSize: '12px',
                color: '#64748b'
              }}>
                ID: <span style={{ color: '#3b82f6', fontWeight: '600' }}>{userData.uniqueId}</span>
              </p>
            </div>
          </div>

          {/* Right */}
          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        {/* Profile Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '32px',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          {/* Avatar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '28px'
          }}>
            <div style={{
              position: 'relative'
            }}>
              <img 
                src={userData.photoURL || 'https://via.placeholder.com/120'} 
                alt={userData.name}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '16px',
                  border: '3px solid rgba(59, 130, 246, 0.3)',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '16px',
                height: '16px',
                background: '#10b981',
                borderRadius: '50%',
                border: '3px solid #0f172a',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
              }} />
            </div>
          </div>

          {/* Name */}
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            {userData.name}
          </h2>

          {/* Bio */}
          <p style={{
            color: '#94a3b8',
            textAlign: 'center',
            fontSize: '14px',
            marginBottom: '32px'
          }}>
            {userData.bio}
          </p>

          {/* ID Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '28px',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '12px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ID Unik Kamu
            </p>
            <p style={{
              fontSize: '40px',
              fontFamily: 'monospace',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '20px',
              letterSpacing: '2px'
            }}>
              {userData.uniqueId}
            </p>
            <button 
              onClick={copyId}
              style={{
                padding: '10px 24px',
                background: copied ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                color: copied ? '#86efac' : 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.3s ease',
                boxShadow: copied ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => !copied && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !copied && (e.target.style.transform = 'translateY(0)')}
            >
              {copied ? '✓ Disalin!' : '📋 Salin ID'}
            </button>
          </div>

          {/* Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Email</p>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{userData.email}</p>
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Status</p>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#86efac' }}>Online</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '2px dashed rgba(148, 163, 184, 0.2)',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
          animation: 'fadeInUp 0.6s ease-out 0.2s both'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#e2e8f0'
          }}>
            Fitur Chat Segera Hadir
          </h3>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            Kami sedang menyiapkan pengalaman chat yang luar biasa untuk kamu. Tunggu update selanjutnya! 💬
          </p>
        </div>
      </main>
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#3b82f6',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          Memproses...
        </div>
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
