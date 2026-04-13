import React, { createContext, useContext, useState, useCallback } from 'react';
import chatService from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState(null);

  const loadMessages = useCallback((chatId) => {
    if (unsubscribeMessages) {
      unsubscribeMessages();
    }

    const unsubscribe = chatService.listenToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      
      if (currentUser) {
        chatService.markMessagesAsRead(chatId, currentUser.uid);
      }
    });

    setUnsubscribeMessages(() => unsubscribe);
    setActiveChat(chatId);
  }, [currentUser, unsubscribeMessages]);

  const sendMessage = useCallback(async (chatId, receiverId, messageText, type = 'text') => {
    if (!currentUser || !messageText.trim()) return null;
    
    try {
      const messageId = await chatService.sendMessage(
        chatId,
        currentUser.uid,
        receiverId,
        messageText.trim(),
        type
      );
      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }, [currentUser]);

  const clearChat = useCallback(() => {
    if (unsubscribeMessages) {
      unsubscribeMessages();
      setUnsubscribeMessages(null);
    }
    setMessages([]);
    setActiveChat(null);
  }, [unsubscribeMessages]);

  const value = {
    activeChat,
    messages,
    chatList,
    setChatList,
    loadMessages,
    sendMessage,
    clearChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
