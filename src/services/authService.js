import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    this.secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'ryedz-secret-key-2024';
  }

  encryptMessage(message) {
    try {
      const encrypted = CryptoJS.AES.encrypt(message, this.secretKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return message;
    }
  }

  decryptMessage(encryptedMessage) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, this.secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedMessage;
    }
  }

  generateUniqueId() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  hashMessage(message) {
    return CryptoJS.SHA256(message).toString();
  }
}

export default new EncryptionService();
