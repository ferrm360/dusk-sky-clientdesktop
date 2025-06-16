import { get, post, put } from '@data/apiClient';

const BASE_URL = '/friendships'; // 🔧 corregido

export async function getFriends(userId) {
  return get(`${BASE_URL}/user/${userId}`);
}

export async function getPendingRequests(userId) {
  return get(`${BASE_URL}/pending/${userId}`);
}

export async function sendFriendRequest(sender_id, receiver_id) {
  console.log('Enviando solicitud con:', { sender_id, receiver_id });

  return post(`/friendships`, {
    sender_id,
    receiver_id
  });
}



export async function acceptFriendRequest(requestId) {
  return put(`${BASE_URL}/${requestId}/accept`);
}

export async function rejectFriendRequest(requestId) {
  return put(`${BASE_URL}/${requestId}/reject`);
}
