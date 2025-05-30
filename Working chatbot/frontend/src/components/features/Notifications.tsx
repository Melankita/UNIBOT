import React, { useState } from 'react';
import { Bell, BellOff, Check, RefreshCcw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Bulletin {
  date: string;
  title: string;
  read?: boolean;
}

interface NotificationsProps {
  isDropdown?: boolean;
}

const Notifications: React.FC<NotificationsProps> = ({ isDropdown = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Bulletin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      const data = await response.json();
      if (data.status === 'success') {
        const updatedNotifications = (data.notifications || []).map((notification: Bulletin) => ({
          ...notification,
          read: localStorage.getItem(`notification_${notification.date}_${notification.title}`) === 'read',
        }));
        setNotifications(updatedNotifications);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      setError('Error fetching notifications: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => {
      localStorage.setItem(`notification_${notification.date}_${notification.title}`, 'read');
      return { ...notification, read: true };
    });
    setNotifications(updatedNotifications);
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  if (isDropdown) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-coral-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 animate-fadeIn">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-100">Notifications</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchNotifications}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                    aria-label="Refresh notifications"
                  >
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                      aria-label="Mark all notifications as read"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark All as Read
                    </button>
                  )}
                </div>
              </div>
              {isLoading ? (
                <p className="text-blue-400 text-center">Loading...</p>
              ) : error ? (
                <p className="text-coral-400 text-center">{error}</p>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center text-gray-400">
                  <BellOff className="h-8 w-8 mb-2" />
                  <p>No notifications available.</p>
                </div>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <li
                      key={index}
                      className="p-3 bg-gray-900 rounded-lg border border-gray-600 hover:bg-gray-700 hover:scale-105 transition-all duration-200 flex items-start"
                    >
                      {!notification.read && (
                        <span className="w-2 h-2 bg-coral-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-blue-200 font-medium">{notification.date}</p>
                        <p className="text-gray-100">{notification.title}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-purple-100">Latest Bulletins</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchNotifications}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                  aria-label="Refresh notifications"
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Refresh
                </button>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                    aria-label="Mark all notifications as read"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark All as Read
                  </button>
                )}
              </div>
            </div>
            {isLoading ? (
              <p className="text-blue-400 text-center">Loading...</p>
            ) : error ? (
              <p className="text-coral-400 text-center">{error}</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center text-gray-400">
                <BellOff className="h-8 w-8 mb-2" />
                <p>No notifications available.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((notification, index) => (
                  <li
                    key={index}
                    className="p-3 bg-gray-900 rounded-lg border border-gray-600 hover:bg-gray-700 hover:scale-105 transition-all duration-200 flex items-start"
                  >
                    {!notification.read && (
                      <span className="w-2 h-2 bg-coral-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-blue-200 font-medium">{notification.date}</p>
                      <p className="text-gray-100">{notification.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
