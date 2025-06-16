import { get, post, put } from '@data/apiClient';  
import UserSessionManager from './UserSessionManager';

export async function login(username, password) {
  const response = await post("/auth/login/", { username, password });

  const token = response.access_token;
  UserSessionManager.setToken(token);

  return {
    token,
    payload: UserSessionManager.getPayload()
  };
}

export async function register({ username, email, password }) {
  const response = await post("/auth/register/", {
    username,
    email,
    password
  });

  return response;
}

export async function searchUsersByUsername(username) {
  return await get(`/auth/users/search?username=${encodeURIComponent(username)}`);
}

export async function getUserById(userId) {
  return await get(`/auth/users/${userId}`);
}

export async function promoteUser(userId) {
  try {
    const response = await put(`/auth/promote/${userId}`);
    return response;  
  } catch (error) {
    console.error('Error al promover el usuario:', error);
    throw error; 
  }
}

export async function demoteUser(userId) {
  try {
    const response = await put(`/auth/demote/${userId}`);
    return response;  
  } catch (error) {
    console.error('Error al revertir el rol del usuario:', error);
    throw error;  
  }
}
