import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const getGradeColor = (grade: string) => {
  if (grade === 'O') return 'text-purple-400';
  if (grade === 'A+' || grade === 'A') return 'text-green-400';
  if (grade === 'B+' || grade === 'B') return 'text-yellow-400';
  return 'text-red-400';
};

const ResultChecker: React.FC = () => {
  const { results } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  if (!results) return <div className="p-6">Loading results...</div>;

  const semesters = Object.keys(results.results || {});
  const activeSem = selectedSemester || semesters[0];
  const subjects = results.results[activeSem]?.subjects || [];

  const totalPoints = subjects.reduce((sum: number, r: any) => sum + Number(r.grade_points), 0);
  const avgGrade = (totalPoints / (subjects.length || 1)).toFixed(2);

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Academic Results</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <select
              value={activeSem}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded shadow"
            >
              {semesters.map((sem, idx) => (
                <option key={idx} value={sem}>{sem}</option>
              ))}
            </select>

            <div className="flex gap-6">
              <div className="bg-white dark:bg-gray-700 p-4 rounded text-center shadow">
                <p className="text-sm">Total Backlogs</p>
                <p className="text-xl font-bold">{results.total_backlogs}</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded text-center shadow">
                <p className="text-sm">Average Grade Points</p>
                <p className="text-xl font-bold">{avgGrade}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-300 dark:border-gray-600">
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Grade</th>
                  <th className="pb-2">Points</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((r: any, idx: number) => (
                  <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3">{r.subject}</td>
                    <td className="py-3 font-semibold">
                      <span className={getGradeColor(r.grade)}>{r.grade}</span>
                    </td>
                    <td className="py-3">{r.grade_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultChecker;