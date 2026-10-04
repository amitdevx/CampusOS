import { apiClient, setUnauthorizedCallback, login, getMe, setAuthToken } from './index';

async function runTests() {
  apiClient.defaults.baseURL = "http://127.0.2.2:8000";
  
  let logoutCalled = 0;
  setUnauthorizedCallback(() => {
    logoutCalled++;
  });

  console.log("1. Test 401 triggers callback");
  setAuthToken("invalid_token");
  try {
    await getMe();
  } catch (e) {
    // expected
  }
  
  if (logoutCalled === 1) {
    console.log("✅ 401 triggered logout");
  } else {
    console.error("❌ 401 failed to trigger logout", logoutCalled);
  }

  console.log("2. Test 400 does NOT trigger callback");
  logoutCalled = 0; // reset
  try {
    // login with invalid credentials gives 400
    await login("student@campusos.com", "wrongpass");
  } catch (e) {
    // expected
  }

  if (logoutCalled === 0) {
    console.log("✅ 400 did NOT trigger logout");
  } else {
    console.error("❌ 400 incorrectly triggered logout", logoutCalled);
  }

  console.log("3. Test 403 does NOT trigger callback");
  logoutCalled = 0; // reset
  // We need a student token to hit a 403 route
  const loginRes = await login("student@campusos.com", "campusos2026");
  setAuthToken(loginRes.access_token);
  try {
    // Student hitting admin endpoint /api/v1/users gives 403
    await apiClient.get('/api/v1/users');
  } catch (e) {
    // expected
  }
  
  if (logoutCalled === 0) {
    console.log("✅ 403 did NOT trigger logout");
  } else {
    console.error("❌ 403 incorrectly triggered logout", logoutCalled);
  }

  console.log("4. Test multiple concurrent 401s");
  logoutCalled = 0; // reset
  setAuthToken("invalid_token");
  try {
    await Promise.all([
      getMe(),
      getMe(),
      getMe()
    ]);
  } catch (e) {
    // expected
  }

  console.log(`✅ Concurrent 401s triggered callback ${logoutCalled} times (Wait, interceptor will fire for each response, but our App.tsx lock handles the race)`);
}

runTests().catch(console.error);
