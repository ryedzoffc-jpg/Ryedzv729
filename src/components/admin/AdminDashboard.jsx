import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RiUserLine, 
  RiMessage3Line, 
  RiEyeLine, 
  RiShieldUserLine,
  RiLogoutBoxLine,
  RiRefreshLine
} from 'react-icons/ri';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import userService from '../../services/userService';
import chatService from '../../services/chatService';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    activeChats: 0,
    onlineUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      
      const allChats = await chatService.getAllChats();
      setChats(allChats);
      
      const onlineCount = allUsers.filter(u => u.isOnline).length;
      const activeCount = allChats.filter(chat => {
        const lastMessage = chat.lastMessageTime?.toDate();
        if (!lastMessage) return false;
        const diffHours = (new Date() - lastMessage) / (1000 * 60 * 60);
        return diffHours < 24;
      }).length;
      
      setStats({
        totalUsers: allUsers.length,
        totalChats: allChats.length,
        activeChats: activeCount,
        onlineUsers: onlineCount,
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const viewChatMessages = async (chatId) => {
    setSelectedChat(chatId);
    const chatMessages = await chatService.getChatMessages(chatId);
    setMessages(chatMessages);
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: RiUserLine },
    { id: 'chats', label: 'Chats', icon: RiMessage3Line },
    { id: 'observer', label: 'Observer', icon: RiEyeLine },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiShieldUserLine className="text-3xl" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <RiRefreshLine className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <RiLogoutBoxLine className="text-xl" />
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <RiUserLine className="text-4xl text-white/50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Online Users</p>
                  <p className="text-3xl font-bold">{stats.onlineUsers}</p>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Chats</p>
                  <p className="text-3xl font-bold">{stats.totalChats}</p>
                </div>
                <RiMessage3Line className="text-4xl text-white/50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Active (24h)</p>
                  <p className="text-3xl font-bold">{stats.activeChats}</p>
                </div>
                <RiEyeLine className="text-4xl text-white/50" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon />
                <span>{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.uid} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                user.name?.[0] || '?'
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email || user.phoneNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm">{user.uniqueId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 ${user.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                            {user.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.createdAt?.toDate().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'chats' && (
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
              {chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <RiMessage3Line className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>No chats available</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div key={chat.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => viewChatMessages(chat.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Chat ID: {chat.id}</p>
                        <p className="text-sm text-gray-500">
                          Participants: {chat.participants?.length || 0}
                        </p>
                      </div>
                      <button className="text-purple-600 hover:text-purple-700 text-sm">
                        View Messages
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'observer' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Chat Observer Mode</h3>
              <p className="text-gray-500 mb-4">Select a chat from the Chats tab to observe messages in real-time.</p>
              
              {selectedChat && messages.length > 0 && (
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.senderId === users[0]?.uid ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.senderId === users[0]?.uid ? 'bg-gray-100' : 'bg-purple-100'}`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {msg.timestamp?.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
