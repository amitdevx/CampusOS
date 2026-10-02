# CampusOS / ResoSync — Complete Testing Guide

> **Last updated:** October 2, 2026

---

## 🧑‍💻 Test Accounts (Password for all: `campusos2026`)

| Role         | Email                       | Dashboard Route  | Scope                                                |
|--------------|-----------------------------|------------------|------------------------------------------------------|
| Super Admin  | `superadmin@campusos.com`   | `/super-admin`   | Everything — all users (incl. other admins), all data |
| Admin        | `admin@campusos.com`        | `/admin`         | Faculty, Teachers, Students, Timetables, Resources   |
| Faculty      | `faculty@campusos.com`      | `/faculty`       | Notices, Department, Subjects, Practical labs        |
| Teacher      | `teacher@campusos.com`      | `/teacher`       | QR attendance, Timetable, Assignments, Marks         |
| Student      | `student@campusos.com`      | `/student`       | Schedule, Attendance, Events, Profile, Resources     |

> ⚠️ **Role Separation:** `SUPER_ADMIN ≠ ADMIN`. Super Admin is the only account that can manage other Admins and access `/super-admin`. Regular Admins use `/admin` and cannot access Super Admin routes.

---

## 🗓️ Daily Demo Timetable (Oct 2 – Nov 1, 2026)

Every weekday has 6 back-to-back class sessions seeded in the database (IST times):

| Slot | Start   | End     | Duration | Subjects                         |
|------|---------|---------|----------|----------------------------------|
| 1    | 3:30 PM | 5:00 PM | 90 min   | Theory (random)                  |
| 2    | 5:30 PM | 7:00 PM | 90 min   | Theory (random)                  |
| 3    | 7:00 PM | 7:50 PM | 50 min   | Theory (random)                  |
| 4    | 8:00 PM | 9:00 PM | 60 min   | Theory (random)                  |
| 5    | 9:00 PM | 10:00 PM| 60 min   | Practical (Lab)                  |
| 6    | 10:00 PM| 10:30 PM| 30 min   | Practical (Lab)                  |

> **Note:** Times above are in UTC. Local IST display = UTC + 5:30.

---

## 🧪 Critical Workflow Tests

### Test 1 — Super Admin Portal

1. Login at `https://campus-os-chi-eight.vercel.app/login` as `superadmin@campusos.com`
2. You are routed to `/super-admin`
3. **Verify these pages are fully functional (no 404):**
   - `/super-admin` — Dashboard with live institution stats
   - `/super-admin/users` — Full user CRUD for ALL roles including other admins
   - `/super-admin/departments` — Create and list departments
   - `/super-admin/subjects` — View all subjects by course/department
   - `/super-admin/events` — Past and upcoming campus events
   - `/super-admin/timetable` — Institution-wide timetable overview
   - `/super-admin/audit` — Recent system activity log
4. **Access control:** Try visiting `/super-admin` while logged in as `admin@campusos.com`. You should be redirected to `/login`.

---

### Test 2 — Admin Portal (Separate from Super Admin)

1. Login as `admin@campusos.com` → routed to `/admin`
2. Admin can manage: Users (not other admins), Timetables, Resources, Events, QR generation
3. Admin **cannot** access `/super-admin` — redirects to `/login`

---

### Test 3 — QR Attendance (Always-On Demo)

1. Login as `teacher@campusos.com` on the **Web** → `/teacher/qr`
2. Dropdown shows **only today's classes** (no future/past dates)
3. Select any class → Click **Generate QR Code**
4. ✅ No "time window" error — works at any time of day for demos
5. Login as `student@campusos.com` on the **Mobile App**
6. Tap the QR Scanner icon → Scan the teacher's QR code
7. ✅ Attendance is persisted to the database and shows in teacher's records

---

### Test 4 — Live Notifications (End-to-End)

**Setup:** Two devices/windows
- **Device A:** Login as `student@campusos.com` (web or mobile) — note the Bell icon with no badge
- **Device B:** Login as `faculty@campusos.com` on web → Faculty → Notices

**Steps:**
1. On Device B, click **Post New Notice**, enter a unique title and content → Publish
2. **Database check:** Notice is saved. Notification records are created for all users.
3. **Real-time (Device A):** The Bell icon updates live via WebSocket — a red badge appears
4. Click the Bell: your notification is listed with title and timestamp
5. **Persistence test:** Refresh Device A → notification still shows (fetched from DB, not just in-memory)

---

### Test 5 — Student Profile & Digital ID

1. Login as `student@campusos.com` → `/student`
2. Click **"Display QR Pass"** or **"View Full Profile"**
3. ✅ Routes to `/student/profile`
4. Page shows: Full Name, Email, Role, and a scannable **Digital ID QR Code**
5. QR payload: `{ "type": "ID_CARD", "user_id": ..., "email": "..." }`

---

### Test 6 — Mobile Campus Resources (Fixed)

1. Open Mobile App → login as `faculty@campusos.com`
2. Tap the **Resources** tab
3. ✅ Resources show as **"Book Now"** (not "Unavailable")
4. Tap Book Now on a resource → booking confirmed and persisted

---

### Test 7 — Mobile Notification Bell (Fixed)

1. Open Mobile App → login as `student@campusos.com`
2. Tap the **Bell icon** at the top right of Home Screen
3. ✅ A modal opens showing "System Alerts"
4. After a notice is published (Test 4), the list populates without manual refresh

---

## 🔐 Role Permission Matrix

| Action                      | SUPER_ADMIN | ADMIN | FACULTY | TEACHER | STUDENT |
|-----------------------------|:-----------:|:-----:|:-------:|:-------:|:-------:|
| Manage all users            | ✅          | ❌    | ❌      | ❌      | ❌      |
| Manage admins               | ✅          | ❌    | ❌      | ❌      | ❌      |
| Manage departments/subjects | ✅          | ✅    | ❌      | ❌      | ❌      |
| Access `/super-admin`       | ✅          | ❌    | ❌      | ❌      | ❌      |
| Manage resources/events     | ✅          | ✅    | ✅      | ❌      | ❌      |
| Publish notices             | ✅          | ✅    | ✅      | ❌      | ❌      |
| Generate QR attendance      | ✅          | ✅    | ✅      | ✅      | ❌      |
| View own timetable          | ✅          | ✅    | ✅      | ✅      | ✅      |
| Scan QR attendance          | ❌          | ❌    | ❌      | ❌      | ✅      |
| Book resources              | ✅          | ✅    | ✅      | ✅      | ❌      |
| Submit assignments          | ❌          | ❌    | ❌      | ❌      | ✅      |

---

## 🌐 Live Environment

- **Web:** https://campus-os-chi-eight.vercel.app
- **API:** https://campusos-api-3r6a.onrender.com
- **API Docs:** https://campusos-api-3r6a.onrender.com/docs
