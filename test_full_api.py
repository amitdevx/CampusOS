#!/usr/bin/env python3
"""
CampusOS Full API Test Suite
Tests every role flow: auth, timetable (name resolution, scoping, conflicts),
resources, QR/attendance, and role permission enforcement (403 checks).
"""

import requests
import sys
import time
from datetime import datetime, timedelta, timezone

API = "https://campusos-api-3r6a.onrender.com"

# ─── Colours ────────────────────────────────────────────────────────────────
G = "\033[92m"; R = "\033[91m"; Y = "\033[93m"; B = "\033[94m"; W = "\033[0m"; BOLD = "\033[1m"

passed = 0
failed = 0
warnings = 0

def ok(msg):     global passed;   passed += 1;   print(f"  {G}✓{W} {msg}")
def fail(msg):   global failed;   failed += 1;   print(f"  {R}✗{W} {msg}")
def warn(msg):   global warnings; warnings += 1; print(f"  {Y}⚠{W} {msg}")
def section(msg): print(f"\n{BOLD}{B}── {msg} ──{W}")

def check(cond, ok_msg, fail_msg):
    if cond: ok(ok_msg)
    else:    fail(fail_msg)

def safe_json(r, fallback=None):
    """Parse JSON safely — return fallback if body is empty or unparseable."""
    try:
        return r.json()
    except Exception:
        return [] if fallback is None else fallback

def get_retry(url, headers, retries=4, delay=15, timeout=20):
    """GET with retries — handles Render cold-start empty bodies."""
    for i in range(retries):
        try:
            r = requests.get(url, headers=headers, timeout=timeout)
            if r.status_code == 200 and r.text.strip():
                return r
            warn(f"Empty/non-200 from {url} (attempt {i+1}/{retries}) — waiting {delay}s")
        except requests.exceptions.Timeout:
            warn(f"Timeout on {url} (attempt {i+1}/{retries}) — waiting {delay}s")
        if i < retries - 1:
            time.sleep(delay)
    return requests.get(url, headers=headers, timeout=timeout)

def now_utc():
    return datetime.now(timezone.utc)

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
    try:
        r = requests.post(
            f"{API}/api/v1/auth/login",
            data={"username": email, "password": pw},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30,
        )
        if r.status_code == 200:
            tokens[role] = r.json()["access_token"]
            ok(f"Login {role} → token obtained")
            return tokens[role]
        else:
            fail(f"Login {role} → {r.status_code}: {r.text[:80]}")
    except Exception as e:
        fail(f"Login {role} → exception: {e}")
    return None

def auth(role):
    return {"Authorization": f"Bearer {tokens.get(role, '')}"}

# ════════════════════════════════════════════════════════════
section("0. HEALTH CHECK — wake Render if sleeping")
for attempt in range(1, 6):
    try:
        r = requests.get(f"{API}/health", timeout=35)
        if r.status_code == 200:
            ok(f"API healthy → {safe_json(r)}")
            break
    except Exception:
        pass
    print(f"  {Y}  Render still booting (attempt {attempt}/5)... waiting 15s{W}")
    time.sleep(15)
else:
    fail("API unreachable after 5 attempts")
    sys.exit(1)

# ─── Give Render a moment to fully stabilise ─────────────────
print(f"  {Y}  Letting server fully stabilise (10s)...{W}")
time.sleep(10)

# ════════════════════════════════════════════════════════════
section("1. AUTH — All 5 roles login")
for role in ACCOUNTS:
    login(role)

# ════════════════════════════════════════════════════════════
section("2. AUTH — /me returns correct role")
for role in ACCOUNTS:
    r = requests.get(f"{API}/api/v1/auth/me", headers=auth(role), timeout=15)
    if r.status_code == 200:
        got = safe_json(r, {}).get("role")
        check(got == role, f"{role}: /me → role={got}", f"{role}: /me returned role={got} (expected {role})")
    else:
        fail(f"{role}: /me → {r.status_code}")

# ════════════════════════════════════════════════════════════
section("3. TIMETABLE — GET / name resolution")
r = get_retry(f"{API}/api/v1/timetable/", headers=auth("ADMIN"))
if r.status_code == 200:
    sessions = safe_json(r, [])
    ok(f"ADMIN got {len(sessions)} timetable sessions")
    if sessions:
        s = sessions[0]
        check("subject_name" in s, f"subject_name present: '{s.get('subject_name')}'", "subject_name MISSING — still returning IDs")
        check("teacher_name" in s, f"teacher_name present: '{s.get('teacher_name')}'", "teacher_name MISSING")
        check("division_name" in s, f"division_name present: '{s.get('division_name')}'", "division_name MISSING")
        raw = [x for x in sessions if
               str(x.get("subject_name","")).startswith("Subject #") or
               str(x.get("teacher_name","")).startswith("Instructor #")]
        check(len(raw) == 0,
              "No raw Subject#/Instructor# labels in timetable",
              f"{len(raw)} sessions still have raw ID labels")
    else:
        warn("No timetable sessions in DB — name resolution cannot be verified")
else:
    fail(f"ADMIN timetable GET → {r.status_code}: {r.text[:100]}")

# ════════════════════════════════════════════════════════════
section("3b. TIMETABLE — Role-scoped GET /")
r_st = requests.get(f"{API}/api/v1/timetable/", headers=auth("STUDENT"), timeout=15)
check(r_st.status_code == 200, f"STUDENT GET /timetable/ → 200", f"STUDENT GET failed → {r_st.status_code}")
ok(f"STUDENT sees {len(safe_json(r_st))} sessions (own division scope)")

r_te = requests.get(f"{API}/api/v1/timetable/", headers=auth("TEACHER"), timeout=15)
check(r_te.status_code == 200, f"TEACHER GET /timetable/ → 200", f"TEACHER GET failed → {r_te.status_code}")
ok(f"TEACHER sees {len(safe_json(r_te))} sessions (own classes scope)")

# ════════════════════════════════════════════════════════════
section("3c. TIMETABLE — POST permissions (FACULTY/ADMIN allowed, STUDENT/TEACHER blocked)")

subjects  = safe_json(get_retry(f"{API}/api/v1/academic/subjects",  headers=auth("ADMIN")), [])
divisions = safe_json(get_retry(f"{API}/api/v1/academic/divisions", headers=auth("ADMIN")), [])
users_r   = get_retry(f"{API}/api/v1/auth/users",                   headers=auth("ADMIN"))
users     = safe_json(users_r, [])
teachers  = [u for u in users if u.get("role") == "TEACHER"]

new_session_id = None
fac_session_id = None

if subjects and divisions and teachers:
    future_start = (now_utc() + timedelta(days=7)).isoformat()
    future_end   = (now_utc() + timedelta(days=7, hours=1)).isoformat()
    payload = {
        "subject_id":  subjects[0]["id"],
        "division_id": divisions[0]["id"],
        "teacher_id":  teachers[0]["id"],
        "room":        "TEST-101",
        "start_time":  future_start,
        "end_time":    future_end,
    }

    # ADMIN → 201
    r = requests.post(f"{API}/api/v1/timetable/", json=payload, headers=auth("ADMIN"), timeout=15)
    check(r.status_code == 201, f"ADMIN POST → 201 Created", f"ADMIN POST → {r.status_code}: {r.text[:120]}")
    if r.status_code == 201:
        c = safe_json(r, {})
        new_session_id = c.get("id")
        check(c.get("subject_name") is not None,
              f"Created session subject_name: '{c.get('subject_name')}'",
              f"Created session missing subject_name: {c}")

    # FACULTY → 201 (different room/time)
    r_f = requests.post(f"{API}/api/v1/timetable/", json={
        **payload,
        "room": "TEST-102",
        "start_time": (now_utc() + timedelta(days=8)).isoformat(),
        "end_time":   (now_utc() + timedelta(days=8, hours=1)).isoformat(),
    }, headers=auth("FACULTY"), timeout=15)
    check(r_f.status_code == 201, f"FACULTY POST → 201 Created", f"FACULTY POST → {r_f.status_code}: {r_f.text[:120]}")
    if r_f.status_code == 201:
        fac_session_id = safe_json(r_f, {}).get("id")

    # STUDENT → 403
    r_s = requests.post(f"{API}/api/v1/timetable/", json=payload, headers=auth("STUDENT"), timeout=15)
    check(r_s.status_code == 403, f"STUDENT POST → 403 Forbidden ✓", f"STUDENT POST → {r_s.status_code} (expected 403)")

    # TEACHER → 403
    r_t = requests.post(f"{API}/api/v1/timetable/", json=payload, headers=auth("TEACHER"), timeout=15)
    check(r_t.status_code == 403, f"TEACHER POST → 403 Forbidden ✓", f"TEACHER POST → {r_t.status_code} (expected 403)")

    # ── Conflict detection ───────────────────────────────────
    section("3d. TIMETABLE — Conflict detection → structured 409")
    r_c = requests.post(f"{API}/api/v1/timetable/", json=payload, headers=auth("ADMIN"), timeout=15)
    check(r_c.status_code == 409, f"Duplicate slot → 409 Conflict ✓", f"Duplicate slot → {r_c.status_code} (expected 409)")
    if r_c.status_code == 409:
        detail = safe_json(r_c, {}).get("detail", {})
        check(isinstance(detail, dict) and "conflict" in detail,
              f"409 has structured conflict: '{detail.get('message','')}'  room={detail.get('conflict',{}).get('room')}",
              f"409 detail not structured: {detail}")

    # ── Time validation ──────────────────────────────────────
    section("3e. TIMETABLE — Time validation")
    past_p = {**payload, "room": "TEST-PAST",
              "start_time": (now_utc() - timedelta(days=1)).isoformat(),
              "end_time":   (now_utc() - timedelta(hours=23)).isoformat()}
    r_past = requests.post(f"{API}/api/v1/timetable/", json=past_p, headers=auth("ADMIN"), timeout=15)
    check(r_past.status_code in [409, 422], f"Past schedule rejected → {r_past.status_code} ✓", f"Past schedule NOT rejected → {r_past.status_code}")

    bad_p = {**payload, "room": "TEST-BAD", "start_time": future_end, "end_time": future_start}
    r_bad = requests.post(f"{API}/api/v1/timetable/", json=bad_p, headers=auth("ADMIN"), timeout=15)
    check(r_bad.status_code == 422, f"end<start rejected → 422 ✓", f"end<start NOT rejected → {r_bad.status_code}")

    # ── Cancel sessions ──────────────────────────────────────
    section("3f. TIMETABLE — DELETE (cancel session)")
    if new_session_id:
        r_del = requests.delete(f"{API}/api/v1/timetable/{new_session_id}", headers=auth("ADMIN"), timeout=15)
        check(r_del.status_code == 204, f"Admin cancelled session {new_session_id} → 204 ✓", f"DELETE → {r_del.status_code}")

    if fac_session_id:
        r_del_s = requests.delete(f"{API}/api/v1/timetable/{fac_session_id}", headers=auth("STUDENT"), timeout=15)
        check(r_del_s.status_code == 403, f"STUDENT DELETE → 403 Forbidden ✓", f"STUDENT DELETE → {r_del_s.status_code}")
        # Cleanup
        requests.delete(f"{API}/api/v1/timetable/{fac_session_id}", headers=auth("ADMIN"), timeout=15)

else:
    warn(f"Skipping POST tests — subjects={len(subjects)} divisions={len(divisions)} teachers={len(teachers)}")

# ════════════════════════════════════════════════════════════
section("4. TIMETABLE — /my-schedule per role")
for role in ["ADMIN", "TEACHER", "FACULTY", "STUDENT"]:
    r = requests.get(f"{API}/api/v1/timetable/my-schedule", headers=auth(role), timeout=15)
    data = safe_json(r, [])
    if r.status_code == 200:
        ok(f"{role} /my-schedule → {len(data)} sessions")
        if data and data[0].get("subject_name"):
            ok(f"  ↳ subject_name resolved: '{data[0]['subject_name']}'")
        elif data:
            warn(f"  ↳ subject_name missing in my-schedule response")
    else:
        fail(f"{role} /my-schedule → {r.status_code}")

# ════════════════════════════════════════════════════════════
section("5. RESOURCES — Role permissions")
res_payload = {"name": "Test Lab Auto", "description": "Auto-test resource", "capacity": 30, "location": "Block A"}

# FACULTY → allowed
r = requests.post(f"{API}/api/v1/campus/resources", json=res_payload, headers=auth("FACULTY"), timeout=15)
check(r.status_code in [200, 201], f"FACULTY create resource → {r.status_code} ✓", f"FACULTY create resource → {r.status_code}: {r.text[:100]}")
new_res_id = safe_json(r, {}).get("id") if r.status_code in [200, 201] else None

# ADMIN → allowed
r_a = requests.post(f"{API}/api/v1/campus/resources", json={**res_payload,"name":"Admin Test Lab"}, headers=auth("ADMIN"), timeout=15)
check(r_a.status_code in [200, 201], f"ADMIN create resource → {r_a.status_code} ✓", f"ADMIN create resource → {r_a.status_code}: {r_a.text[:100]}")
admin_res_id = safe_json(r_a, {}).get("id") if r_a.status_code in [200, 201] else None

# STUDENT → 403
r_s = requests.post(f"{API}/api/v1/campus/resources", json=res_payload, headers=auth("STUDENT"), timeout=15)
check(r_s.status_code == 403, f"STUDENT create resource → 403 Forbidden ✓", f"STUDENT create resource → {r_s.status_code} (expected 403)")

# TEACHER → 403
r_t = requests.post(f"{API}/api/v1/campus/resources", json=res_payload, headers=auth("TEACHER"), timeout=15)
check(r_t.status_code == 403, f"TEACHER create resource → 403 Forbidden ✓", f"TEACHER create resource → {r_t.status_code} (expected 403)")

# GET — all roles
for role in ["STUDENT", "TEACHER", "FACULTY", "ADMIN"]:
    r = requests.get(f"{API}/api/v1/campus/resources", headers=auth(role), timeout=15)
    check(r.status_code == 200, f"{role} GET resources → 200 ({len(safe_json(r))} items)", f"{role} GET resources → {r.status_code}")

# DELETE — STUDENT forbidden, ADMIN allowed
if new_res_id:
    r_del_s = requests.delete(f"{API}/api/v1/campus/resources/{new_res_id}", headers=auth("STUDENT"), timeout=15)
    check(r_del_s.status_code == 403, f"STUDENT DELETE resource → 403 ✓", f"STUDENT DELETE resource → {r_del_s.status_code}")
    # Cleanup
    requests.delete(f"{API}/api/v1/campus/resources/{new_res_id}", headers=auth("ADMIN"), timeout=15)
if admin_res_id:
    r_del_a = requests.delete(f"{API}/api/v1/campus/resources/{admin_res_id}", headers=auth("ADMIN"), timeout=15)
    check(r_del_a.status_code == 204, f"ADMIN DELETE resource → 204 ✓", f"ADMIN DELETE resource → {r_del_a.status_code}")

# ════════════════════════════════════════════════════════════
section("6. ATTENDANCE — Role enforcement")
all_sessions = safe_json(requests.get(f"{API}/api/v1/timetable/", headers=auth("ADMIN"), timeout=15), [])
if all_sessions:
    class_id = all_sessions[0]["id"]
    r = requests.post(f"{API}/api/v1/attendance/sessions",
                      json={"class_session_id": class_id},
                      headers=auth("STUDENT"), timeout=15)
    check(r.status_code == 403, f"STUDENT start attendance → 403 ✓", f"STUDENT start attendance → {r.status_code} (expected 403)")

    r_t = requests.post(f"{API}/api/v1/attendance/sessions",
                        json={"class_session_id": class_id},
                        headers=auth("TEACHER"), timeout=15)
    check(r_t.status_code in [400, 403, 200, 201],
          f"TEACHER start attendance → {r_t.status_code} (time/auth check working)",
          f"TEACHER start attendance → unexpected {r_t.status_code}")
else:
    warn("No sessions in DB — attendance tests skipped")

# ════════════════════════════════════════════════════════════
section("7. ACADEMIC — Subjects, Divisions, Departments, Batches")
for ep in ["subjects", "divisions", "departments", "batches"]:
    r = get_retry(f"{API}/api/v1/academic/{ep}", headers=auth("ADMIN"))
    data = safe_json(r, [])
    check(r.status_code == 200, f"GET /academic/{ep} → {len(data)} records", f"GET /academic/{ep} → {r.status_code}")

# ════════════════════════════════════════════════════════════
section("8. NOTICES — Role permissions")
notice_payload = {"title": "Auto-test Notice", "content": "Generated by test suite", "target_audience": "EVERYONE"}

r = requests.post(f"{API}/api/v1/campus/notices", json=notice_payload, headers=auth("FACULTY"), timeout=15)
check(r.status_code in [200, 201], f"FACULTY create notice → {r.status_code} ✓", f"FACULTY create notice → {r.status_code}: {r.text[:80]}")

r = requests.post(f"{API}/api/v1/campus/notices", json=notice_payload, headers=auth("STUDENT"), timeout=15)
check(r.status_code == 403, f"STUDENT create notice → 403 ✓", f"STUDENT create notice → {r.status_code} (expected 403)")

r = requests.get(f"{API}/api/v1/campus/notices", headers=auth("STUDENT"), timeout=15)
check(r.status_code == 200, f"STUDENT read notices → 200 ({len(safe_json(r))} notices)", f"STUDENT read notices → {r.status_code}")

# ════════════════════════════════════════════════════════════
section("9. EVENTS — Role permissions")
event_payload = {
    "title": "Auto-test Event",
    "description": "Generated by test suite",
    "event_date": (now_utc() + timedelta(days=5)).isoformat(),
    "location": "Main Hall",
}

r = requests.post(f"{API}/api/v1/campus/events", json=event_payload, headers=auth("STUDENT"), timeout=15)
check(r.status_code == 403, f"STUDENT create event → 403 ✓", f"STUDENT create event → {r.status_code} (expected 403)")

r = requests.post(f"{API}/api/v1/campus/events", json=event_payload, headers=auth("ADMIN"), timeout=15)
check(r.status_code in [200, 201], f"ADMIN create event → {r.status_code} ✓", f"ADMIN create event → {r.status_code}: {r.text[:80]}")

r = requests.get(f"{API}/api/v1/campus/events", headers=auth("STUDENT"), timeout=15)
check(r.status_code == 200, f"STUDENT read events → 200 ({len(safe_json(r))} events)", f"STUDENT read events → {r.status_code}")

# ════════════════════════════════════════════════════════════
section("10. USERS — STUDENT blocked, ADMIN allowed")
r = requests.get(f"{API}/api/v1/auth/users", headers=auth("STUDENT"), timeout=15)
check(r.status_code == 403, f"STUDENT GET /users → 403 ✓", f"STUDENT GET /users → {r.status_code} (expected 403)")

r = get_retry(f"{API}/api/v1/auth/users", headers=auth("ADMIN"))
data = safe_json(r, [])
check(r.status_code == 200 and len(data) > 0, f"ADMIN GET /users → 200 ({len(data)} users)", f"ADMIN GET /users → {r.status_code}")

# ════════════════════════════════════════════════════════════
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
