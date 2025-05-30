import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Search } from 'lucide-react';
import { Message } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const welcomeMessage: Message = {
  id: uuidv4(),
  content: "Hi there! I'm UniBot, your university assistant. How can I help you today?",
  sender: 'bot',
  timestamp: new Date(),
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [includeSearch, setIncludeSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');

  useEffect(() => {
    scrollToBottom();
  }, [messages, searchResults]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sanitizeUrl = (url: string) => {
    try {
      new URL(url);
      return url;
    } catch {
      return '#';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          message: userMessage.content,
          include_search: includeSearch.toString(),
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const botMessage: Message = {
        id: uuidv4(),
        content: data.reply,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError('Sorry, something went wrong!');
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: 'Sorry, something went wrong!',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    setIsSearchLoading(true);
    setSearchResults([]);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ query: inputValue }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.status === 'success') {
        const results = (data.results || []).map((result: string) => {
          const linkMatch = result.match(/🔗 \[Link\]\((.*?)\)/);
          return linkMatch ? sanitizeUrl(linkMatch[1]) : result;
        });
        setSearchResults(results);
      } else {
        setSearchResults(['⚠️ Search failed. Try again.']);
      }
    } catch (error) {
      setError(`Search error: ${(error as Error).message}`);
      setSearchResults([`⚠️ Search error: ${(error as Error).message}`]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const openFeedbackModal = (response: string, query: string) => {
    setCurrentQuery(query);
    setCurrentResponse(response);
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_query: currentQuery,
          ai_response: currentResponse,
          user_feedback: feedbackText,
        }),
      });
      setShowFeedback(false);
      setFeedbackText('');
      alert('Thanks for your feedback!');
    } catch (err) {
      alert('Failed to submit feedback.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {error && (
            <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}
          {messages.map((message, idx) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${message.sender === 'user'
                    ? 'bg-purple-600 text-white dark:bg-purple-700'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${message.sender === 'user'
                      ? 'text-purple-200 dark:text-purple-300'
                      : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {message.sender === 'bot' && (
                    <div
                      className="text-xs text-blue-500 cursor-pointer hover:underline mt-1"
                      onClick={() => openFeedbackModal(message.content, messages[idx - 1]?.content || '')}
                    >
                      💬 Give Feedback
                    </div>
                  )}
                </div>
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-700 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSearchLoading ? (
            <div className="mt-4 text-yellow-400">Searching...</div>
          ) : (
            searchResults.length > 0 && (
              <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-semibold mb-2 text-gray-200">🔎 Search Results:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {searchResults.map((result, idx) => (
                    <li key={idx}>
                      {result.startsWith('⚠️') ? (
                        <span className="text-red-400">{result}</span>
                      ) : (
                        <a href={result} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {result}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-2 flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeSearch"
                checked={includeSearch}
                onChange={(e) => setIncludeSearch(e.target.checked)}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="includeSearch" className="text-sm text-gray-700 dark:text-gray-300">
                Include web search for additional context
              </label>
            </div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              disabled={!inputValue.trim() || isSearchLoading}
            >
              <Search className="h-4 w-4 mr-1" /> Search
            </button>
          </div>
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              disabled={!inputValue.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Give Feedback</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">What did you think of the bot's response?</p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your feedback..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
