import UserSessionManager from '../business/UserSessionManager';

async function request(method, url, data) {
  const token = UserSessionManager.getToken(); // <-- Aquí se toma el token
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && method !== 'DELETE') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMsg = errorBody.detail || errorMsg;
    } catch (_) {
      try {
        const text = await response.text();
        errorMsg = text || errorMsg;
      } catch (_) {}
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function get(url) {
  return request('GET', url);
}

export async function post(url, data) {
  return request('POST', url, data);
}

export async function put(url, data) {
  return request('PUT', url, data);
}

export async function del(url) {
  return request('DELETE', url);
}

export async function patch(url, data) {
  return request('PATCH', url, data);
}
