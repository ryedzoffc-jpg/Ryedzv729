import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiChat3Line, RiContactsLine, RiUserLine } from 'react-icons/ri';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: RiChat3Line, label: 'Chats' },
    { path: '/profile', icon: RiUserLine, label: 'Profile' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      <nav className="bg-white border-t border-gray-200 pb-safe">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex-1 py-3 flex flex-col items-center"
              >
                <Icon
                  className={`text-xl mb-1 ${
                    isActive ? 'text-ryedz-primary' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive ? 'text-ryedz-primary font-medium' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNav"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-ryedz-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
