export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'TEACHER' | 'STUDENT';
  is_active: boolean;
}

export interface ClassSession {
  id: number;
  subject_id: number;
  division_id: number;
  room: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
}
