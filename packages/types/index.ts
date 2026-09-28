export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
}

export interface ClassSession {
  id: string;
  subject: string;
  teacherId: string;
  startTime: string;
  endTime: string;
}
