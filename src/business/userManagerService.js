import UserSessionManager from "/@fs/C:/Users/neco3/Desktop/Proyecto final/dusk-sky-clientDesktop/src/business/UserSessionManager.js";

const BASE = '/profiles';

export async function getUserById(userId) {
  console.log('getUserById called with userId:', userId);  
  const response = await fetch(`${BASE}/${userId}`);
  const data = await response.json();
  console.log('Response from getUserById:', data);  
  return data;
}

export async function searchUsersByName(name) {
  console.log('searchUsersByName called with name:', name);  
  const response = await fetch(`${BASE}/search?username=${encodeURIComponent(name)}`);
  const data = await response.json();
  console.log('Response from searchUsersByName:', data);  
  return data;
}

export async function updateUsername(userId, newUsername) {
  console.log('updateUsername called with userId:', userId, 'and newUsername:', newUsername);  
  const res = await fetch(`${BASE}/update-username/${userId}?new_username=${encodeURIComponent(newUsername)}`, {
    method: 'PUT'
  });
  const data = await res.json();
  console.log('Response from updateUsername:', data); 
  return data;
}

export async function updateEmail(userId, newEmail) {
  console.log('updateEmail called with userId:', userId, 'and newEmail:', newEmail);  
  const res = await fetch(`${BASE}/update-email/${userId}?new_email=${encodeURIComponent(newEmail)}`, {
    method: 'PUT'
  });
  const data = await res.json();
  console.log('Response from updateEmail:', data);  
  return data;
}

export async function uploadProfileData(userId, {
  avatarFile,
  bannerFile,
  bio,
  about_section,
  mediaFile
}) {
  console.log('uploadProfileData called with userId:', userId); 
  const formData = new FormData();

  if (avatarFile) formData.append('avatar', avatarFile);
  if (bannerFile) formData.append('banner', bannerFile);
  if (mediaFile) formData.append('media', mediaFile);
  if (bio) formData.append('bio', bio);
  if (about_section) formData.append('about_section', about_section);

  const token = UserSessionManager.getToken();
  console.log('Token used for request:', token); 

  const response = await fetch(`${BASE}/${userId}/upload`, {
    method: 'PATCH',
    body: formData
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error uploading profile data:', text);  
    throw new Error(`Error ${response.status}: ${text}`);
  }

  const data = await response.json();
  console.log('Response from uploadProfileData:', data);  
  return data;
}
