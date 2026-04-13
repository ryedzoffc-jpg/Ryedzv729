import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import chatService from '../services/chatService';
import userService from '../services/userService';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useChatList = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const contactId = data.participants.find(id => id !== currentUser.uid);
          const contact = await userService.getUserById(contactId);
          
          return {
            id: doc.id,
            ...data,
            contact,
            unreadCount: data.unreadCount?.[currentUser.uid] || 0,
          };
        })
      );

      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { chats, loading };
};

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    const unsubscribe = chatService.listenToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = useCallback(async (receiverId, messageText, type = 'text') => {
    const { currentUser } = useAuth();
    if (!currentUser || !messageText.trim()) return null;
    
    return await chatService.sendMessage(
      chatId,
      currentUser.uid,
      receiverId,
      messageText.trim(),
      type
    );
  }, [chatId]);

  return { messages, loading, sendMessage };
};
