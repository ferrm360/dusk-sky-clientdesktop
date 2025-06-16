import { get, post, put, del } from '@data/apiClient';

const BASE_URL = '/api/trackings';

export async function getTrackingsByUser(userId) {
  const response = await get(`${BASE_URL}/user/${userId}`);
  console.log('🔍 getTrackingsByUser result:', response); 
  return response;
}


export async function getTrackingById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createTracking(trackingDto) {
  return await post(`${BASE_URL}`, trackingDto);
}

export async function updateTracking(id, trackingDto) {
  return await put(`${BASE_URL}/${id}`, trackingDto);
}

export async function deleteTracking(id) {
  await del(`${BASE_URL}/${id}`);
  return true; 
}

export async function getGameIdsByStatus(userId, status) {
  return await get(`${BASE_URL}/user/${userId}/status/${status}`);
}

export async function getLikedGameIds(userId) {
  return await get(`${BASE_URL}/user/${userId}/liked`);
}

export async function getTrackingByUserAndGame(userId, gameId) {
  return await post(`${BASE_URL}/lookup`, {
    userId,
    gameId,
  });
}
