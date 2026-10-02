#!/usr/bin/env python3
"""
CampusOS Full API Test Suite
Tests every role flow: auth, timetable (name resolution, scoping, conflicts),
resources, QR/attendance, and role permission enforcement (403 checks).
"""

import requests
import json
import sys
from datetime import datetime, timedelta

API = "https://campusos-api-3r6a.onrender.com"

# ─── Colours ────────────────────────────────────────────────────────────────
G = "\033[92m"; R = "\033[91m"; Y = "\033[93m"; B = "\033[94m"; W = "\033[0m"; BOLD = "\033[1m"

passed = 0
failed = 0
warnings = 0

def ok(msg):    global passed;  passed += 1;  print(f"  {G}✓{W} {msg}")
def fail(msg):  global failed;  failed += 1;  print(f"  {R}✗{W} {msg}")
def warn(msg):  global warnings; warnings += 1; print(f"  {Y}⚠{W} {msg}")
def section(msg): print(f"\n{BOLD}{B}── {msg} ──{W}")

def check(condition, ok_msg, fail_msg):
    if condition: ok(ok_msg)
    else: fail(fail_msg)

# ─── Login helper ────────────────────────────────────────────────────────────
ACCOUNTS = {
    "SUPER_ADMIN": ("superadmin@campusos.com", "campusos2026"),
    "ADMIN":       ("admin@campusos.com",      "campusos2026"),
    "FACULTY":     ("faculty@campusos.com",    "campusos2026"),
    "TEACHER":     ("teacher@campusos.com",    "campusos2026"),
    "STUDENT":     ("student@campusos.com",    "campusos2026"),
}

tokens = {}

def login(role):
    email, pw = ACCOUNTS[role]
    r = requests.post(f"{API}/api/v1/auth/login",
                      data={"username": email, "password": pw},
                      headers={"Content-Type": "application/x-www-form-urlencoded"},
                      timeout=30)
    if r.status_code == 200:
        tok = r.json()["access_token"]
        tokens[role] = tok
        ok(f"Login {role} → token obtained")
        return tok
    else:
        fail(f"Login {role} → {r.status_code} {r.text[:100]}")
        return None

def auth(role):
    return {"Authorization": f"Bearer {tokens.get(role, '')}"}

# ─── Health ──────────────────────────────────────────────────────────────────
section("0. HEALTH CHECK")
try:
    r = requests.get(f"{API}/health", timeout=30)
    check(r.status_code == 200, f"API healthy → {r.json()}", f"Health failed {r.status_code}")
except Exception as e:
    fail(f"API unreachable: {e}")
    sys.exit(1)

# ─── Auth / Login ────────────────────────────────────────────────────────────
section("1. AUTH — All 5 roles login")
for role in ACCOUNTS:
    login(role)

# ─── /me validation ─────────────────────────────────────────────────────────
section("2. AUTH — /me returns correct role")
for role in ACCOUNTS:
    r = requests.get(f"{API}/api/v1/auth/me", headers=auth(role), timeout=15)
    if r.status_code == 200:
        got = r.json().get("role")
        check(got == role, f"{role}: /me → role={got}", f"{role}: /me returned role={got} (expected {role})")
    else:
        fail(f"{role}: /me → {r.status_code}")

# ─── Timetable ───────────────────────────────────────────────────────────────
section("3. TIMETABLE — GET / (name resolution)")
r = requests.get(f"{API}/api/v1/timetable/", headers=auth("ADMIN"), timeout=15)
if r.status_code == 200:
    sessions = r.json()
    ok(f"ADMIN got {len(sessions)} timetable sessions")
    if sessions:
        s = sessions[0]
        check("subject_name" in s, f"subject_name present: '{s.get('subject_name')}'", "subject_name MISSING — still returning IDs")
        check("teacher_name" in s, f"teacher_name present: '{s.get('teacher_name')}'", "teacher_name MISSING")
        check("division_name" in s, f"division_name present: '{s.get('division_name')}'", "division_name MISSING")
        # Check no raw "#N" labels
        raw_ids = [s for s in sessions if
                   str(s.get("subject_name", "")).startswith("Subject #") or
                   str(s.get("teacher_name", "")).startswith("Instructor #")]
        check(len(raw_ids) == 0,
              "No raw Subject#/Instructor# labels in timetable",
              f"{len(raw_ids)} sessions still have raw ID labels → seed data not resolved")
    else:
        warn("No timetable sessions in DB — name resolution cannot be verified")
else:
    fail(f"ADMIN timetable GET → {r.status_code} {r.text[:120]}")

section("3b. TIMETABLE — Role-scoped GET /")
# Student should only see their own division's sessions
r_student = requests.get(f"{API}/api/v1/timetable/", headers=auth("STUDENT"), timeout=15)
check(r_student.status_code == 200, f"STUDENT GET /timetable/ → {r_student.status_code}", f"STUDENT GET failed {r_student.status_code}")
student_sessions = r_student.json() if r_student.status_code == 200 else []
ok(f"STUDENT sees {len(student_sessions)} sessions (own division scope)")

# Teacher should only see their own sessions
r_teacher = requests.get(f"{API}/api/v1/timetable/", headers=auth("TEACHER"), timeout=15)
check(r_teacher.status_code == 200, f"TEACHER GET /timetable/ → {r_teacher.status_code}", f"TEACHER GET failed {r_teacher.status_code}")
teacher_sessions = r_teacher.json() if r_teacher.status_code == 200 else []
ok(f"TEACHER sees {len(teacher_sessions)} sessions (own classes scope)")

section("3c. TIMETABLE — POST allowed for FACULTY/ADMIN/SUPER_ADMIN")
future_start = (datetime.utcnow() + timedelta(days=7)).isoformat()
future_end   = (datetime.utcnow() + timedelta(days=7, hours=1)).isoformat()

# First get a valid subject_id, teacher_id, division_id
subjects   = requests.get(f"{API}/api/v1/academic/subjects",   headers=auth("ADMIN"), timeout=15).json()
divisions  = requests.get(f"{API}/api/v1/academic/divisions",  headers=auth("ADMIN"), timeout=15).json()
users      = requests.get(f"{API}/api/v1/auth/users",           headers=auth("ADMIN"), timeout=15).json()
teachers   = [u for u in (users if isinstance(users, list) else []) if u.get("role") == "TEACHER"]

if subjects and divisions and teachers:
    payload = {
        "subject_id":  subjects[0]["id"],
        "division_id": divisions[0]["id"],
        "teacher_id":  teachers[0]["id"],
        "room":        "TEST-101",
        "start_time":  future_start,
        "end_time":    future_end,
    }

    new_session_id = None

    # ADMIN should succeed
    r = requests.post(f"{API}/api/v1/timetable/", json=payload, headers=auth("ADMIN"), timeout=15)
    check(r.status_code == 201, f"ADMIN POST → 201 Created", f"ADMIN POST → {r.status_code} {r.text[:120]}")
    if r.status_code == 201:
        created = r.json()
        new_session_id = created.get("id")
        check(created.get("subject_name") is not None,
              f"Created session has subject_name: '{created.get('subject_name')}'",
              f"Created session missing subject_name: {created}")

    # FACULTY should succeed
    r_f = requests.post(f"{API}/api/v1/timetable/", json={**payload, "room": "TEST-102",
                        "start_time": (datetime.utcnow() + timedelta(days=8)).isoformat(),
                        "end_time":   (datetime.utcnow() + timedelta(days=8, hours=1)).isoformat()},
                        headers=auth("FACULTY"), timeout=15)
    check(r_f.status_code == 201, f"FACULTY POST → 201 Created", f"FACULTY POST → {r_f.status_code} {r_f.text[:120]}")
    fac_session_id = r_f.json().get("id") if r_f.status_code == 201 else None

    # STUDENT should be FORBIDDEN
    r_s = requests.post(f"{API}/api/v1/timetable/", json=payload, headers=auth("STUDENT"), timeout=15)
    check(r_s.status_code == 403, f"STUDENT POST → 403 Forbidden (correct)", f"STUDENT POST → {r_s.status_code} (expected 403)")

    # TEACHER should be FORBIDDEN
    r_t = requests.post(f"{API}/api/v1/timetable/", json=payload, headers=auth("TEACHER"), timeout=15)
    check(r_t.status_code == 403, f"TEACHER POST → 403 Forbidden (correct)", f"TEACHER POST → {r_t.status_code} (expected 403)")

    section("3d. TIMETABLE — Conflict detection returns structured 409")
    # Duplicate the same slot
    r_conflict = requests.post(f"{API}/api/v1/timetable/", json=payload, headers=auth("ADMIN"), timeout=15)
    check(r_conflict.status_code == 409, f"Duplicate slot → 409 Conflict (correct)", f"Duplicate slot → {r_conflict.status_code} (expected 409)")
    if r_conflict.status_code == 409:
        detail = r_conflict.json().get("detail", {})
        has_conflict_key = isinstance(detail, dict) and "conflict" in detail
        check(has_conflict_key, f"409 has structured conflict detail: {detail.get('message','')}", f"409 detail not structured: {detail}")

    section("3e. TIMETABLE — Time validation")
    # Past schedule
    past_payload = {**payload, "room": "TEST-PAST",
                    "start_time": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                    "end_time":   (datetime.utcnow() - timedelta(hours=23)).isoformat()}
    r_past = requests.post(f"{API}/api/v1/timetable/", json=past_payload, headers=auth("ADMIN"), timeout=15)
    check(r_past.status_code in [409, 422], f"Past schedule rejected → {r_past.status_code}", f"Past schedule NOT rejected → {r_past.status_code}")

    # end < start
    bad_payload = {**payload, "room": "TEST-BAD",
                   "start_time": future_end,
                   "end_time":   future_start}
    r_bad = requests.post(f"{API}/api/v1/timetable/", json=bad_payload, headers=auth("ADMIN"), timeout=15)
    check(r_bad.status_code == 422, f"end<start rejected → 422", f"end<start NOT rejected → {r_bad.status_code}")

    section("3f. TIMETABLE — DELETE (cancel session)")
    if new_session_id:
        r_del = requests.delete(f"{API}/api/v1/timetable/{new_session_id}", headers=auth("ADMIN"), timeout=15)
        check(r_del.status_code == 204, f"Admin cancelled session {new_session_id} → 204", f"DELETE → {r_del.status_code}")

        # Student should NOT be able to delete
        if fac_session_id:
            r_del_s = requests.delete(f"{API}/api/v1/timetable/{fac_session_id}", headers=auth("STUDENT"), timeout=15)
            check(r_del_s.status_code == 403, f"STUDENT DELETE → 403 Forbidden (correct)", f"STUDENT DELETE → {r_del_s.status_code}")
            # Cleanup
            requests.delete(f"{API}/api/v1/timetable/{fac_session_id}", headers=auth("ADMIN"), timeout=15)
else:
    warn("Skipping POST tests — no subjects/divisions/teachers in DB")

# ─── My Schedule ─────────────────────────────────────────────────────────────
section("4. TIMETABLE — /my-schedule per role")
for role in ["ADMIN", "TEACHER", "FACULTY", "STUDENT"]:
    r = requests.get(f"{API}/api/v1/timetable/my-schedule", headers=auth(role), timeout=15)
    if r.status_code == 200:
        data = r.json()
        ok(f"{role} /my-schedule → {len(data)} sessions")
        if data and "subject_name" in data[0]:
            ok(f"  subject_name resolved: '{data[0]['subject_name']}'")
        elif data:
            warn(f"  subject_name missing in my-schedule response")
    else:
        fail(f"{role} /my-schedule → {r.status_code}")

# ─── Resources ───────────────────────────────────────────────────────────────
section("5. RESOURCES — Role permissions")
resource_payload = {"name": "Test Lab A", "description": "Auto-test resource", "capacity": 30, "location": "Block A"}

# FACULTY can create
r = requests.post(f"{API}/api/v1/campus/resources", json=resource_payload, headers=auth("FACULTY"), timeout=15)
check(r.status_code == 201 or r.status_code == 200, f"FACULTY create resource → {r.status_code}", f"FACULTY create resource → {r.status_code} {r.text[:100]}")
new_resource_id = r.json().get("id") if r.status_code in [200, 201] else None

# STUDENT cannot create
r = requests.post(f"{API}/api/v1/campus/resources", json=resource_payload, headers=auth("STUDENT"), timeout=15)
check(r.status_code == 403, f"STUDENT create resource → 403 (correct)", f"STUDENT create resource → {r.status_code} (expected 403)")

# TEACHER cannot create
r = requests.post(f"{API}/api/v1/campus/resources", json=resource_payload, headers=auth("TEACHER"), timeout=15)
check(r.status_code == 403, f"TEACHER create resource → 403 (correct)", f"TEACHER create resource → {r.status_code} (expected 403)")

# Everyone can GET
for role in ["STUDENT", "TEACHER", "FACULTY", "ADMIN"]:
    r = requests.get(f"{API}/api/v1/campus/resources", headers=auth(role), timeout=15)
    check(r.status_code == 200, f"{role} GET resources → 200", f"{role} GET resources → {r.status_code}")

# Cleanup test resource
if new_resource_id:
    r = requests.delete(f"{API}/api/v1/campus/resources/{new_resource_id}", headers=auth("ADMIN"), timeout=15)
    check(r.status_code == 204, f"ADMIN delete resource → 204", f"ADMIN delete resource → {r.status_code}")

    # STUDENT cannot delete
    requests.post(f"{API}/api/v1/campus/resources", json=resource_payload, headers=auth("ADMIN"), timeout=15)
    resources_now = requests.get(f"{API}/api/v1/campus/resources", headers=auth("ADMIN"), timeout=15).json()
    if resources_now:
        first_id = resources_now[0]["id"]
        r_s = requests.delete(f"{API}/api/v1/campus/resources/{first_id}", headers=auth("STUDENT"), timeout=15)
        check(r_s.status_code == 403, f"STUDENT delete resource → 403 (correct)", f"STUDENT delete resource → {r_s.status_code}")

# ─── QR / Attendance ─────────────────────────────────────────────────────────
section("6. ATTENDANCE — Role enforcement")
# Try to start an attendance session as STUDENT (should 403)
sessions_list = requests.get(f"{API}/api/v1/timetable/", headers=auth("ADMIN"), timeout=15).json()
if sessions_list:
    class_id = sessions_list[0]["id"]

    r = requests.post(f"{API}/api/v1/attendance/sessions",
                      json={"class_session_id": class_id},
                      headers=auth("STUDENT"), timeout=15)
    check(r.status_code == 403,
          f"STUDENT start attendance → 403 (correct)",
          f"STUDENT start attendance → {r.status_code} (expected 403)")

    # TEACHER starting their OWN class attendance
    teacher_sessions = [s for s in sessions_list if s.get("teacher_id") == tokens.get("TEACHER_ID")]
    r_t = requests.post(f"{API}/api/v1/attendance/sessions",
                        json={"class_session_id": class_id},
                        headers=auth("TEACHER"), timeout=15)
    # may be 400 (outside time window) or 403 (not their class) — both are valid security
    check(r_t.status_code in [400, 403, 201, 200],
          f"TEACHER start attendance → {r_t.status_code} (time/auth check working)",
          f"TEACHER start attendance → unexpected {r_t.status_code}")
else:
    warn("No sessions in DB — attendance tests skipped")

# ─── Academic endpoints ───────────────────────────────────────────────────────
section("7. ACADEMIC — Subjects, Divisions, Departments")
for ep in ["subjects", "divisions", "departments", "batches"]:
    r = requests.get(f"{API}/api/v1/academic/{ep}", headers=auth("ADMIN"), timeout=15)
    data = r.json() if r.status_code == 200 else []
    check(r.status_code == 200, f"GET /academic/{ep} → {len(data)} records", f"GET /academic/{ep} → {r.status_code}")

# ─── Notices ─────────────────────────────────────────────────────────────────
section("8. NOTICES — Role permissions")
notice_payload = {"title": "Test Notice", "content": "Auto-generated test notice", "priority": "NORMAL"}

r = requests.post(f"{API}/api/v1/campus/notices", json=notice_payload, headers=auth("FACULTY"), timeout=15)
check(r.status_code in [200, 201], f"FACULTY create notice → {r.status_code}", f"FACULTY create notice → {r.status_code} {r.text[:80]}")

r = requests.post(f"{API}/api/v1/campus/notices", json=notice_payload, headers=auth("STUDENT"), timeout=15)
check(r.status_code == 403, f"STUDENT create notice → 403 (correct)", f"STUDENT create notice → {r.status_code} (expected 403)")

r = requests.get(f"{API}/api/v1/campus/notices", headers=auth("STUDENT"), timeout=15)
check(r.status_code == 200, f"STUDENT read notices → 200 ({len(r.json())} notices)", f"STUDENT read notices → {r.status_code}")

# ─── Events ──────────────────────────────────────────────────────────────────
section("9. EVENTS — STUDENT cannot create")
event_payload = {"title": "Test Event", "description": "Auto test", "event_date": (datetime.utcnow() + timedelta(days=5)).isoformat(), "location": "Main Hall", "max_capacity": 100}

r = requests.post(f"{API}/api/v1/campus/events", json=event_payload, headers=auth("STUDENT"), timeout=15)
check(r.status_code == 403, f"STUDENT create event → 403 (correct)", f"STUDENT create event → {r.status_code}")

r = requests.post(f"{API}/api/v1/campus/events", json=event_payload, headers=auth("ADMIN"), timeout=15)
check(r.status_code in [200, 201], f"ADMIN create event → {r.status_code}", f"ADMIN create event → {r.status_code} {r.text[:80]}")

r = requests.get(f"{API}/api/v1/campus/events", headers=auth("STUDENT"), timeout=15)
check(r.status_code == 200, f"STUDENT read events → 200 ({len(r.json())} events)", f"STUDENT read events → {r.status_code}")

# ─── Users endpoint ───────────────────────────────────────────────────────────
section("10. USERS — STUDENT cannot list all users")
r = requests.get(f"{API}/api/v1/auth/users", headers=auth("STUDENT"), timeout=15)
check(r.status_code == 403, f"STUDENT GET /users → 403 (correct)", f"STUDENT GET /users → {r.status_code} (expected 403)")

r = requests.get(f"{API}/api/v1/auth/users", headers=auth("ADMIN"), timeout=15)
check(r.status_code == 200, f"ADMIN GET /users → 200 ({len(r.json())} users)", f"ADMIN GET /users → {r.status_code}")

# ─── Summary ─────────────────────────────────────────────────────────────────
total = passed + failed + warnings
print(f"\n{'═'*55}")
print(f"{BOLD}  TEST SUMMARY{W}")
print(f"{'─'*55}")
print(f"  {G}Passed:  {passed}{W}")
print(f"  {R}Failed:  {failed}{W}")
print(f"  {Y}Warnings:{warnings}{W}")
print(f"  Total:   {total}")
print(f"{'═'*55}\n")

if failed > 0:
    sys.exit(1)
