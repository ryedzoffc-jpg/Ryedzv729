import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  where,
  getDocs,
  setDoc,
  increment,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import encryptionService from './encryptionService';

class ChatService {
  async sendMessage(chatId, senderId, receiverId, messageText, type = 'text') {
    try {
      const encryptedMessage = encryptionService.encryptMessage(messageText);
      
      const messageData = {
        chatId,
        senderId,
        receiverId,
        message: encryptedMessage,
        type,
        timestamp: serverTimestamp(),
        status: 'sent',
        isEncrypted: true,
      };

      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const docRef = await addDoc(messagesRef, messageData);

      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        await updateDoc(chatRef, {
          lastMessage: encryptedMessage,
          lastMessageTime: serverTimestamp(),
          lastMessageSender: senderId,
          [`unreadCount.${receiverId}`]: increment(1),
        });
      }

      setTimeout(() => {
        this.updateMessageStatus(chatId, docRef.id, 'delivered');
      }, 1000);

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async updateMessageStatus(chatId, messageId, status) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, { status });
      return true;
    } catch (error) {
      console.error('Error updating message status:', error);
      return false;
    }
  }

  listenToMessages(chatId, callback) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          let decryptedMessage = data.message;
          
          if (data.isEncrypted) {
            decryptedMessage = encryptionService.decryptMessage(data.message);
          }

          messages.push({
            id: change.doc.id,
            ...data,
            message: decryptedMessage,
            timestamp: data.timestamp?.toDate(),
          });
        }
      });
      callback(messages);
    });

    return unsubscribe;
  }

  async markMessagesAsRead(chatId, userId) {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(
        messagesRef,
        where('receiverId', '==', userId),
        where('status', '!=', 'read')
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.forEach((doc) => {
        batch.update(doc.ref, { status: 'read' });
      });

      await batch.commit();

      await updateDoc(doc(db, 'chats', chatId), {
        [`unreadCount.${userId}`]: 0,
      });

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  async getOrCreateChat(userId1, userId2) {
    try {
      const chatId = [userId1, userId2].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          participants: [userId1, userId2],
          createdAt: serverTimestamp(),
          unreadCount: {
            [userId1]: 0,
            [userId2]: 0,
          },
        });
      }

      return chatId;
    } catch (error) {
      console.error('Error getting/creating chat:', error);
      throw error;
    }
  }

  async getAllChats() {
    try {
      const chatsRef = collection(db, 'chats');
      const snapshot = await getDocs(chatsRef);
      
      const chats = [];
      snapshot.forEach((doc) => {
        chats.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return chats;
    } catch (error) {
      console.error('Error getting all chats:', error);
      return [];
    }
  }

  async getChatMessages(chatId) {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      
      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let decryptedMessage = data.message;
        
        if (data.isEncrypted) {
          decryptedMessage = encryptionService.decryptMessage(data.message);
        }

        messages.push({
          id: doc.id,
          ...data,
          message: decryptedMessage,
          timestamp: data.timestamp?.toDate(),
        });
      });
      
      return messages;
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }
}

export default new ChatService();
