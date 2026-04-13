import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { RiMessage3Line } from 'react-icons/ri';
import { useChatList } from '../../hooks/useChat';
import Loading from '../common/Loading';
import encryptionService from '../../services/encryptionService';
import { getAvatarColor, getInitials, truncateText } from '../../utils/helpers';

const ChatList = () => {
  const navigate = useNavigate();
  const { chats, loading } = useChatList();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
        <RiMessage3Line className="text-6xl mb-4 text-gray-300" />
        <p className="font-medium">No chats yet</p>
        <p className="text-sm text-center mt-1">Add contacts to start chatting</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {chats.map((chat, index) => {
        const lastMessage = chat.lastMessage 
          ? encryptionService.decryptMessage(chat.lastMessage)
          : '';
        
        return (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="bg-white hover:bg-gray-50 cursor-pointer transition-colors p-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: getAvatarColor(chat.contact?.name) }}
                >
                  {chat.contact?.photoURL ? (
                    <img
                      src={chat.contact.photoURL}
                      alt={chat.contact.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(chat.contact?.name)
                  )}
                </div>
                {chat.contact?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">
                    {chat.contact?.name || 'Unknown'}
                  </h3>
                  {chat.lastMessageTime && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {format(chat.lastMessageTime.toDate(), 'HH:mm')}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 truncate">
                    {truncateText(lastMessage, 25) || 'No messages yet'}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-ryedz-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChatList;
