export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateBio = (bio) => {
  return bio && bio.length <= 150;
};

export const validateMessage = (message) => {
  return message && message.trim().length > 0 && message.length <= 1000;
};

export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return allowedTypes.includes(file.type);
};
