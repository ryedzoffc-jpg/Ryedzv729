import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiMessage3Fill, RiCloseFill, RiSubtractFill } from 'react-icons/ri';
import ChatRoom from './ChatRoom';
import { getAvatarColor, getInitials } from '../../utils/helpers';

const FloatingChat = ({ chatId, contactName, contactPhoto, position, onClose, onMinimize, isMinimized }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(position);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target === dragRef.current || dragRef.current.contains(e.target)) {
      setIsDragging(true);
      offsetRef.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPos = {
        x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - offsetRef.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 500, e.clientY - offsetRef.current.y)),
      };
      setPos(newPos);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
        }}
        className="shadow-2xl"
      >
        {isMinimized ? (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={handleMouseDown}
            className="w-14 h-14 bg-gradient-to-br from-ryedz-primary to-ryedz-secondary rounded-full flex items-center justify-center cursor-move shadow-lg hover:shadow-xl transition-shadow"
          >
            {contactPhoto ? (
              <img src={contactPhoto} alt={contactName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-lg">
                {getInitials(contactName)}
              </span>
            )}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '500px' }}
            className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            <div
              ref={dragRef}
              onMouseDown={handleMouseDown}
              className="bg-gradient-to-r from-ryedz-primary to-ryedz-secondary p-3 cursor-move flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: getAvatarColor(contactName) }}
                >
                  {contactPhoto ? (
                    <img src={contactPhoto} alt={contactName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(contactName)
                  )}
                </div>
                <span className="text-white font-medium text-sm truncate max-w-[150px]">
                  {contactName}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onMinimize}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <RiSubtractFill className="text-white" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <RiCloseFill className="text-white" />
                </button>
              </div>
            </div>

            <div className="h-[460px]">
              <ChatRoom chatId={chatId} isFloating={true} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingChat;
