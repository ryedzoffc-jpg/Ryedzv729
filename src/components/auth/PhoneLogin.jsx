import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import toast from 'react-hot-toast';
import { RiArrowRightLine, RiCheckLine } from 'react-icons/ri';
import authService from '../../services/authService';

const PhoneLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Please enter phone number');
      return;
    }

    setLoading(true);
    
    const result = await authService.sendOTP(phoneNumber, 'recaptcha-container');
    
    if (result.success) {
      setConfirmationResult(result.confirmation);
      setShowOtpInput(true);
      toast.success('OTP sent successfully!');
    } else {
      toast.error(result.error || 'Failed to send OTP');
    }
    
    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid OTP');
      return;
    }

    setLoading(true);
    
    const result = await authService.verifyOTP(confirmationResult, otp);
    
    if (result.success) {
      if (result.userExists) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        setShowNameInput(true);
        setShowOtpInput(false);
      }
    } else {
      toast.error(result.error || 'Invalid OTP');
    }
    
    setLoading(false);
  };

  const saveUserProfile = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    
    const user = authService.getCurrentUser();
    const result = await authService.createUserProfile(user, { name: name.trim() });
    
    if (result.success) {
      toast.success('Profile created successfully!');
      navigate('/');
    } else {
      toast.error('Failed to create profile');
    }
    
    setLoading(false);
  };

  if (showNameInput) {
    return (
      <form onSubmit={saveUserProfile} className="space-y-4">
        <div>
          <label className="block text-white text-sm mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-ryedz-primary rounded-lg font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    );
  }

  if (showOtpInput) {
    return (
      <form onSubmit={verifyOTP} className="space-y-4">
        <div>
          <label className="block text-white text-sm mb-2">
            Enter OTP sent to {phoneNumber}
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength="6"
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white text-center text-2xl tracking-widest"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-ryedz-primary rounded-lg font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
          <RiCheckLine className="text-xl" />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowOtpInput(false);
            setOtp('');
          }}
          className="w-full text-white text-sm hover:underline"
        >
          Change Phone Number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendOTP} className="space-y-4">
      <div>
        <label className="block text-white text-sm mb-2">Phone Number</label>
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="ID"
          value={phoneNumber}
          onChange={setPhoneNumber}
          className="!bg-white/20 !border !border-white/30 !rounded-lg"
          inputClassName="!bg-transparent !text-white !placeholder-white/60 !border-none !focus:outline-none"
        />
      </div>
      
      <div id="recaptcha-container"></div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-white text-ryedz-primary rounded-lg font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? 'Sending...' : 'Send OTP'}
        <RiArrowRightLine className="text-xl" />
      </button>
    </form>
  );
};

export default PhoneLogin;
