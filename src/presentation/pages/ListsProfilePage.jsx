import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { getUserById as getUserFromManagerService } from '@business/userManagerService'; 
import UserSessionManager from '@business/UserSessionManager';
import { getListsByUser, getGameListItems } from '@business/gamelistService';
import { getGameById } from '@business/gameService';
import { getUserById as getUserFromAuthService } from '@business/authService'; 


export default function ListsProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate(); 

  const [profile, setProfile] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [errorLists, setErrorLists] = useState(null); 

  const payload = UserSessionManager.getPayload();
  const loggedUserId = payload?._id;
  const realId = userId === 'me' ? loggedUserId : userId;

  
  const fetchUsernameFromAuth = async (id) => {
    try {
      const authInfo = await getUserFromAuthService(id);
      return authInfo?.username || 'Usuario Desconocido';
    } catch (e) {
      console.warn(`Could not fetch username for ID ${id}:`, e);
      return 'Usuario Desconocido';
    }
  };

  const fetchGameCover = async (gameId) => {
    try {
      const gameDetails = await getGameById(gameId);
      // Asumiendo que gameDetails tiene una propiedad como 'headerUrl'
      return gameDetails.headerUrl || 'https://via.placeholder.com/150x225?text=Game';
    } catch (e) {
      console.warn(`Could not fetch game details for ID ${gameId}:`, e);
      return 'https://via.placeholder.com/150x225?text=Error'; // Placeholder en caso de error
    }
  };

  useEffect(() => {
    const fetchProfileAndLists = async () => {
      if (!realId) {
        setErrorLists('ID de usuario no disponible.');
        setLoadingLists(false);
        return;
      }

      setLoadingLists(true);
      setErrorLists(null);

      try {
        const userProfile = await getUserFromManagerService(realId);
        if (userProfile) {
            const usernameFromAuth = await fetchUsernameFromAuth(realId);
            setProfile({ ...userProfile, username: usernameFromAuth });
        } else {
            setProfile({ username: 'Usuario Desconocido', avatar_url: 'assets/default_avatar.jpg' });
        }
        

        const listsData = await getListsByUser(realId); // Llama a tu gamelistService
        
        const enrichedLists = await Promise.all(
          listsData.map(async (list) => {
            const listItems = await getGameListItems(list.id); 
            
            const gameImages = await Promise.all(
              listItems.filter(item => item.gameId).slice(0, 4).map(item => fetchGameCover(item.gameId))
            );

            return {
              ...list,
              itemCount: listItems.length,
              gameCoverImages: gameImages,
            };
          })
        );
        setUserLists(enrichedLists);

      } catch (err) {
        console.error('Error fetching user lists or profile:', err);
        setErrorLists('No se pudieron cargar las listas del usuario.');
        setUserLists([]); 
      } finally {
        setLoadingLists(false);
      }
    };

    fetchProfileAndLists();
  }, [realId]); 
  const handleViewListDetails = (listId) => {
    navigate(`/lists/${listId}`); 
  };

  if (!profile && loadingLists) {
    return (
      <div className="container mt-4 text-center text-muted">
        <span className="spinner-border text-primary me-2" role="status" aria-hidden="true"></span>
        Cargando perfil y listas...
      </div>
    );
  }

  if (errorLists) {
    return (
      <div className="container mt-4 alert alert-danger text-center" role="alert">
        {errorLists}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mt-4 text-center text-muted">
        <p>Perfil de usuario no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h5 className="text-primary mb-3">Listas de {profile.username || 'Usuario'}</h5>
      
      {loadingLists ? (
        <div className="text-center text-muted py-5">
          <span className="spinner-border text-primary me-2" role="status" aria-hidden="true"></span>
          Cargando listas del usuario...
        </div>
      ) : userLists.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>Este usuario aún no tiene listas de juegos.</p>
          {realId === loggedUserId && ( // Si es el propio usuario, mostrar opción para crear
            <button 
              className="btn btn-outline-primary rounded-pill px-4 mt-3"
              onClick={() => navigate('/lists/new')}
            >
              Crea tu primera lista
            </button>
          )}
        </div>
      ) : (
        <div className="d-flex gap-4 overflow-auto pb-3 custom-scrollbar"> {/* Clase para scrollbar */}
          {userLists.map((list) => (
            <div 
              key={list.id} 
              className="card shadow-sm border-0 bg-white text-dark list-profile-card" 
              style={{ minWidth: '260px', maxWidth: '260px', cursor: 'pointer' }}
              onClick={() => handleViewListDetails(list.id)}
            >
              {/* Contenedor de imágenes de portada */}
              <div className="d-flex flex-wrap justify-content-center p-3 pb-2 gap-1" style={{ backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
                {list.gameCoverImages.length > 0 ? (
                  list.gameCoverImages.map((imgUrl, i) => (
                    <img 
                      key={i} 
                      src={imgUrl} 
                      alt={`Portada ${list.name} ${i}`} 
                      style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} 
                      className="list-profile-game-cover"
                    />
                  ))
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-3" style={{ width: '100%', height: '120px' }}>
                    <i className="bi bi-controller" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
              </div>
              <div className="card-body p-3 d-flex flex-column">
                <h6 className="card-title fw-bold text-dark text-truncate mb-1" title={list.name}>{list.name}</h6>
                <p className="card-text text-muted small text-truncate mb-2">{list.description}</p>
                <div className="d-flex align-items-center mt-auto"> {/* Para empujar abajo */}
                  <span className="badge bg-primary me-2">{list.itemCount} juegos</span>
                  <small className="text-secondary ms-auto">
                    <i className="bi bi-heart-fill me-1"></i> {list.likes}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estilos CSS personalizados */}
      <style>{`
        .list-profile-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          border-radius: 0.75rem;
          overflow: hidden; /* Asegura que bordes redondeados funcionen bien */
        }
        .list-profile-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15) !important;
        }
        .custom-scrollbar {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: #888 #f1f1f1; /* Firefox */
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px; /* Altura del scrollbar horizontal */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; /* Color del track */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc; /* Color del thumb */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999; /* Color del thumb al pasar el ratón */
        }
      `}</style>
    </div>
  );
}