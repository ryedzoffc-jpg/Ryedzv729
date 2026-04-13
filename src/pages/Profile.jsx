import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { 
  RiArrowLeftLine, 
  RiCameraLine, 
  RiEdit2Line, 
  RiFileCopyLine,
  RiCheckLine 
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import userService from '../services/userService';
import { getAvatarColor, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { userData, currentUser, setUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}/${Date.now()}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await userService.updateProfile(currentUser.uid, { photoURL });
      setUserData({ ...userData, photoURL });
      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      await userService.updateProfile(currentUser.uid, { name, bio });
      setUserData({ ...userData, name, bio });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const copyUniqueId = () => {
    navigator.clipboard.writeText(userData?.uniqueId);
    setCopied(true);
    toast.success('ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="h-full bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-ryedz-primary text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <RiArrowLeftLine className="text-xl" />
            </button>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Profile Photo */}
            <div className="relative h-40 bg-gradient-to-r from-ryedz-primary to-ryedz-secondary">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: getAvatarColor(userData?.name) }}
                  >
                    {userData?.photoURL ? (
                      <img
                        src={userData.photoURL}
                        alt={userData.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(userData?.name)
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="absolute bottom-0 right-0 p-2 bg-ryedz-primary rounded-full text-white shadow-lg hover:bg-ryedz-secondary transition-colors"
                  >
                    <RiCameraLine />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 p-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ryedz-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows="3"
                      maxLength="150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ryedz-primary resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">{bio.length}/150</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex-1 py-2 bg-ryedz-primary text-white rounded-lg hover:bg-ryedz-secondary transition-colors"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setName(userData?.name || '');
                        setBio(userData?.bio || '');
                      }}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">{userData?.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">{userData?.bio || 'No bio yet'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Your Ryedz ID</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-mono font-bold text-ryedz-primary">
                        {userData?.uniqueId}
                      </p>
                      <button
                        onClick={copyUniqueId}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <RiCheckLine className="text-green-500 text-xl" />
                        ) : (
                          <RiFileCopyLine className="text-gray-600 text-xl" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Share this ID with friends to connect
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 bg-ryedz-primary text-white rounded-lg hover:bg-ryedz-secondary transition-colors flex items-center justify-center gap-2"
                  >
                    <RiEdit2Line />
                    <span>Edit Profile</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Account Info */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              {userData?.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{userData.phoneNumber}</span>
                </div>
              )}
              {userData?.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{userData.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">
                  {userData?.createdAt?.toDate().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
