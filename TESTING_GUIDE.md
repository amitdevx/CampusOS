# CampusOS / ResoSync: Complete End-to-End Acceptance Testing Guide

This guide ensures full validation of every major user workflow, focusing on cross-platform parity, real-time functionality, and database persistence.

---

## 👥 Test Accounts (Password for all: `campusos2026`)
- **Super Admin**: `superadmin@campusos.com`\n- **Admin**: `admin@campusos.com` (Has full access to `/super-admin`)
- **Teacher**: `teacher@campusos.com`
- **Faculty**: `faculty@campusos.com`
- **Student**: `student@campusos.com`

---

## 🧪 Critical Workflows

### 1. WebSockets & Persistent Notifications (End-to-End)
**Scenario**: Faculty publishes a notice, and a Student receives a persistent notification live.
1. **Receiver (Device A)**: Open the Mobile App or Web App and log in as `student@campusos.com`. 
   - Note that the Notification bell (web) or icon (mobile) currently says "No active alerts."
2. **Sender (Device B)**: Log in as `faculty@campusos.com` on the Web Dashboard.
3. **Action**: Navigate to Notices -> Post New Notice. Submit a notice (e.g., "Live System Update").
4. **Verification**: 
   - **Real-Time Delivery**: Without refreshing, Device A's bell icon will instantly update with a red badge, and the dropdown/modal will show the new "System Alert".
   - **Persistence**: Disconnect/refresh Device A. The notification remains unread and stored securely in the database.

### 2. Daily Demostration Timetable
**Scenario**: The database is seeded with a dense, 6-period daily schedule spanning 10:00 AM to 5:00 PM.
1. Log in as `student@campusos.com` on the Mobile App.
2. Navigate to **Classes**.
3. **Verification**: You will see today's exact schedule fully populated with classes spanning back-to-back:
   - 10:00 - 11:30 | 12:00 - 1:30 | 1:30 - 2:20 | 2:30 - 3:30 | 3:30 - 4:30 | 4:30 - 5:00.

### 3. Teacher QR Code Generation & Class Filtering
**Scenario**: Teachers must only see *today's* classes for attendance, preventing clutter and mistakes.
1. Log in as `teacher@campusos.com` on the **Web** or **Mobile**.
2. Navigate to **Attendance QR**.
3. **Verification**:
   - The primary active dropdown *only* contains classes scheduled for **Today**. Future dates and past dates are strictly removed.
   - The strict "Time Window Restriction" has been bypassed for demo purposes, allowing you to generate a valid QR Code for any of today's classes at any time during a live presentation.

### 4. Student Digital ID & Profile Route
**Scenario**: Student accesses their digital profile card.
1. Log in as `student@campusos.com` on the Web.
2. Click **View Full Profile** or **Display QR Pass** on the dashboard.
3. **Verification**: You are correctly routed to `/student/profile`, which displays an authenticated Digital ID QR pass and the student's personal information pulled securely from the DB.

### 5. Mobile Campus Resource Booking
**Scenario**: Booking a campus resource from the mobile app.
1. Open the Mobile App as `faculty@campusos.com`.
2. Navigate to the **Resources** tab.
3. **Verification**: Resources (like the "Computer Science Lab 1") now show as "Book Now" instead of "Unavailable", accurately reflecting their dynamic availability.

### 6. Super Admin Route Protection
**Scenario**: Testing the top-level institutional dashboard.
1. Log in as `admin@campusos.com` (role has been promoted to SUPER_ADMIN).
2. Navigate directly to `/super-admin`.
3. **Verification**: The 404 is gone. You are greeted by the institutional dashboard, pulling live aggregate statistics for Total Users, Scheduled Sessions, and Events.

---
**Status**: All End-to-End checks are confirmed working as of October 2026.
