import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Timetable: React.FC = () => {
  const { timetable } = useAuth();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [activeDay, setActiveDay] = useState<string>(days[new Date().getDay() - 1] || 'Monday');

  if (!timetable) return <div className="p-6">Loading timetable...</div>;

  const classes = timetable[activeDay] || [];

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Class Timetable</h2>

          <div className="flex space-x-4">
            {days.map(day => (
              <button
                key={day}
                className={`px-4 py-2 rounded shadow ${
                  activeDay === day
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
                onClick={() => setActiveDay(day)}
              >
                {day}
              </button>
            ))}
          </div>

          {classes.length === 0 ? (
            <div className="bg-purple-800 text-white px-6 py-4 rounded-lg shadow">
              <p className="text-lg">No more classes today</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {classes.map((c: any, idx: number) => {
                const isBreak = /short\s*break|lunch/i.test(c.subject.toLowerCase());
                const isLunch = /lunch/i.test(c.subject.toLowerCase());

                const breakColor = 'bg-[#6a5acd] text-white font-semibold';

                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-4 shadow ${
                      isBreak
                        ? breakColor
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-lg font-medium">{c.subject}</p>
                    <p className="text-sm">{c.period}</p>
                    {!isBreak && <p className="text-sm text-gray-500 dark:text-gray-300">Room: {c.room || 'TBD'}</p>}
                    {isLunch && c.room && (
                      <p className="text-sm text-gray-300">Room: {c.room}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timetable;