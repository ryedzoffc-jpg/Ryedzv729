import React from 'react';
import { useFloatingChat } from '../../hooks/useFloatingChat';
import FloatingChat from './FloatingChat';

const FloatingChatContainer = () => {
  const { 
    floatingChats, 
    closeFloatingChat, 
    minimizeFloatingChat,
    updateChatPosition 
  } = useFloatingChat();

  return (
    <>
      {floatingChats.map((chat) => (
        <FloatingChat
          key={chat.id}
          chatId={chat.chatId}
          contactName={chat.contactName}
          contactPhoto={chat.contactPhoto}
          position={chat.position}
          isMinimized={chat.isMinimized}
          onClose={() => closeFloatingChat(chat.chatId)}
          onMinimize={() => minimizeFloatingChat(chat.chatId)}
          onPositionChange={(pos) => updateChatPosition(chat.chatId, pos)}
        />
      ))}
    </>
  );
};

export default FloatingChatContainer;
