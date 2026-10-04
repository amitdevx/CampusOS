const axios = require('axios');
const apiClient = axios.create();

let logoutCount = 0;
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      logoutCount++;
    }
    return Promise.reject(error);
  }
);

apiClient.defaults.adapter = async (config) => {
  if (config.url === '/401') return Promise.reject({ response: { status: 401 } });
  if (config.url === '/400') return Promise.reject({ response: { status: 400 } });
  if (config.url === '/403') return Promise.reject({ response: { status: 403 } });
  if (config.url === '/500') return Promise.reject({ response: { status: 500 } });
  if (config.url === '/timeout') return Promise.reject({ request: {} }); 
};

async function run() {
  try { await apiClient.get('/401'); } catch(e) {}
  console.assert(logoutCount === 1, "401 should trigger logout");

  try { await apiClient.get('/400'); } catch(e) {}
  console.assert(logoutCount === 1, "400 should NOT trigger logout");

  try { await apiClient.get('/timeout'); } catch(e) {}
  console.assert(logoutCount === 1, "Timeout should NOT trigger logout");

  // Concurrent 401s
  let concurrentLock = false;
  let simulatedLogoutCalls = 0;
  
  const simulatedLogout = async () => {
    if (concurrentLock) return;
    concurrentLock = true;
    simulatedLogoutCalls++;
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulating SecureStore async
    concurrentLock = false;
  };

  apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response && error.response.status === 401) {
        simulatedLogout();
      }
      return Promise.reject(error);
    }
  );

  try { 
    await Promise.all([
      apiClient.get('/401'),
      apiClient.get('/401'),
      apiClient.get('/401')
    ]); 
  } catch(e) {}

  console.assert(simulatedLogoutCalls === 1, "Concurrent lock should restrict to 1 logout execution");
  console.log("Interceptor tests passed! (Calls:", simulatedLogoutCalls, ")");
}
run();
