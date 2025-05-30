import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chat from './components/features/ChatInterface';
import AttendanceTracker from './components/features/AttendanceTracker';
import ResultChecker from './components/features/ResultChecker';
import Timetable from './components/features/Timetable';
import StudyBuddy from './components/features/StudyBuddy';
import Notifications from './components/features/Notifications';
import Profile from './components/features/Profile'; // Import the Profile component
import LandingPage from './components/LandingPage';

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

interface AuthContextType {
  user: { name?: string } | null;
  login: (mobile: string, password: string) => Promise<void>;
  logout: () => void;
  attendance: any;
  results: any;
  timetable: any;
}

const AppWrapper: React.FC = () => {
  const { theme } = useTheme() as ThemeContextType;
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState('chat');

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const startChat = () => setShowLandingPage(false);
  const showLanding = () => setShowLandingPage(true);

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'chat':
        return <Chat />;
      case 'notifications':
        return <Notifications isDropdown={false} />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'results':
        return <ResultChecker />;
      case 'timetable':
        return <Timetable />;
      case 'studybuddy':
        return <StudyBuddy />;
      case 'profile': // Add profile case
        return <Profile />;
      default:
        return (
          <div className="p-6 text-gray-900 dark:text-white">
            Feature not found. Please select another option.
          </div>
        );
    }
  };

  if (showLandingPage) {
    return (
      <div className={`${theme} min-h-screen`}>
        <LandingPage startChat={startChat} />
      </div>
    );
  }

  return (
    <div className={`${theme} min-h-screen`}>
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Navbar openSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex flex-1">
          <Sidebar
            isOpen={isSidebarOpen}
            activeFeature={activeFeature}
            setActiveFeature={(feature) => {
              setActiveFeature(feature);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
          />
          <main className="flex-1 overflow-y-auto pt-16">
            {renderFeatureContent()}
          </main>
        </div>
        <button
          onClick={showLanding}
          className="fixed bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Back to Landing
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  </ThemeProvider>
);

export default App;