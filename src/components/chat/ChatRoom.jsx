import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Loading from '../common/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowDownLine } from 'react-icons/ri';
import { useInView } from 'react-intersection-observer';

const ChatRoom = ({ isFloating = false }) => {
  const { chatId } = useParams();
  const { currentUser } = useAuth();
  const { messages, loadMessages, sendMessage, clearChat } = useChat();
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const { ref: topRef, inView } = useInView();

  useEffect(() => {
    if (chatId) {
      setLoading(true);
      loadMessages(chatId);
      setLoading(false);
    }

    return () => {
      clearChat();
    };
  }, [chatId, loadMessages, clearChat]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const handleSendMessage = async (messageText) => {
    const contactId = chatId.split('_').find(id => id !== currentUser.uid);
    await sendMessage(chatId, contactId, messageText);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isFloating ? 'bg-gray-50' : 'bg-gray-100'}`}>
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-1"
      >
        <div ref={topRef} />
        
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
              isOwn={message.senderId === currentUser.uid}
            />
          ))}
        </AnimatePresence>

        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center text-gray-400">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 p-2 bg-white rounded-full shadow-lg text-ryedz-primary hover:bg-gray-50 transition-colors"
        >
          <RiArrowDownLine className="text-xl" />
        </motion.button>
      )}

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
