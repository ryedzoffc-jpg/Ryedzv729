import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { RiUserAddLine, RiMessage3Line } from 'react-icons/ri';
import userService from '../../services/userService';
import chatService from '../../services/chatService';
import Loading from '../common/Loading';
import { getAvatarColor, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ContactsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, [currentUser]);

  const loadContacts = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    const contactList = await userService.getContacts(currentUser.uid);
    setContacts(contactList);
    setLoading(false);
  };

  const startChat = async (contactId) => {
    try {
      const chatId = await chatService.getOrCreateChat(currentUser.uid, contactId);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
        <RiUserAddLine className="text-6xl mb-4 text-gray-300" />
        <p className="font-medium">No contacts yet</p>
        <p className="text-sm text-center mt-1">Add contacts using their 5-digit ID</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {contacts.map((contactItem, index) => (
        <motion.div
          key={contactItem.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="bg-white hover:bg-gray-50 transition-colors p-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: getAvatarColor(contactItem.contact?.name) }}
              >
                {contactItem.contact?.photoURL ? (
                  <img
                    src={contactItem.contact.photoURL}
                    alt={contactItem.contact.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(contactItem.contact?.name)
                )}
              </div>
              {contactItem.contact?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {contactItem.contact?.name || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {contactItem.contact?.bio || 'Hey there! I am using Ryedz Chat'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                ID: {contactItem.contact?.uniqueId}
              </p>
            </div>

            <button
              onClick={() => startChat(contactItem.contactId)}
              className="p-3 text-ryedz-primary hover:bg-ryedz-primary/10 rounded-full transition-colors"
            >
              <RiMessage3Line className="text-xl" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ContactsList;
