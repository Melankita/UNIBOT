export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface User {
   id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  mobile: string;
  password: string;
}

export interface AttendanceData {
  subject: string;
  present: number;
  total: number;
  percentage: number;
}

export interface ResultData {
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string;
}

export interface TimeTableEntry {
  day: string;
  time: string;
  subject: string;
  room: string;
}