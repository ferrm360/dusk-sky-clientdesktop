import { get, post } from '@data/apiClient';

const BASE = '/api/game';

export async function getPopularGames() {
  return await get(`${BASE}/popular`);
}

export async function getGameById(id) {
  return await get(`${BASE}/${id}`);
}

export async function searchGameByName(name) {
  return await get(`${BASE}/search?name=${encodeURIComponent(name)}`);
}

export async function importGameFromSteam(steamAppId) {
  return await post(`${BASE}/import/${steamAppId}`);
}
