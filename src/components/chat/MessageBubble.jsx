import React from 'react';
import { motion } from 'framer-motion';
import { RiCheckLine, RiCheckDoubleLine, RiTimeLine } from 'react-icons/ri';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <RiCheckLine className="text-gray-400 text-xs" />;
      case 'delivered':
        return <RiCheckDoubleLine className="text-gray-400 text-xs" />;
      case 'read':
        return <RiCheckDoubleLine className="text-blue-500 text-xs" />;
      default:
        return <RiTimeLine className="text-gray-400 text-xs" />;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-2`}
    >
      <div className={`max-w-[75%] ${isOwn ? 'order-1' : 'order-2'}`}>
        <div className={`relative rounded-2xl px-4 py-2 shadow-sm ${
          isOwn 
            ? 'bg-ryedz-primary text-white rounded-tr-sm' 
            : 'bg-white text-gray-800 rounded-tl-sm'
        }`}>
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.message}
          </p>

          <div className={`flex items-center justify-end gap-1 mt-1 ${
            isOwn ? 'text-white/70' : 'text-gray-500'
          }`}>
            <span className="text-[10px]">
              {message.timestamp && format(message.timestamp, 'HH:mm')}
            </span>
            {isOwn && getStatusIcon()}
          </div>

          <div
            className={`absolute top-0 w-3 h-3 ${
              isOwn ? '-right-2 bg-ryedz-primary' : '-left-2 bg-white'
            }`}
            style={{
              clipPath: isOwn 
                ? 'polygon(0 0, 100% 0, 100% 100%)'
                : 'polygon(0 0, 100% 0, 0 100%)'
            }}
          />
        </div>

        {message.isEncrypted && (
          <div className={`text-[10px] text-gray-400 mt-0.5 ${isOwn ? 'text-right' : 'text-left'}`}>
            🔒 Encrypted
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
