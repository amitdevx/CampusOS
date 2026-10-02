# CampusOS / ResoSync: End-to-End Testing Guide

Welcome to the definitive testing guide for CampusOS. This document outlines exactly how to verify all core features across the Next.js Web Dashboard and the React Native Mobile App.

## 👥 Test Accounts (Password for all: `campusos2026`)
- **Admin**: `admin@campusos.com`
- **Teacher**: `teacher@campusos.com`
- **Faculty**: `faculty@campusos.com`
- **Student**: `student@campusos.com`

---

## 🏗️ Feature List
1. **Dynamic Timetables**: Role-based scheduling. Displays active classes up to current time, handling breaks and holidays.
2. **Live WebSockets**: Instant push notifications to active devices without page refreshes.
3. **QR Code Attendance**: Cryptographically secure, session-bound QR attendance marking.
4. **Resource Booking**: Lab/Room reservation flows with conflict prevention.
5. **Notice Board**: College-wide alerts.
6. **Event Management**: Registration for college events (Hackathons, Seminars).

---

## 🧪 Step-by-Step Test Scenarios

### Test 1: Real-Time WebSocket Notifications
**Goal**: Verify that sending a notice instantly alerts connected users.
1. **Setup**: Open the Mobile App (or a second incognito window on the web) and log in as `student@campusos.com`. Stay on the Home screen.
2. **Trigger**: In your primary Web Dashboard, log in as `admin@campusos.com`. Navigate to the **Notices** tab (or send a notice via Postman/Swagger `/api/v1/campus/notices`).
3. **Action**: Create and submit a new notice (e.g., Title: "Live Test Alert").
4. **Result**: Instantly, without refreshing, the Student app will receive a WebSocket payload, and a red dot will appear on the Bell icon at the top right!

### Test 2: Secure QR Code Attendance
**Goal**: Test the Teacher-to-Student end-to-end attendance flow.
1. **Teacher Action (Web)**: 
   - Log in as `teacher@campusos.com`.
   - Navigate to **Attendance QR**.
   - You will see a dropdown of **Active/Upcoming Classes**. (Note: Classes that have already ended are strictly filtered out).
   - Select a class and click **Generate QR Code**. Leave this code visible on your screen.
2. **Student Action (Mobile)**:
   - Log in as `student@campusos.com`.
   - On the Home screen, tap the **QR Code Scanner** icon (top right).
   - Point the camera at the Teacher's screen.
   - **Result**: The app will verify the cryptographic token, mark the student as present in the database, and show a green "Attendance Marked" success screen.

### Test 3: Resource Booking & Conflict Prevention
**Goal**: Ensure labs cannot be double-booked.
1. **Booking 1**: Log in as `faculty@campusos.com` on the Web or Mobile app. Navigate to Resources/Bookings. Select "Computer Science Lab 1" and book it for today from 12:00 PM to 1:00 PM. (Success).
2. **Booking 2 (The Test)**: Log in as `admin@campusos.com`. Try to book the exact same "Computer Science Lab 1" for today from 12:30 PM to 1:30 PM.
3. **Result**: The backend will rigorously block the attempt, throwing a `400 Conflict` error, preventing the overlap.

### Test 4: Varied Timetable Verification
**Goal**: Verify the 10 AM - 5 PM highly varied schedule.
1. Log in as `student@campusos.com` on the Mobile App.
2. Navigate to the **Classes** tab.
3. Scroll through the schedule. You will see a full, packed college day (10-11, 11-12, 1-2, 2-3, and a 3-5 Practical block) utilizing random Core Subjects (Java, OS, Data Science, etc.) with different teachers assigned.
4. Verify that Sundays and specific holidays (e.g., Gandhi Jayanti on Oct 2) are correctly skipped.

---
*End of Testing Guide. All edge cases, overflows, and UI bugs have been strictly audited and resolved as of October 2026.*
