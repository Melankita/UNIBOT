import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Upload, Book, Search, File } from 'lucide-react';

const StudyBuddy: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('http://localhost:8000/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      alert(data.message);
      setUploadedFiles((prev) => [...prev, files[0].name]);
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("prompt", query);

      const res = await fetch("http://localhost:8000/query-study", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data.answer);
    } catch (err) {
      setResponse("Something went wrong while querying your study materials.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Study Buddy</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Please log in to use the Study Buddy feature.
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Study Buddy</h2>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              Tip: Upload short PDFs. Long ones may be partially read.
          </p>

          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-4 border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'upload'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Upload className="inline-block h-4 w-4 mr-1" />
              Upload PDFs
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-4 border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'chat'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Book className="inline-block h-4 w-4 mr-1" />
              Study Assistant
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'upload' ? (
              <div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Upload Your Study Materials
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Upload PDFs of your notes, textbooks, or study materials to enable personalized assistance.
                  </p>

                  <label className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-2">
                        ⚠️ Tip: Try uploading short PDFs. Really long ones may not be fully read by the study assistant.
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      multiple
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                      Uploaded Files ({uploadedFiles.length})
                    </h4>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="py-3 flex items-center">
                          <File className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                          <span className="text-sm text-gray-800 dark:text-white">{file}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Book className="h-4 w-4 mr-2" />
                        Start Studying
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Study Assistant
                </h3>

                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-6">
                    <Book className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      You haven't uploaded any study materials yet.
                    </p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Materials
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                      <div className="flex items-center mb-2">
                        <File className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                          Active Study Materials
                        </h4>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {uploadedFiles.slice(0, 3).map((file, index) => (
                          <span key={index} className="inline-block mr-2">
                            {file}{index < Math.min(2, uploadedFiles.length - 1) ? ',' : ''}
                          </span>
                        ))}
                        {uploadedFiles.length > 3 && (
                          <span>and {uploadedFiles.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSubmitQuery}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="query">
                          Ask about your study materials
                        </label>
                        <div className="relative">
                          <input
                            id="query"
                            type="text"
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Explain the concept of recursion in data structures"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300"
                            disabled={isLoading}
                          >
                            <Search className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </form>

                    {isLoading && (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                      </div>
                    )}

                    {response && !isLoading && (
                      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
                          Response:
                        </h4>
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {response}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;