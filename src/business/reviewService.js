import { get, post, put, del } from '@data/apiClient';

const BASE = '/reviews';

export async function getTopReviews(limit = 6) {
  return await get(`${BASE}/top?limit=${limit}`);
}

export async function getReviewsFromFriends(friendIds, limit = 6) {
  const query = friendIds.map(id => `friend_ids=${id}`).join('&');
  return await get(`${BASE}/friends?${query}&limit=${limit}`);
}

export async function addReview(data) {
  return await post(`${BASE}/`, data);
}

export async function likeReview(reviewId, userId) {
  return await put(`${BASE}/${reviewId}/like?user_id=${userId}`);
}

export async function unlikeReview(reviewId, userId) {
  return await put(`${BASE}/${reviewId}/unlike?user_id=${userId}`);
}

export async function deleteReview(reviewId, userId) {
  return await del(`${BASE}/${reviewId}?user_id=${userId}`);
}

export async function getFriendsReviewsByGame(gameId, friendIds, limit = 6) {
  const query = friendIds.map(id => `friend_ids=${id}`).join('&');
  return await get(`${BASE}/game/${gameId}/friends?${query}&limit=${limit}`);
}

export async function getRecentReviewsByGame(gameId, limit = 6) {
  return await get(`/reviews/game/${gameId}/recent?limit=${limit}`);
}

export async function getTopReviewsByGame(gameId, limit = 6) {
  return await get(`${BASE}/game/${gameId}/top?limit=${limit}`);
}
