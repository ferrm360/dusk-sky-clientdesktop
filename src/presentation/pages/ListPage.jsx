import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import NavbarLayout from '../components/NavbarLayout';
import { getMostRecentGameLists, getGameListItems } from '@business/gamelistService';
import { getUserById as getUserFromAuthService } from '@business/authService';
import { getUserById as getUserFromManagerService } from '@business/userManagerService';
import { getGameById } from '@business/gameService';

export default function ListPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 
  

  const fetchCreatorInfo = async (userId) => {
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

  const fetchGameCover = async (gameId) => {
      try {
        const gameDetails = await getGameById(gameId);
        return gameDetails.headerUrl || 'https://via.placeholder.com/60x90?text=Game';
      } catch (e) {
        console.warn(`Could not fetch game details for ID ${gameId}:`, e);
        return 'https://via.placeholder.com/60x90?text=Game';
      }
  };


  useEffect(() => {
    const fetchAndEnrichLists = async () => {
      setLoading(true);
      setError(null);
      try {
        const recentLists = await getMostRecentGameLists(); 

        const enrichedLists = await Promise.all(
          recentLists.map(async (list) => {
            const creatorInfo = await fetchCreatorInfo(list.userId);

            const listItems = await getGameListItems(list.id);
            
            const gameImages = await Promise.all(
              listItems.filter(item => item.gameId).slice(0, 4).map(item => fetchGameCover(item.gameId))
            );

            return {
              ...list,
              creatorUsername: creatorInfo.username,
              creatorAvatar: creatorInfo.avatar,
              itemCount: listItems.length,
              gameCoverImages: gameImages,
            };
          })
        );
        setLists(enrichedLists);
      } catch (err) {
        console.error('Error fetching game lists:', err);
        setError('No se pudieron cargar las listas de juegos. Inténtalo de nuevo más tarde.');
        setLists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndEnrichLists();
  }, []);

  const handleCreateOwnList = () => {
     navigate('/lists/new');

  };

  const handleViewListDetails = (listId) => {
    navigate(`/lists/${listId}`);
  };

  return (
    <NavbarLayout>
      <div className="container py-4">
        <div className="text-center mb-5 p-4 bg-light rounded-3 shadow-sm">
          <h2 className="fw-bold text-dark mb-3">Colecciona, organiza y comparte.</h2>
          <p className="lead text-muted mb-4">Las listas son la forma perfecta de agrupar tus juegos favoritos.</p>
          <button className="btn btn-primary btn-lg rounded-pill px-5" onClick={handleCreateOwnList}>
            Empieza tu propia lista
          </button>
        </div>

        <h4 className="mb-4 fw-bold text-primary border-bottom pb-2">Listas Populares Recientes</h4>

        {loading && (
          <p className="text-center text-muted py-5">
            <span className="spinner-border text-primary me-2" role="status" aria-hidden="true"></span>
            Cargando listas...
          </p>
        )}

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && lists.length === 0 && (
          <p className="text-center text-muted py-5">No hay listas para mostrar en este momento.</p>
        )}

        {!loading && !error && lists.length > 0 && (
          <div className="row g-4">
            {lists.map((list) => (
              <div key={list.id} className="col-12 col-md-6 col-lg-4">
                {/* AÑADIDO: onClick al div de la tarjeta */}
                <div className="card h-100 shadow-sm border-0 list-card" style={{ cursor: 'pointer' }} onClick={() => handleViewListDetails(list.id)}>
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex mb-3 gap-2 justify-content-center flex-wrap">
                      {list.gameCoverImages.length > 0 ? (
                        list.gameCoverImages.map((imgUrl, i) => (
                          <img 
                            key={i} 
                            src={imgUrl} 
                            alt={`Portada de juego ${list.name}`}
                            className="list-game-cover" 
                            style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} 
                          />
                        ))
                      ) : (
                        <div className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-3" style={{ width: 60, height: 90 }}>
                          <i className="bi bi-controller" style={{ fontSize: '2rem' }}></i>
                        </div>
                      )}
                    </div>
                    <h5 className="mt-2 mb-1 fw-bold text-dark text-truncate" title={list.name}>{list.name}</h5>
                    <p className="mb-2 text-muted small flex-grow-1">{list.description}</p>
                    
                    <div className="d-flex align-items-center mt-auto pt-2 border-top">
                      <img 
                        src={list.creatorAvatar} 
                        alt={list.creatorUsername} 
                        className="rounded-circle me-2 border" 
                        style={{ width: 24, height: 24, objectFit: 'cover' }} 
                      />
                      <small className="text-secondary">
                        por <span className="fw-semibold text-dark">{list.creatorUsername}</span> · {list.itemCount} juegos ·
                      </small>
                      <small className="ms-auto text-primary fw-bold">
                        <i className="bi bi-heart-fill me-1"></i> {list.likes}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        body {
          background-color: #f8f9fa;
        }
        .container {
          max-width: 1200px;
        }
        .text-primary { color: #0d6efd !important; }
        .text-dark { color: #212529 !important; }
        .text-muted { color: #6c757d !important; }
        .bg-light { background-color: #f8f9fa !important; }

        .list-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .list-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15) !important;
        }

        .list-game-cover {
          border: 1px solid rgba(0,0,0,0.1);
        }
      `}</style>
    </NavbarLayout>
  );
}