import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import NavbarLayout from '../components/NavbarLayout';
import UserSessionManager from '@business/UserSessionManager'; 
import { 
  getGameListById, 
  getGameListItems, 
  likeGameList, 
  unlikeGameList 
} from '@business/gamelistService';
import { getUserById as getUserFromAuthService } from '@business/authService';
import { getUserById as getUserFromManagerService } from '@business/userManagerService';
import { getGameById } from '@business/gameService';

export default function GameListPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [list, setList] = useState(null);
  const [listItems, setListItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false); 
  const [currentLikes, setCurrentLikes] = useState(0); 

  const currentUserId = UserSessionManager.getPayload()?.sub; 
  const fetchUserInfo = async (userId) => {
    let username = 'Usuario Desconocido';
    let avatar = 'https://via.placeholder.com/60/cccccc/ffffff?text=U';

    try {
      const authInfo = await getUserFromAuthService(userId);
      if (authInfo && authInfo.username) {
        username = authInfo.username;
      }
    } catch (e) {
      console.warn(`Could not fetch auth info for user ${userId}:`, e);
    }

    try {
      const managerInfo = await getUserFromManagerService(userId);
      if (managerInfo && managerInfo.avatar_url) {
        avatar = managerInfo.avatar_url;
      }
    } catch (e) {
      console.warn(`Could not fetch manager info for user ${userId}:`, e);
    }
    return { username, avatar };
  };

  const fetchGameDetails = async (gameId) => {
    try {
      const game = await getGameById(gameId);
      return {
        id: game.id,
        name: game.name || 'Juego Desconocido',
        coverImageUrl: game.headerUrl || 'https://via.placeholder.com/150x225?text=Game',
      };
    } catch (e) {
      console.error(`Error fetching game details for ID ${gameId}:`, e);
      return {
        id: gameId,
        name: 'Juego Desconocido',
        coverImageUrl: 'https://via.placeholder.com/150x225?text=Error',
      };
    }
  };

  useEffect(() => {
    const fetchListData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedList = await getGameListById(id);
        if (!fetchedList) {
          setError('Lista no encontrada.');
          setLoading(false);
          return;
        }
        setList(fetchedList);
        setCurrentLikes(fetchedList.likes); 

        const creatorInfo = await fetchUserInfo(fetchedList.userId);
        setList(prev => ({ ...prev, creatorUsername: creatorInfo.username, creatorAvatar: creatorInfo.avatar }));

        const items = await getGameListItems(id);

        const enrichedItems = await Promise.all(
          items.filter(item => item.gameId).map(async (item) => {
            const gameDetails = await fetchGameDetails(item.gameId);
            return {
              ...item,
              gameName: gameDetails.name,
              gameCoverImageUrl: gameDetails.coverImageUrl,
            };
          })
        );
        setListItems(enrichedItems);

        setIsLiked(currentUserId && fetchedList.userId !== currentUserId ? false : false);

      } catch (err) {
        console.error('Error loading game list:', err);
        setError('No se pudo cargar la lista de juegos. Es posible que no exista o que haya un problema con el servicio.');
      } finally {
        setLoading(false);
      }
    };

    fetchListData();
  }, [id, currentUserId]); 

  const handleLikeToggle = async () => {
    if (!list || !currentUserId) return;

    try {
      if (isLiked) {
        await unlikeGameList(list.id);
        setCurrentLikes(prev => prev - 1);
      } else {
        await likeGameList(list.id);
        setCurrentLikes(prev => prev + 1);
      }
      setIsLiked(prev => !prev);
    } catch (err) {
      console.error('Error toggling like:', err);
      alert(`No se pudo actualizar el "me gusta": ${err.message || 'Error desconocido'}`);
    }
  };

  const handleViewGameDetails = (gameName) => {
     const encodedGameName = encodeURIComponent(gameName);
    navigate(`/juegos/${encodedGameName}`); 
  };

  if (loading) {
    return (
      <NavbarLayout>
        <div className="container py-5 text-center text-muted">
          <span className="spinner-border text-primary me-2" role="status" aria-hidden="true"></span>
          Cargando detalles de la lista...
        </div>
      </NavbarLayout>
    );
  }

  if (error) {
    return (
      <NavbarLayout>
        <div className="container py-5">
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        </div>
      </NavbarLayout>
    );
  }

  if (!list) {
    return (
      <NavbarLayout>
        <div className="container py-5 text-center text-muted">
          <p>La lista de juegos solicitada no está disponible.</p>
        </div>
      </NavbarLayout>
    );
  }

  return (
    <NavbarLayout>
      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h1 className="text-primary fw-bold mb-1">{list.name}</h1>
            <p className="lead text-muted">{list.description}</p>
            <div className="d-flex align-items-center small text-secondary">
              <img 
                src={list.creatorAvatar} 
                alt={list.creatorUsername} 
                className="rounded-circle me-2 border" 
                style={{ width: 28, height: 28, objectFit: 'cover' }} 
              />
              <span>por <span className="fw-semibold text-dark">{list.creatorUsername}</span></span>
              <span className="ms-3">{listItems.length} juegos</span>
              <span className="ms-3">{new Date(list.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="mt-3 mt-md-0 d-flex flex-row align-items-center gap-3">
            <button 
              className={`btn btn-lg rounded-pill px-4 ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`} 
              onClick={handleLikeToggle}
              disabled={!currentUserId || list.userId === currentUserId} // Deshabilitar si no hay usuario o es el propio creador
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
              {isLiked ? 'Te gusta' : 'Me gusta'} ({currentLikes})
            </button>
            {list.userId === currentUserId && (
                <button className="btn btn-outline-secondary btn-lg rounded-circle">
                    <i className="bi bi-three-dots"></i>
                </button>
            )}
            
          </div>
        </div>

        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-3">
          {listItems.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              <i className="bi bi-info-circle me-2"></i> Esta lista aún no tiene juegos.
            </div>
          ) : (
            listItems.map((item) => (
              <div key={item.id} className="col">
                <div 
                  className="card h-100 border-0 shadow-sm game-item-card" 
                  onClick={() => handleViewGameDetails(item.gameName)} 
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={item.gameCoverImageUrl} 
                    className="card-img-top rounded-top" 
                    alt={item.gameName} 
                    style={{ height: 'auto', width: '100%', objectFit: 'cover', aspectRatio: '1/1.5' }} // Aspect ratio Letterboxd
                  />
                  <div className="card-body p-2 d-flex flex-column">
                    <h6 className="card-title fw-bold text-dark text-truncate mb-1" title={item.gameName}>{item.gameName}</h6>
                    {item.comment && <p className="card-text small text-muted text-truncate">{item.comment}</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        body {
          background-color: #f8f8f8; /* Un fondo ligeramente más claro para la página de detalle */
        }
        .container {
          max-width: 1200px;
        }
        .text-primary { color: #0d6efd !important; }
        .text-dark { color: #212529 !important; }
        .text-muted { color: #6c757d !important; }
        .bg-light { background-color: #f8f9fa !important; }

        .game-item-card {
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            border-radius: 0.5rem;
            overflow: hidden; /* Para que la imagen redondeada no se salga */
        }
        .game-item-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2) !important;
        }
        .game-item-card .card-img-top {
            width: 100%;
            height: auto;
        }
        .btn-outline-danger:hover {
          color: #fff !important;
          background-color: #dc3545 !important;
          border-color: #dc3545 !important;
        }
      `}</style>
    </NavbarLayout>
  );
}