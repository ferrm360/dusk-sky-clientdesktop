import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import { searchGameByName } from '@business/gameService';
import { getRecentReviewsByGame, getFriendsReviewsByGame } from '@business/reviewService';
import UserSessionManager from '@business/UserSessionManager';
import { getUserById as getUserFromAuthService } from '@business/authService';
import { getUserById as getUserFromManagerService } from '@business/UserManagerService';
import ReviewLogModal from '../components/ReviewLogModal';

export default function GameDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [friendsReviews, setFriendsReviews] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        const allGames = await searchGameByName(decodeURIComponent(name));
        const found = allGames.find(g => g.name.toLowerCase() === decodeURIComponent(name).toLowerCase());
        if (!found) throw new Error('No se encontró el juego');

        setGame(found);

        const recentReviews = await getRecentReviewsByGame(found.id);
        setReviews(await addUserDataToReviews(recentReviews));

        const payload = UserSessionManager.getPayload();
        if (payload?.friends?.length > 0) {
          const friendRes = await getFriendsReviewsByGame(found.id, payload.friends);
          setFriendsReviews(await addUserDataToReviews(friendRes));
        }
      } catch (err) {
        console.error('Error loading game details:', err);
        setError(true);
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, [name]);

  const addUserDataToReviews = async (reviewsArray) => { 
    const updatedReviews = await Promise.all(
      reviewsArray.map(async (review) => {
        const userData = await getUserData(review.userId);
        return {
          ...review,
          username: userData.username,
          userAvatar: userData.userAvatar,
        };
      })
    );
    return updatedReviews;
  };

  const getUserData = async (userId) => {
    try {
      const userFromAuthService = await getUserFromAuthService(userId);
      const userFromManagerService = await getUserFromManagerService(userId);
      return {
        username: userFromAuthService.username, 
        userAvatar: userFromManagerService.avatar_url || 'assets/default_avatar.jpg',
      };
    } catch (err) {
      console.error('Error fetching user data:', err);
      return { username: 'Unknown', userAvatar: 'assets/default_avatar.jpg' };
    }
  };

  const handleReviewClick = (review) => {
        const reviewIdToPass = review.id; 

    navigate(`/game/${game.id}/review/${reviewIdToPass}`, {
      state: {
        reviewId: reviewIdToPass,
        reviewContent: review.content,
        gameId: game.id,
        reviewRating: review.rating,
        userId: review.userId
      }
    });
  };

  // Helper function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
          style={{ fontSize: '1rem' }}
        ></i>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <NavbarLayout>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </NavbarLayout>
    );
  }

  if (error || !game) { 
    return (
      <NavbarLayout>
        <div className="container text-center py-5">
          <h3 className="text-danger">No se pudo cargar el juego</h3>
          <p>Es posible que el juego no exista o haya ocurrido un error al obtener la información.</p>
        </div>
      </NavbarLayout>
    );
  }

  return (
    <NavbarLayout>
      <div className="bg-white text-dark min-vh-100 pb-5">
        {/* Banner Section */}
        <div className="position-relative" style={{ height: '450px', overflow: 'hidden' }}>
          <img
            src={game.randomScreenshot || game.headerUrl || 'https://via.placeholder.com/1920x450?text=Game+Banner'}
            className="w-100 h-100"
            style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
            alt="Game Banner"
          />
          <div
            className="position-absolute w-100 h-100 d-flex align-items-end p-5"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
              top: 0,
              left: 0,
            }}
          >
            <div className="container">
              <h1 className="display-4 fw-bold text-white text-shadow">{game.name}</h1>
              <p className="lead text-white-75 text-shadow">Descubre este juego y lo que la comunidad piensa.</p>
            </div>
          </div>
        </div>

        <div className="container mt-n5 position-relative z-index-1"> 
          <div className="row">
            <div className="col-lg-3 col-md-4 mb-4">
              <div className="card shadow-lg border-0 rounded-4 p-3 bg-white">
                <img
                  src={game.headerUrl || 'https://via.placeholder.com/300x400?text=Game+Cover'}
                  className="w-100 rounded-3 shadow-sm mb-3"
                  style={{ maxHeight: 380, objectFit: 'cover' }}
                  alt={game.name}
                />
                <h5 className="text-dark fw-bold mb-2">{game.name}</h5>
                <div className="small text-muted mb-3">
                  <strong>Géneros:</strong> {game.genres?.join(', ') || 'N/A'}<br />
                  <strong>Desarrollado por:</strong> {game.developer || 'N/A'}<br />
                  <strong>Publicado por:</strong> {game.publisher || 'N/A'}
                </div>
          
              </div>
            </div>

            <div className="col-lg-6 col-md-8 mb-4">
              <div className="card shadow-lg border-0 rounded-4 p-4 bg-white mb-4">
                <h4 className="text-primary mb-3">Descripción</h4>
                <p className="text-dark-75" style={{ whiteSpace: 'pre-wrap' }}>
                  {game.description || 'No hay descripción disponible para este juego.'}
                </p>
              </div>

              {friendsReviews.length > 0 && (
                <div className="card shadow-lg border-0 rounded-4 p-4 mb-4">
                  <h4 className="text-primary mb-3">Reseñas de tus amigos</h4>
                  {friendsReviews.map(r => (
                    <div
                      key={r.id} 
                      className="review-card p-3 mb-3 rounded-3"
                      onClick={() => handleReviewClick(r)}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <img
                          src={r.userAvatar || 'assets/default_avatar.jpg'}
                          alt={r.username}
                          className="rounded-circle border border-secondary me-3"
                          style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                        />
                        <div>
                          <h6 className="mb-0 text-dark fw-bold">{r.username}</h6>
                          <div className="small text-muted">{new Date(r.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="ms-auto">
                          {renderStars(r.rating)} <span className="text-warning fw-bold ms-1">{r.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-dark-75 mb-1 review-content-preview">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="card shadow-lg border-0 rounded-4 p-4">
                <h4 className="text-primary mb-3">Reseñas recientes</h4>
                {reviews.length > 0 ? (
                  reviews.map(r => (
                    <div
                      key={r.id} 
                      className="review-card p-3 mb-3 rounded-3"
                      onClick={() => handleReviewClick(r)}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <img
                          src={r.userAvatar || 'assets/default_avatar.jpg'}
                          alt={r.username}
                          className="rounded-circle border border-secondary me-3"
                          style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                        />
                        <div>
                          <h6 className="mb-0 text-dark fw-bold">{r.username}</h6>
                          <div className="small text-muted">{new Date(r.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="ms-auto">
                          {renderStars(r.rating)} <span className="text-warning fw-bold ms-1">{r.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-dark-75 mb-1 review-content-preview">{r.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted fst-italic">No hay reseñas recientes para este juego.</p>
                )}
              </div>
            </div>

            <div className="col-lg-3 col-md-12 mb-4 mt-lg-0 mt-4"> 
              <div className="card shadow-lg border-0 rounded-4 p-3 bg-white text-center sticky-top" style={{ top: '80px' }}> {/* sticky-top to keep it visible on scroll */}
                <div className="d-flex justify-content-around mb-3 border-bottom pb-3">
                  <span role="button" className="action-icon text-primary">
                    <i className="bi bi-eye-fill"></i> Watched
                  </span>
                  <span role="button" className="action-icon text-danger">
                    <i className="bi bi-heart-fill"></i> Like
                  </span>
                  <span role="button" className="action-icon text-info">
                    <i className="bi bi-bookmark-fill"></i> Wishlist
                  </span>
                </div>
                <button className="btn btn-outline-dark w-100 mb-2 rounded-pill">Show your activity</button>
                <button className="btn btn-primary w-100 mb-2 rounded-pill" onClick={() => setShowModal(true)}>
                  Review or log...
                </button>
                <ReviewLogModal
                  show={showModal}
                  onClose={() => setShowModal(false)}
                  game={game}
                  onSave={({ review, tracking }) => {
                  
                    setShowModal(false); 
                  }}
                />
                <button className="btn btn-outline-dark w-100 mb-2 rounded-pill">Add to list…</button>
                <button className="btn btn-outline-dark w-100 rounded-pill">Share</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .text-dark-75 {
          color: rgba(0, 0, 0, 0.75) !important;
        }
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
        }
        .review-card {
          border: 1px solid #e0e0e0; /* Light border for separation */
          background-color: #f8f9fa; /* Slightly off-white for contrast */
          transition: all 0.2s ease-in-out; /* Smooth transition for hover */
          cursor: pointer; /* Pointer cursor for clickability */
        }
        .review-card:hover {
          background-color: #e9ecef; /* Lighter background on hover */
          transform: translateY(-2px); /* Slight lift effect */
          box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* Subtle shadow on hover */
        }
        .review-content-preview {
            display: -webkit-box;
            -webkit-line-clamp: 3; /* Limit to 3 lines */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .action-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.9em;
          color: #6c757d; /* Default muted color for action icons */
          transition: color 0.2s ease-in-out;
        }
        .action-icon:hover {
          color: #0d6efd !important; /* Primary color on hover for actions */
        }
        .action-icon i {
          font-size: 1.5em; /* Larger icon size */
          margin-bottom: 5px;
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
          background-color: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #999;
        }
      `}</style>
    </NavbarLayout>
  );
}