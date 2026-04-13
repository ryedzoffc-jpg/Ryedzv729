import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ChatList from '../components/chat/ChatList';
import ContactsList from '../components/contacts/ContactsList';
import AddContact from '../components/contacts/AddContact';
import { RiUserAddLine, RiMessage3Line, RiLogoutBoxLine, RiContactsLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import userService from '../services/userService';

const Home = () => {
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('chats');
  const [showAddContact, setShowAddContact] = useState(false);

  useEffect(() => {
    if (currentUser) {
      userService.updateUserStatus(currentUser.uid, true);
      
      const handleBeforeUnload = () => {
        userService.updateUserStatus(currentUser.uid, false);
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        userService.updateUserStatus(currentUser.uid, false);
      };
    }
  }, [currentUser]);

  const handleLogout = async () => {
    const result = await authService.logout();
    if (result.success) {
      toast.success('Logged out successfully');
      navigate('/login');
    } else {
      toast.error('Failed to logout');
    }
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-ryedz-primary text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Ryedz Chat</h1>
              <p className="text-white/80 text-sm">
                ID: {userData?.uniqueId || 'Loading...'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddContact(true)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <RiUserAddLine className="text-xl" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <RiLogoutBoxLine className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 font-medium transition-all relative ${
              activeTab === 'chats' ? 'text-ryedz-primary' : 'text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <RiMessage3Line />
              <span>Chats</span>
            </div>
            {activeTab === 'chats' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-ryedz-primary"
              />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-3 font-medium transition-all relative ${
              activeTab === 'contacts' ? 'text-ryedz-primary' : 'text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <RiContactsLine />
              <span>Contacts</span>
            </div>
            {activeTab === 'contacts' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-ryedz-primary"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <AnimatePresence mode="wait">
            {activeTab === 'chats' ? (
              <motion.div
                key="chats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full"
              >
                <ChatList />
              </motion.div>
            ) : (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <ContactsList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Contact Modal */}
        <AddContact 
          isOpen={showAddContact} 
          onClose={() => setShowAddContact(false)} 
        />
      </div>
    </Layout>
  );
};

export default Home;
