import { TIMEOUT_VARIABLE } from './config.js';
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export async function resolveJSON(url) {
  try {
    const fetchData = fetch(url);
    const res = await Promise.race([fetchData, timeout(TIMEOUT_VARIABLE)]);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`err:${data.message} ${res.status}`);
    }
    return data;
  } catch (err) {
    throw err;
  }
}
export async function sendJSON(url, uploadData) {
  try {
    const fetchData = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });
    const res = await Promise.race([fetchData, timeout(TIMEOUT_VARIABLE)]);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`err:${data.message} ${res.status}`);
    }
    return data;
  } catch (err) {
    throw err;
  }
}
