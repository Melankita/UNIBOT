import React from 'react';
import { useAuth } from '../../context/AuthContext';

const getStatus = (percent: number) => {
  if (percent >= 90) return { label: 'Excellent', color: 'bg-green-600' };
  if (percent >= 75) return { label: 'Good', color: 'bg-yellow-400' };
  return { label: 'Poor', color: 'bg-red-600' };
};

const AttendanceTracker: React.FC = () => {
  const { attendance } = useAuth();
  if (!attendance) return <div className="p-6">Loading attendance...</div>;

  const subjects = attendance.subjects || [];
  const overall = attendance.overall_attendance || 0;
  const present = Math.round((overall / 100) * 100);

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Attendance Tracker</h2>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center shadow">
              <div className="relative w-24 h-24">
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${overall}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-lg font-bold">
                  {overall.toFixed(1)}%
                  <div className="text-sm font-medium">Overall</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg flex flex-col justify-center items-center text-center shadow">
              <p className="text-lg">Classes Attended</p>
              <p className="text-3xl font-bold">{present}</p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg flex flex-col justify-center items-center text-center shadow">
              <p className="text-lg">Minimum Required</p>
              <p className="text-3xl font-bold">75%</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-300 dark:border-gray-600">
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Attendance</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub: any, idx: number) => {
                  const percent = sub.attendance_percentage;
                  const { label, color } = getStatus(percent);
                  return (
                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-3">{sub.subject}</td>
                      <td className="py-3 w-1/2">
                        <div className="mb-1">
                          <div className="w-full bg-gray-300 dark:bg-gray-600 h-3 rounded">
                            <div
                              className="h-3 rounded"
                              style={{
                                width: `${percent}%`,
                                backgroundColor:
                                  percent >= 90 ? '#16a34a' :
                                  percent >= 75 ? '#facc15' :
                                  '#dc2626',
                              }}
                            />
                          </div>
                          <p className="text-sm mt-1">{percent.toFixed(1)}%</p>
                        </div>
                      </td>
                      <td className="py-3 pl-2">
                        <span className={`px-3 py-1 text-sm rounded-full ${color} text-white`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;