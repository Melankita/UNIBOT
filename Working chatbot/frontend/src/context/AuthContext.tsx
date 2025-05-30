import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  mobile: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  attendance: any;
  results: any;
  timetable: any;
  login: (mobile: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [timetable, setTimetable] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAttendance = localStorage.getItem('attendance');
    const savedResults = localStorage.getItem('results');
    const savedTimetable = localStorage.getItem('timetable');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
      if (savedResults) setResults(JSON.parse(savedResults));
      if (savedTimetable) setTimetable(JSON.parse(savedTimetable));
    }
  }, []);

  const login = async (mobile: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://localhost:8000/login', new URLSearchParams({ mobile, password }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (res.data.success) {
        const newUser: User = {
          id: '1',
          name: 'KMIT Student',
          email: mobile,
          isAuthenticated: true,
          mobile,
          password,
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));

        const [att, resu, time] = await Promise.all([
          axios.post('http://localhost:8000/attendance', new URLSearchParams({ mobile, password })),
          axios.post('http://localhost:8000/results', new URLSearchParams({ mobile, password })),
          axios.post('http://localhost:8000/timetable', new URLSearchParams({ mobile, password })),
        ]);

        setAttendance(att.data.data);
        setResults(resu.data.data);
        setTimetable(time.data.data);

        localStorage.setItem('attendance', JSON.stringify(att.data.data));
        localStorage.setItem('results', JSON.stringify(resu.data.data));
        localStorage.setItem('timetable', JSON.stringify(time.data.data));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAttendance(null);
    setResults(null);
    setTimetable(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{ user, attendance, results, timetable, login, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
