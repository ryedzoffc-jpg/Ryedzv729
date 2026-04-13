import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} border-ryedz-primary border-t-transparent rounded-full`}
      />
      {text && (
        <p className="mt-3 text-gray-500 text-sm">{text}</p>
      )}
    </div>
  );
};

export default Loading;
