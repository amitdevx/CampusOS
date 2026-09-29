import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Auth API
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await apiClient.post('/api/v1/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/api/v1/auth/me');
  return response.data;
};

// Timetable API
export const getMySchedule = async () => {
  const response = await apiClient.get('/api/v1/timetable/my-schedule');
  return response.data;
};

export const getClasses = async () => {
  const response = await apiClient.get('/api/v1/timetable/');
  return response.data;
};

export const createClass = async (data: any) => {
  const response = await apiClient.post('/api/v1/timetable/', data);
  return response.data;
};

// Events API
export const getEvents = async () => {
  const response = await apiClient.get('/api/v1/campus/events');
  return response.data;
};

export const createEvent = async (data: any) => {
  const response = await apiClient.post('/api/v1/campus/events', data);
  return response.data;
};

// Attendance API
export const startAttendanceSession = async (class_session_id: number) => {
  const response = await apiClient.post('/api/v1/attendance/sessions', { class_session_id });
  return response.data;
};

export const markAttendance = async (session_id: number, qr_code_secret: string) => {
  const response = await apiClient.post(`/api/v1/attendance/sessions/${session_id}/scan`, { qr_code_secret });
  return response.data;
};

// Intelligence API
export const getAnalytics = async () => {
  const response = await apiClient.get('/api/v1/intelligence/analytics');
  return response.data;
};
