import { get, post, put, del } from '@data/apiClient'; 

const BASE = '/comments';


export async function getCommentsByReview(reviewId) {
  try {
    // C# Endpoint: GET /comments/review/{reviewId}
    return await get(`${BASE}/review/${reviewId}`);
  } catch (error) {
    console.error(`Error fetching comments for reviewId ${reviewId}:`, error);
    throw error;
  }
}

export async function addComment(data) {
  try {

    return await post(`${BASE}`, data); 
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function getAllComments() {
  try {
    // C# Endpoint: GET /comments
    return await get(`${BASE}`);
  } catch (error) {
    console.error('Error fetching all comments:', error);
    throw error;
  }
}


export async function getCommentById(commentId) {
  try {
    return await get(`${BASE}/${commentId}`);
  } catch (error) {
    console.error(`Error fetching comment with ID ${commentId}:`, error);
    throw error;
  }
}


export async function updateCommentStatus(commentId, status) {
  try {
  
    return await put(`${BASE}/${commentId}?status=${status}`); 
  } catch (error) {
    console.error(`Error updating status for comment ID ${commentId}:`, error);
    throw error;
  }
}


export async function deleteComment(commentId) {
  try {
    return await del(`${BASE}/${commentId}`);
  } catch (error) {
    console.error(`Error deleting comment with ID ${commentId}:`, error);
    throw error;
  }
}