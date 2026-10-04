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

async function run() {
  const MockAdapter = require('axios-mock-adapter');
  const mock = new MockAdapter(apiClient);

  mock.onGet('/401').reply(401);
  mock.onGet('/400').reply(400);
  mock.onGet('/403').reply(403);
  mock.onGet('/500').reply(500);
  mock.onGet('/timeout').networkError();

  try { await apiClient.get('/401'); } catch(e) {}
  console.assert(logoutCount === 1, "401 should trigger logout");

  try { await apiClient.get('/400'); } catch(e) {}
  console.assert(logoutCount === 1, "400 should NOT trigger logout");

  try { await apiClient.get('/403'); } catch(e) {}
  console.assert(logoutCount === 1, "403 should NOT trigger logout");

  try { await apiClient.get('/500'); } catch(e) {}
  console.assert(logoutCount === 1, "500 should NOT trigger logout");

  try { await apiClient.get('/timeout'); } catch(e) {}
  console.assert(logoutCount === 1, "Timeout should NOT trigger logout");

  console.log("Interceptor tests passed!");
}
run();
