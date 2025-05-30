import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Notifications from './features/Notifications';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

interface User {
  name?: string;
}

interface AuthContext {
  user: User | null;
  logout: () => void;
}

interface NavbarProps {
  openSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ openSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth() as AuthContext;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={openSidebar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 
                         hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700 
                         focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <span className="sr-only">{isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">UniBot</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Notifications isDropdown={true} />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name || 'User'}
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium 
                             rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none 
                             focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                           rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none 
                           focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                aria-label="Login"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Navbar;