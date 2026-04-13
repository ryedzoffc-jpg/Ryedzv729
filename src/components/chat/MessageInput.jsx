import React, { useState, useRef, useEffect } from 'react';
import { RiSendPlaneFill, RiAttachment2, RiEmotionLine } from 'react-icons/ri';
import { motion } from 'framer-motion';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-3 pb-safe">
      <div className="flex items-end gap-2">
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-ryedz-primary hover:bg-gray-100 rounded-full transition-colors"
        >
          <RiEmotionLine className="text-xl" />
        </button>
        
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-ryedz-primary hover:bg-gray-100 rounded-full transition-colors"
        >
          <RiAttachment2 className="text-xl" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="w-full px-4 py-2 bg-gray-100 rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-ryedz-primary/30 text-sm"
            style={{
              minHeight: '40px',
              maxHeight: '100px',
            }}
            disabled={disabled}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-6 left-4 text-xs text-gray-400"
            >
              Typing...
            </motion.div>
          )}
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`p-2 rounded-full transition-all ${
            message.trim() && !disabled
              ? 'bg-ryedz-primary text-white hover:bg-ryedz-secondary shadow-md'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          <RiSendPlaneFill className="text-xl" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
