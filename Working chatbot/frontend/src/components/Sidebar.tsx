import React from 'react';
import { X, MessageCircle, Bell, Calendar, Book, Brain, User } from 'lucide-react';
import { useAuth } from 'E:\\chat\\Working\\Working chatbot\\frontend\\src\\context\\AuthContext.tsx'; // <-- Ensure correct path to your AuthContext

interface SidebarProps {
  isOpen: boolean;
  activeFeature: string;
  setActiveFeature: (feature: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeFeature, setActiveFeature }) => {
  const { user } = useAuth();

  const features = [
    { name: 'Chat', key: 'chat', icon: <MessageCircle className="h-5 w-5" /> },
    { name: 'Notifications', key: 'notifications', icon: <Bell className="h-5 w-5" /> },
    { name: 'Attendance', key: 'attendance', icon: <Calendar className="h-5 w-5" />, requiresAuth: true },
    { name: 'Results', key: 'results', icon: <Book className="h-5 w-5" />, requiresAuth: true },
    { name: 'Timetable', key: 'timetable', icon: <Calendar className="h-5 w-5" />, requiresAuth: true },
    { name: 'Study Buddy', key: 'studybuddy', icon: <Brain className="h-5 w-5" />, requiresAuth: true },
    { name: 'Profile', key: 'profile', icon: <User className="h-5 w-5" />, requiresAuth: true },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Menu</h2>
        <button onClick={() => setActiveFeature('chat')} className="lg:hidden">
          <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      <nav className="mt-4">
        {features.map((feature) => {
          if (feature.requiresAuth && !user?.isAuthenticated) return null; // hide if not logged in
          return (
            <button
              key={feature.key}
              onClick={() => setActiveFeature(feature.key)}
              className={`w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                activeFeature === feature.key ? 'bg-gray-100 dark:bg-gray-700 text-purple-600 dark:text-purple-400' : ''
              }`}
            >
              {feature.icon}
              <span className="ml-3">{feature.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
