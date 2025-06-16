import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import UserSessionManager from '@business/UserSessionManager';
import { fetchHomeData } from '@business/homeDataService';

import '../index.css'; 

export default function HomePage() {
  const [hasFriends, setHasFriends] = useState(false);
  const [popularGames, setPopularGames] = useState([]);
  const [friendReviews, setFriendReviews] = useState([]);
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('Usuario');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const payload = UserSessionManager.getPayload();
    setRole(payload?.role || '');
    setUsername(payload?.username || 'Usuario');

    const fetchData = async () => {
      setLoading(true); 
      setError(false); 
      try {
        const { hasFriends, reviews, games } = await fetchHomeData(payload._id);

        setHasFriends(hasFriends);
        setPopularGames(games);
        setFriendReviews(reviews); 
      } catch (err) {
        console.error("Error cargando datos de inicio:", err);
        setError(true); 
        setPopularGames([]); 
        setFriendReviews([]); 
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

  const handleGameClick = (game) => {
    navigate(`/juegos/${encodeURIComponent(game.name)}`);
  };

  const handleReviewClick = (review) => {
    navigate(`/game/${review.gameId}/review/${review.id}`, {
      state: {
        reviewId: review.id,
        reviewContent: review.content,
        gameId: review.gameId, 
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
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </NavbarLayout>
    );
  }

  if (error) {
    return (
      <NavbarLayout>
        <div className="container text-center py-5 bg-white text-dark">
          <h3 className="text-danger">Error al cargar la página de inicio</h3>
          <p>Lo sentimos, no pudimos cargar la información. Por favor, inténtalo de nuevo más tarde.</p>
        </div>
      </NavbarLayout>
    );
  }

  return (
    <NavbarLayout>
      <div className="bg-white text-dark min-vh-100">
        {/* Hero Section */}
        <div className="position-relative d-flex align-items-center justify-content-center"
          style={{
            height: '85vh',
            backgroundImage: "url('assets/kara-no-shoujo-bg.png')", // Usar imagen de fondo
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginBottom: '-5px',
          }}>
          {/* Overlay para mejor contraste del texto */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1 }}
          ></div>
          <div className="position-relative text-center text-white" style={{ zIndex: 2, textShadow: '0 0 8px rgba(0,0,0,0.7)' }}>
            <h1 className="fw-bold display-4">Bienvenido de nuevo, {username}.</h1>
            <p className="lead text-light">
              {hasFriends
                ? 'Esto es lo que tus amigos están jugando y reseñando últimamente...'
                : 'Descubre tu próximo juego favorito y lo que la comunidad piensa.'}
            </p>
          </div>
        </div>

        <div className="container pt-5 pb-5"> 
          <section className="mb-5">
            <h4 className="text-primary fw-bold mb-4">Juegos Populares en Dusk Sky</h4>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {popularGames.length > 0 ? (
                popularGames.map((game, i) => (
                  <div key={game.id || i} className="col">
                    <div
                      className="card h-100 border-0 shadow rounded-3 game-card-clickable" // New class for hover effect
                      onClick={() => handleGameClick(game)}
                    >
                      <img
                        src={game.imageUrl || '/assets/game_placeholder.png'}
                        alt={game.name}
                        className="card-img-top rounded-top-3"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body d-flex flex-column justify-content-between p-3">
                        <h5 className="card-title text-dark mb-1 text-center">{game.name}</h5>
                        {/* Optional: Add game rating here if available */}
                        {/* <div className="text-center">
                            {renderStars(game.averageRating)}
                        </div> */}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12"><p className="text-muted fst-italic">No hay juegos populares para mostrar en este momento.</p></div>
              )}
            </div>
          </section>

          {/* Friends Activity / Popular Reviews Section */}
          <section className="mt-5 pt-4 border-top">
            <h4 className="text-primary fw-bold mb-4">
              {hasFriends ? 'Actividad y Reseñas de tus Amigos' : 'Reseñas Destacadas de la Comunidad'}
            </h4>
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {friendReviews.length > 0 ? (
                friendReviews.map((review, i) => (
                  <div key={review.id || i} className="col"> {/* Use _id for review key */}
                    <div
                      className="card h-100 border-0 shadow rounded-3 review-card-clickable" // New class for hover effect
                      onClick={() => handleReviewClick(review)}
                    >
                      <div className="row g-0">
                        <div className="col-4">
                          <img
                            src={review.gameImage || '/assets/game_placeholder.png'}
                            className="img-fluid rounded-start-3 h-100" // Ensure height takes full space
                            style={{ objectFit: 'cover' }}
                            alt={review.gameTitle}
                          />
                        </div>
                        <div className="col-8">
                          <div className="card-body d-flex flex-column h-100 py-3 pe-3"> {/* Added padding */}
                            <div className="d-flex align-items-center mb-2">
                              <img src={review.avatar || 'assets/default_avatar.jpg'} alt="avatar" className="rounded-circle border border-secondary me-2" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                              <div>
                                <h6 className="mb-0 fw-bold text-dark">{review.username}</h6>
                                <small className="text-muted">{review.gameTitle}</small>
                              </div>
                            </div>
                            <p className="card-text text-dark-75 review-content-preview mb-auto">
                               {review.content}
                            </p>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <div className="d-flex align-items-center">
                                {renderStars(review.rating)}
                                <small className="text-warning fw-bold ms-1">{review.rating}/5</small>
                              </div>
                              <small className="text-muted">
                                {new Date(review.createdAt).toLocaleDateString()} {/* Display only date */}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <p className="text-muted fst-italic">
                    {hasFriends
                      ? 'Tus amigos aún no han compartido reseñas. ¡Anímalos a hacerlo!'
                      : 'No hay reseñas destacadas para mostrar en este momento.'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {(role === 'moderator' || role === 'admin') && (
            <section className="mt-5 pt-4 border-top text-center">
              <h4 className="text-primary mb-3">Acceso Rápido</h4>
              <p className="text-muted">
                Como {role === 'admin' ? 'Administrador' : 'Moderador'}, tienes acceso a herramientas especiales.
              </p>
              <button
                className="btn btn-primary rounded-pill px-4"
                onClick={() => navigate(role === 'admin' ? '/admin' : '/moderator')}
              >
                Ir al Panel de {role === 'admin' ? 'Administración' : 'Moderación'}
              </button>
            </section>
          )}
        </div>
      </div>

      <style>{`
        .text-dark-75 {
          color: rgba(0, 0, 0, 0.75) !important;
        }
        .text-shadow {
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.7);
        }

        /* Styles for clickable game cards */
        .game-card-clickable {
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .game-card-clickable:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
        }

        /* Styles for clickable review cards */
        .review-card-clickable {
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          border: 1px solid #e0e0e0 !important; /* Subtle border for definition */
        }
        .review-card-clickable:hover {
          background-color: #f8f9fa; /* Light background on hover */
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.1) !important;
        }

        .review-content-preview {
          display: -webkit-box;
          -webkit-line-clamp: 3; /* Limit to 3 lines */
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
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