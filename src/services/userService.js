import { db } from './firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  setDoc
} from 'firebase/firestore';

class UserService {
  async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUserStatus(userId, isOnline) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async searchUserByUniqueId(uniqueId) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uniqueId', '==', uniqueId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error searching user:', error);
      return null;
    }
  }

  listenToUserStatus(userId, callback) {
    const userRef = doc(db, 'users', userId);
    
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen?.toDate(),
        });
      }
    });
  }

  async updateProfile(userId, data) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  async addContact(userId, contactId) {
    try {
      const contactRef = doc(db, 'contacts', `${userId}_${contactId}`);
      await setDoc(contactRef, {
        userId,
        contactId,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error adding contact:', error);
      return false;
    }
  }

  async getContacts(userId) {
    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const contacts = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const contactInfo = await this.getUserById(data.contactId);
        if (contactInfo) {
          contacts.push({
            id: doc.id,
            ...data,
            contact: contactInfo,
          });
        }
      }
      
      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }
}

export default new UserService();
