import React, { useEffect, useState } from 'react';
import { useParams, Outlet, useLocation, useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import ProfileSubnav from '../components/ProfileSubnav';
import { getUserById } from '@business/userManagerService';
import UserSessionManager from '@business/UserSessionManager';
import EditProfileModal from '../components/EditProfileModal';
import Toast from 'react-bootstrap/Toast';
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest
} from '@business/friendshipService';
import { get } from '@data/apiClient';

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const [username, setUsername] = useState('Usuario');

  const payload = UserSessionManager.getPayload();
  const loggedUserId = payload?._id;
  const realId = userId === 'me' ? loggedUserId : userId;
  const isOwnProfile = realId === loggedUserId;

  const defaultBanner = 'assets/banners/default_banner.jpg';
  const defaultAvatar = 'assets/avatars/default_avatar.jpg';

  const activeTab = location.pathname.split('/').pop();

  useEffect(() => {
    if (!realId) return;

    const fetchData = async () => {
      try {
        const [prof, userData] = await Promise.all([
          getUserById(realId),
          get(`/auth/users/${realId}`)
        ]);

        setProfile(prof);
        setUsername(userData.username || 'Usuario');
      } catch (err) {
        console.error('Error obteniendo perfil o nombre:', err);
      }

      if (!isOwnProfile) {
        try {
          const [friends, pending] = await Promise.all([
            getFriends(loggedUserId),
            getPendingRequests(realId)
          ]);

          const isFriend = friends.some(
            f => f.sender_id === realId || f.receiver_id === realId
          );

          if (isFriend) {
            setFriendStatus('friend');
          } else {
            const pendingReq = pending.find(
              r => r.sender_id === loggedUserId && r.receiver_id === realId
            );
            if (pendingReq) {
              setFriendStatus('pending');
              setRequestId(pendingReq.id);
            } else {
              setFriendStatus('none');
            }
          }
        } catch (err) {
          console.error('Error comprobando amistad:', err);
          setFriendStatus('none');
        }
      } else {
        setFriendStatus('self');
      }
    };

    fetchData();
  }, [realId]);

  const handleProfileUpdated = async () => {
    try {
      const updated = await getUserById(realId);
      setProfile(updated);
      setImageRefreshKey(Date.now());
      setShowToast(true);
    } catch (err) {
      console.error('Error recargando perfil:', err);
    }
  };

  const handleTabChange = (key) => {
    navigate(`/profile/${userId}/${key === 'games' ? '' : key}`);
  };

  const renderFriendButton = () => {
    if (friendStatus === 'friend') return <span className="badge bg-success">Amigos</span>;
    if (friendStatus === 'pending') return <span className="badge bg-warning text-dark">Solicitud enviada</span>;
    if (friendStatus === 'none') {
      return (
        <button
          className="btn btn-outline-light btn-sm mt-1"
          onClick={async () => {
            try {
  await sendFriendRequest(loggedUserId, realId);
  setFriendStatus('pending');
} catch (err) {
  const text = await err?.response?.text?.();
  console.error("Error al enviar solicitud:", text || err.message);
}

          }}
        >
          Agregar amigo
        </button>
      );
    }
    return null;
  };

  return (
    <NavbarLayout>
      {profile && (
        <>
          {/* Fondo de perfil */}
          <div className="position-relative" style={{
            height: '300px',
            backgroundImage: `url('${profile.banner_url || defaultBanner}?t=${imageRefreshKey}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="position-absolute start-0 bottom-0 ms-4 mb-4 d-flex align-items-end">
              <img
                src={`${profile.avatar_url || defaultAvatar}?t=${imageRefreshKey}`}
                alt="Avatar"
                className="rounded"
                style={{ width: '96px', height: '96px', border: '4px solid white' }}
              />
              <div
                className="ms-3 text-white px-3 py-2 rounded shadow"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)'
                }}
              >
                <h4 className="mb-0 fw-bold">{username}</h4>
                {isOwnProfile ? (
                  <button className="btn btn-outline-light btn-sm mt-1" onClick={() => setShowEditModal(true)}>
                    Editar perfil
                  </button>
                ) : renderFriendButton()}
              </div>
            </div>
          </div>

          <div className="pt-10">
            <ProfileSubnav user={profile} activeTab={activeTab || 'games'} onTabChange={handleTabChange} />
          </div>

          <Outlet />

          <EditProfileModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            profile={profile}
            onSave={handleProfileUpdated}
          />

          <Toast
            show={showToast}
            onClose={() => setShowToast(false)}
            delay={3000}
            autohide
            className="position-fixed bottom-0 end-0 m-4 bg-success text-white"
          >
            <Toast.Body>✅ Perfil actualizado exitosamente</Toast.Body>
          </Toast>
        </>
      )}
    </NavbarLayout>
  );
}
