import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PhoneLogin from './PhoneLogin';
import GoogleLogin from './GoogleLogin';
import { RiChatSmile3Fill, RiAdminLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('phone');

  return (
    <div className="min-h-screen bg-gradient-to-br from-ryedz-primary to-ryedz-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <RiChatSmile3Fill className="text-6xl text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Ryedz Chat</h1>
            <p className="text-white/80 text-sm">Modern Chat Experience</p>
          </div>

          <div className="flex gap-2 mb-6 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                loginMethod === 'phone'
                  ? 'bg-white text-ryedz-primary shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Phone
            </button>
            <button
              onClick={() => setLoginMethod('google')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                loginMethod === 'google'
                  ? 'bg-white text-ryedz-primary shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Google
            </button>
          </div>

          <motion.div
            key={loginMethod}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loginMethod === 'phone' ? <PhoneLogin /> : <GoogleLogin />}
          </motion.div>

          <div className="mt-6 text-center">
            <Link
              to="/admin-login"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <RiAdminLine />
              <span>Admin Access</span>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              By continuing, you agree to our{' '}
              <a href="#" className="text-white hover:underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-white hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
