import React, { useState } from 'react';
import { Bot, BookOpen, Clock, Calendar, MessageCircle } from 'lucide-react';
import LoginModal from './LoginModal';

interface LandingPageProps {
  startChat: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ startChat }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 mb-6">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to <span className="text-purple-600 dark:text-purple-400">UniBot</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your intelligent university assistant that helps you stay on top of your academic journey
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startChat}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium 
                      rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none 
                      focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200
                      transform hover:scale-105"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Chatting
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-purple-300 dark:border-purple-700 text-base font-medium 
                      rounded-md shadow-sm text-purple-700 dark:text-purple-400 bg-white dark:bg-gray-800 
                      hover:bg-purple-50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200
                      transform hover:scale-105"
            >
              Login to KMIT Netra
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
            <div className="p-6">
              <div className="w-12 h-12 rounded-md bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Attendance Tracker</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Keep track of your attendance across all subjects with visual indicators and alerts.
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
            <div className="p-6">
              <div className="w-12 h-12 rounded-md bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Result Checker</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View your academic performance, grades, and progress reports in a detailed dashboard.
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
            <div className="p-6">
              <div className="w-12 h-12 rounded-md bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Timetable</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access your class schedule, room information, and get notified about upcoming classes.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            How UniBot Helps You Succeed
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Track Your Attendance</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Monitor your attendance percentages and stay above the minimum requirements.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Check Your Results</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access your academic performance metrics and identify areas for improvement.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Stay Organized</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Keep track of your class schedule and never miss an important lecture.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">4</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Get Study Help</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload your study materials and get personalized assistance with difficult concepts.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={startChat}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium 
                      rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none 
                      focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Using UniBot
            </button>
          </div>
        </div>
      </div>
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default LandingPage;