import React, { createContext, useContext, useState, useCallback } from 'react';

const FloatingChatContext = createContext();

export const useFloatingChatContext = () => {
  const context = useContext(FloatingChatContext);
  if (!context) {
    throw new Error('useFloatingChatContext must be used within FloatingChatProvider');
  }
  return context;
};

export const FloatingChatProvider = ({ children }) => {
  const [floatingChats, setFloatingChats] = useState([]);

  const openFloatingChat = useCallback((chatId, contactName, contactId) => {
    setFloatingChats((prev) => {
      const existing = prev.find((chat) => chat.chatId === chatId);
      if (existing) return prev;
      
      return [...prev, {
        id: `${chatId}-${Date.now()}`,
        chatId,
        contactName,
        contactId,
        isMinimized: false,
        position: { x: 20, y: 100 + prev.length * 80 },
      }];
    });
  }, []);

  const closeFloatingChat = useCallback((chatId) => {
    setFloatingChats((prev) => prev.filter((chat) => chat.chatId !== chatId));
  }, []);

  const minimizeFloatingChat = useCallback((chatId) => {
    setFloatingChats((prev) =>
      prev.map((chat) =>
        chat.chatId === chatId
          ? { ...chat, isMinimized: !chat.isMinimized }
          : chat
      )
    );
  }, []);

  const updateChatPosition = useCallback((chatId, position) => {
    setFloatingChats((prev) =>
      prev.map((chat) =>
        chat.chatId === chatId ? { ...chat, position } : chat
      )
    );
  }, []);

  const value = {
    floatingChats,
    openFloatingChat,
    closeFloatingChat,
    minimizeFloatingChat,
    updateChatPosition,
  };

  return (
    <FloatingChatContext.Provider value={value}>
      {children}
    </FloatingChatContext.Provider>
  );
};

export const useFloatingChat = () => {
  const context = useFloatingChatContext();
  return context;
};
