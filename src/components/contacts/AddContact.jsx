import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiUserSearchLine, RiUserAddLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import { getAvatarColor, getInitials } from '../../utils/helpers';
import Loading from '../common/Loading';

const AddContact = ({ isOpen, onClose, onContactAdded }) => {
  const { currentUser } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [adding, setAdding] = useState(false);

  const searchUser = async () => {
    if (!searchId || searchId.length !== 5) {
      toast.error('Please enter a valid 5-digit ID');
      return;
    }

    setLoading(true);
    setSearchResult(null);
    
    const user = await userService.searchUserByUniqueId(searchId);
    
    if (!user) {
      toast.error('User not found');
    } else if (user.uid === currentUser.uid) {
      toast.error('You cannot add yourself');
    } else {
      const contacts = await userService.getContacts(currentUser.uid);
      const alreadyContact = contacts.some(c => c.contactId === user.uid);
      
      if (alreadyContact) {
        toast.error('Contact already added');
      } else {
        setSearchResult(user);
      }
    }
    
    setLoading(false);
  };

  const addContact = async () => {
    if (!searchResult) return;

    setAdding(true);
    
    const success = await userService.addContact(currentUser.uid, searchResult.uid);
    
    if (success) {
      toast.success('Contact added successfully!');
      onContactAdded?.();
      onClose();
      setSearchId('');
      setSearchResult(null);
    } else {
      toast.error('Failed to add contact');
    }
    
    setAdding(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add Contact</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Enter 5-digit Ryedz ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="e.g., 48291"
                    maxLength="5"
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-ryedz-primary text-center text-2xl font-mono"
                    onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                  />
                  <button
                    onClick={searchUser}
                    disabled={loading}
                    className="px-4 py-3 bg-ryedz-primary text-white rounded-lg hover:bg-ryedz-secondary transition-colors disabled:opacity-50"
                  >
                    <RiUserSearchLine className="text-xl" />
                  </button>
                </div>
              </div>

              {loading && (
                <div className="py-8">
                  <Loading size="sm" text="Searching..." />
                </div>
              )}

              <AnimatePresence>
                {searchResult && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                        style={{ backgroundColor: getAvatarColor(searchResult.name) }}
                      >
                        {searchResult.photoURL ? (
                          <img
                            src={searchResult.photoURL}
                            alt={searchResult.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(searchResult.name)
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{searchResult.name}</h3>
                        <p className="text-sm text-gray-500">{searchResult.bio}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {searchResult.uniqueId}</p>
                      </div>
                    </div>
                    <button
                      onClick={addContact}
                      disabled={adding}
                      className="w-full py-3 bg-ryedz-primary text-white rounded-lg hover:bg-ryedz-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RiUserAddLine className="text-xl" />
                      <span>{adding ? 'Adding...' : 'Add Contact'}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddContact;
