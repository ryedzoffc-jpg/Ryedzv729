import { format, formatDistance, isToday, isYesterday, isThisWeek } from 'date-fns';

export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE');
  } else {
    return format(date, 'dd/MM/yyyy');
  }
};

export const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Offline';
  
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  const distance = formatDistance(date, new Date(), { addSuffix: true });
  
  return `Last seen ${distance}`;
};

export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateChatId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

export const getInitials = (name) => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0]?.toUpperCase() || '?';
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export const validateUniqueId = (uniqueId) => {
  return /^\d{5}$/.test(uniqueId);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getAvatarColor = (name) => {
  const colors = [
    '#00a884', '#008069', '#1a73e8', '#d93025', '#e37400',
    '#c5221f', '#1e8e3e', '#9334e6', '#d01884', '#129eaf',
  ];
  
  if (!name) return colors[0];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};
