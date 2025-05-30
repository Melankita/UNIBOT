import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Please log in to view your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h2>
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <img
                src="https://via.placeholder.com/100"
                alt="Profile"
                className="w-24 h-24 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.name || 'User Name'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {user.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mobile
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.mobile || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Roll Number
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.rollNumber || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                onClick={() => alert('Edit profile functionality coming soon!')}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;