export const APP_NAME = 'Ryedz Chat';
export const APP_VERSION = '1.0.0';

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
};

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CHAT: '/chat',
  PROFILE: '/profile',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin-login',
};

export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  MESSAGES: 'messages',
  CONTACTS: 'contacts',
};

export const DEFAULT_USER_BIO = 'Hey there! I am using Ryedz Chat';
export const MAX_MESSAGE_LENGTH = 1000;
export const MESSAGES_PER_PAGE = 50;

export const THEME_COLORS = {
  primary: '#00a884',
  secondary: '#008069',
  dark: '#111b21',
  light: '#e9edef',
};
