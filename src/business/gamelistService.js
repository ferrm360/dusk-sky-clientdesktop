import { get, post, put, del } from '@data/apiClient';

const BASE_URL = '/lists'; 

export async function getListsByUser(userId) {
  try {
    return await get(`${BASE_URL}/user/${userId}`);
  } catch (error) {
    console.error(`Error fetching game lists for user ${userId}:`, error);
    throw error;
  }
}


export async function getGameListById(listId) {
  try {
    return await get(`${BASE_URL}/${listId}`);
  } catch (error) {
    console.error(`Error fetching game list with ID ${listId}:`, error);
    throw error;
  }
}

export async function createGameList(listData) {
  try {
    return await post(`${BASE_URL}`, listData);
  } catch (error) {
    console.error('Error creating game list:', error);
    throw error;
  }
}


export async function updateGameList(listId, updatedListData) {
  try {
    const dataToSend = { ...updatedListData, id: listId };
    return await put(`${BASE_URL}/${listId}`, dataToSend);
  } catch (error) {
    console.error(`Error updating game list with ID ${listId}:`, error);
    throw error;
  }
}

export async function deleteGameList(listId) {
  try {
    return await del(`${BASE_URL}/${listId}`);
  } catch (error) {
    console.error(`Error deleting game list with ID ${listId}:`, error);
    throw error;
  }
}


export async function getMostRecentGameLists() {
  try {
    return await get(`${BASE_URL}/recent`);
  } catch (error) {
    console.error('Error fetching most recent game lists:', error);
    throw error;
  }
}


export async function getMostLikedGameLists() {
  try {
    return await get(`${BASE_URL}/popular`);
  } catch (error) {
    console.error('Error fetching most liked game lists:', error);
    throw error;
  }
}

export async function likeGameList(listId) {
  try {
    const response = await fetch(`${BASE_URL}/like/${listId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) 
    });

    if (!response.ok) {
      let errorMsg = `Error al dar "me gusta": ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMsg = errorBody.detail || errorMsg;
      } catch (_) {
        try {
          const text = await response.text();
          errorMsg = text || errorMsg;
        } catch (__) {}
      }
      throw new Error(errorMsg);
    }
    if (response.status === 204) {
      return null; 
    }
    return response.json(); 
  } catch (error) {
    console.error(`Error liking game list with ID ${listId}:`, error);
    throw error;
  }
}

export async function unlikeGameList(listId) {
  try {
    const response = await fetch(`${BASE_URL}/unlike/${listId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) 
    });

    if (!response.ok) {
      let errorMsg = `Error al quitar "me gusta": ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMsg = errorBody.detail || errorMsg;
      } catch (_) {
        try {
          const text = await response.text();
          errorMsg = text || errorMsg;
        } catch (__) {}
      }
      throw new Error(errorMsg);
    }
    if (response.status === 204) {
      return null; 
    }
    return response.json();
  } catch (error) {
    console.error(`Error unliking game list with ID ${listId}:`, error);
    throw error;
  }
}


export async function getGameListItems(listId) {
  try {
    return await get(`${BASE_URL}/${listId}/items`);
  } catch (error) {
    console.error(`Error fetching items for game list with ID ${listId}:`, error);
    throw error;
  }
}


export async function addGameListItem(listId, itemData) {
  try {
    const dataToSend = { ...itemData, ListId: listId };
    return await post(`${BASE_URL}/${listId}/items`, dataToSend);
  } catch (error) {
    console.error(`Error adding item to game list with ID ${listId}:`, error);
    throw error;
  }
}


export async function updateGameListItem(listId, itemId, updatedItemData) {
  try {
    const dataToSend = { ...updatedItemData, Id: itemId, ListId: listId };
    return await put(`${BASE_URL}/${listId}/items/${itemId}`, dataToSend);
  } catch (error) {
    console.error(`Error updating item ${itemId} in game list ${listId}:`, error);
    throw error;
  }
}


export async function deleteGameListItem(listId, itemId) {
  try {
    return await del(`${BASE_URL}/${listId}/items/${itemId}`);
  } catch (error) {
    console.error(`Error deleting item ${itemId} from game list ${listId}:`, error);
    throw error;
  }
}