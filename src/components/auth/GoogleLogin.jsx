import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const GoogleLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    const result = await authService.signInWithGoogle();
    
    if (result.success) {
      if (result.userExists) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        await authService.createUserProfile(result.user);
        toast.success('Account created successfully!');
        navigate('/');
      }
    } else {
      toast.error(result.error || 'Failed to login with Google');
    }
    
    setLoading(false);
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full py-3 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
    >
      <FcGoogle className="text-2xl" />
      <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
    </button>
  );
};

export default GoogleLogin;
