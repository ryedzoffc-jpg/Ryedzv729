import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import userService from '../services/userService';

export const useAuth = () => {
  const auth = useAuthContext();
  return auth;
};

export const useRequireAuth = (redirectTo = '/login') => {
  const { currentUser, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate(redirectTo);
    }
  }, [currentUser, loading, navigate, redirectTo]);

  return { currentUser, loading };
};

export const useUserStatus = (userId) => {
  const [status, setStatus] = useState({ isOnline: false, lastSeen: null });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = userService.listenToUserStatus(userId, (newStatus) => {
      setStatus(newStatus);
    });

    return () => unsubscribe();
  }, [userId]);

  return status;
};
