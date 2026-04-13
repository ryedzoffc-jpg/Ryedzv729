import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatRoom from '../components/chat/ChatRoom';
import { RiArrowLeftLine, RiPhoneLine, RiMoreLine } from 'react-icons/ri';
import userService from '../services/userService';
import { useFloatingChat } from '../hooks/useFloatingChat';
import { motion } from 'framer-motion';
import { getAvatarColor, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { openFloatingChat } = useFloatingChat();
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactInfo();
  }, [chatId, currentUser]);

  const loadContactInfo = async () => {
    try {
      const participants = chatId.split('_');
      const contactId = participants.find(id => id !== currentUser.uid);
      
      if (contactId) {
        const contact = await userService.getUserById(contactId);
        setContactInfo(contact);
      }
    } catch (error) {
      console.error('Error loading contact:', error);
      toast.error('Failed to load contact info');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFloating = () => {
    if (contactInfo) {
      openFloatingChat(chatId, contactInfo.name, contactInfo.uid);
      toast.success('Chat opened in floating mode');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-ryedz-primary text-white"
      >
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <RiArrowLeftLine className="text-xl" />
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: getAvatarColor(contactInfo?.name) }}
            >
              {contactInfo?.photoURL ? (
                <img
                  src={contactInfo.photoURL}
                  alt={contactInfo.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(contactInfo?.name)
              )}
            </div>

            <div className="flex-1" onClick={handleOpenFloating}>
              <h2 className="font-semibold">
                {contactInfo?.name || 'Unknown'}
              </h2>
              <p className="text-white/80 text-xs">
                {contactInfo?.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>

            <div className="flex gap-1">
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <RiPhoneLine className="text-xl" />
              </button>
              <button 
                onClick={handleOpenFloating}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <RiMoreLine className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Room */}
      <div className="flex-1 overflow-hidden">
        <ChatRoom chatId={chatId} />
      </div>
    </div>
  );
};

export default Chat;
