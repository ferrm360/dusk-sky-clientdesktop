import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import { getGameById } from '@business/gameService';
import { getUserById as getUserFromAuthService } from '@business/authService'; 
import { getUserById as getUserFromManagerService } from '@business/UserManagerService';
import { addComment, getCommentsByReview } from '@business/commentService';
import UserSessionManager from '@business/UserSessionManager';

import ReportModal from '../components/ReportModal';
import { ReportContentType } from '@business/moderationService';

export default function ReviewDetailsPage() {
  const { gameId, reviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [reviewAuthor, setReviewAuthor] = useState(null);
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [showReportModal, setShowReportModal] = useState(false);

  const { reviewContent, reviewRating, userId: reviewAuthorId } = location.state || {};

   useEffect(() => {
    
  }, [reviewId, reviewContent, reviewRating, reviewAuthorId, location.state]);

  const currentUserId = UserSessionManager.getPayload()?.sub || UserSessionManager.getPayload()?._id;
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);



  const fetchAndEnrichComments = useCallback(async () => {
    try {
      const fetchedComments = await getCommentsByReview(reviewId);
      const enrichedComments = await Promise.all(
        fetchedComments.map(async (comm) => {
          let authorIdForLookup = comm.authorId;

          let username = 'Usuario Desconocido';
          let userAvatar = 'assets/default_avatar.jpg';

          if (authorIdForLookup && authorIdForLookup.trim() !== "") {
            try {
              const authUser = await getUserFromAuthService(authorIdForLookup); 
              const managerUser = await getUserFromManagerService(authorIdForLookup); 
              username = authUser?.username || username;
              userAvatar = managerUser?.avatar_url || userAvatar;
            } catch (fetchErr) {
              console.warn(`No se pudo obtener datos para el ID de comentario '${authorIdForLookup}':`, fetchErr);
              username = `Usuario Desconocido (${authorIdForLookup.substring(0,8)}...)`; 
            }
          }

          return {
            ...comm,
            username: username,
            userAvatar: userAvatar,
            id: comm._id || comm.id,
            createdAt: comm.date ? new Date(comm.date).toISOString() : new Date().toISOString(),
            content: comm.text
          };
        })
      );
      setComments(enrichedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [reviewId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const gameDetails = await getGameById(gameId);
        setGame(gameDetails);

        let displayReviewAuthorUsername = 'Usuario Desconocido';
        let displayReviewAuthorAvatar = 'assets/default_avatar.jpg';
        
        if (reviewAuthorId) {
            try {
                const authorFromAuthService = await getUserFromAuthService(reviewAuthorId);
                const authorFromManagerService = await getUserFromManagerService(reviewAuthorId);
                displayReviewAuthorUsername = authorFromAuthService?.username || displayReviewAuthorUsername;
                displayReviewAuthorAvatar = authorFromManagerService?.avatar_url || displayReviewAuthorAvatar;
            } catch (err) {
                console.warn(`No se pudo obtener datos para el autor de la reseña ID ${reviewAuthorId}:`, err);
            }
        }

        setReviewAuthor({
          username: displayReviewAuthorUsername,
          userAvatar: displayReviewAuthorAvatar,
          actualId: reviewAuthorId
        });

        setReview({
          id: reviewId,
          content: reviewContent,
          rating: reviewRating,
          userAvatar: displayReviewAuthorAvatar,
          username: displayReviewAuthorUsername,
          userId: reviewAuthorId,
          createdAt: location.state?.reviewCreatedAt || new Date().toISOString(),
        });

        await fetchAndEnrichComments();

        if (currentUserId) {
          const currentAuthUser = await getUserFromAuthService(currentUserId);
          const currentManagerUser = await getUserFromManagerService(currentUserId);
          setCurrentLoggedInUser({
            username: currentAuthUser?.username || 'Tú',
            userAvatar: currentManagerUser?.avatar_url || 'assets/default_avatar.jpg',
          });
        }

      } catch (err) {
        console.error('Error fetching data for ReviewDetailsPage:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameId, reviewId, reviewContent, reviewRating, reviewAuthorId, currentUserId, fetchAndEnrichComments, location.state]);

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) {
      setCommentError('El comentario no puede estar vacío.');
      return;
    }
    if (!currentUserId) {
      setCommentError('Debes iniciar sesión para comentar.');
      return;
    }

       if (!reviewId) {
      setCommentError('Error: No se pudo asociar el comentario a una reseña válida. Intenta recargar la página.');
      console.error("ERROR: reviewId es nulo o indefinido al intentar enviar un comentario.", { reviewIdFromParams: reviewId, gameIdFromParams: gameId });
      return;
    }

    setCommentLoading(true);
    setCommentError('');

    const newCommentData = {
      reviewId: reviewId,
      authorId: currentUserId,
      text: commentInput.trim(),
      date: new Date().toISOString(),
      status: "visible"
    };

    try {
      await addComment(newCommentData);
      setCommentInput('');
      await fetchAndEnrichComments();
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      setCommentError('Hubo un error al enviar tu comentario. Intenta de nuevo.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReport = () => {
    if (!currentUserId) {
      alert('Debes iniciar sesión para reportar contenido.');
      return;
    }
    // review.userId (el ID del autor de la reseña) ya es un ID real.
    // Quitamos la validación isUUID aquí también, asumiendo que siempre será un ID válido.
    if (!review?.userId) { 
      alert('No se pudo identificar el autor de la reseña para crear el reporte.');
      return;
    }

    setShowReportModal(true);
  };

  const handleGameRedirect = () => {
    if (game?.name) {
      navigate(`/juegos/${encodeURIComponent(game.name)}`);
    }
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

  if (error || !game || !review || !reviewAuthor) {
    return (
      <NavbarLayout>
        <div className="container text-center py-5 bg-white text-dark">
          <h3 className="text-danger">No se pudo cargar la reseña</h3>
          <p>Es posible que la reseña o el juego no exista, o haya ocurrido un error al obtener la información.</p>
        </div>
      </NavbarLayout>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
          style={{ fontSize: '1.2rem' }}
        ></i>
      );
    }
    return stars;
  };

  return (
    <NavbarLayout>
      <div className="bg-white text-dark min-vh-100">
        <div className="position-relative" style={{ height: '500px', overflow: 'hidden' }}>
          <img
            src={game.randomScreenshot || 'https://via.placeholder.com/1920x500?text=Game+Banner+Not+Available'}
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
              <h1 className="display-4 fw-bold text-white text-shadow" onClick={handleGameRedirect} style={{ cursor: 'pointer' }}>
                {game.name}
              </h1>
              <p className="lead text-white-75 text-shadow">
                Una reseña de la comunidad
              </p>
            </div>
          </div>
        </div>

        <div className="container py-5">
          <div className="row">
            <div className="col-lg-4 col-md-5 mb-4">
              <div className="card bg-light shadow-lg border-0 rounded-4 p-3">
                <img
                  src={game.headerUrl || 'https://via.placeholder.com/300x400?text=Game+Image+Not+Available'}
                  className="w-100 rounded-3 shadow-sm mb-3"
                  style={{ maxHeight: '400px', objectFit: 'cover', cursor: 'pointer' }}
                  alt={game.name}
                  onClick={handleGameRedirect}
                />
                <h5 className="text-dark mb-2">{game.name}</h5>
                <div className="small text-muted">
                  <strong>Géneros:</strong> {game.genres?.join(', ') || 'N/A'}<br />
                  <strong>Desarrollado por:</strong> {game.developer || 'N/A'}<br />
                  <strong>Publicado por:</strong> {game.publisher || 'N/A'}
                </div>
                <button
                  className="btn btn-outline-primary mt-3 w-100 rounded-pill"
                  onClick={handleGameRedirect}
                >
                  Ver Detalles del Juego
                </button>
              </div>
            </div>

            <div className="col-lg-8 col-md-7">
              <div className="card bg-white shadow-lg border-0 rounded-4 p-4 mb-4">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={review.userAvatar || 'assets/default_avatar.jpg'}
                    alt={review.username}
                    className="rounded-circle border border-primary me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="text-dark mb-0">{review.username}</h5>
                    <div className="text-muted small">
                      Publicado el {new Date(review.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="me-2">{renderStars(review.rating)}</span>
                  <span className="text-warning fw-bold">{review.rating}/5</span>
                </div>

                <p className="text-dark lead" style={{ whiteSpace: 'pre-wrap' }}>{review.content}</p>

                <div className="text-end mt-3">
                  <button className="btn btn-sm btn-outline-danger" onClick={handleReport}>
                    <i className="bi bi-flag-fill me-1"></i> Reportar Reseña
                  </button>
                </div>
              </div>

              <div className="card bg-white shadow-lg border-0 rounded-4 p-4">
                <h5 className="text-dark mb-3">Deja un Comentario:</h5>
                {currentLoggedInUser ? (
                  <>
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={currentLoggedInUser.userAvatar}
                        alt={currentLoggedInUser.username}
                        className="rounded-circle me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <span className="fw-bold text-dark">{currentLoggedInUser.username}</span>
                    </div>
                    <textarea
                      className="form-control bg-light text-dark border-secondary mb-3"
                      rows="4"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Escribe tu comentario aquí..."
                      style={{ resize: 'vertical' }}
                      disabled={commentLoading}
                    />
                    {commentError && <div className="text-danger small mb-2">{commentError}</div>}
                    <button
                      className="btn btn-primary rounded-pill w-auto px-4"
                      onClick={handleCommentSubmit}
                      disabled={commentLoading}
                    >
                      {commentLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Comentario'
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-muted fst-italic text-center py-3">
                    Inicia sesión para dejar un comentario.
                  </div>
                )}

                <div className="mt-4 border-top border-light pt-4">
                  <h6 className="text-dark-75 mb-3">Comentarios ({comments.length})</h6>
                  {comments.length > 0 ? (
                    comments.map(comm => (
                      <div key={comm._id || comm.id} className="d-flex mb-3 comment-item">
                        <img
                          src={comm.userAvatar || 'assets/default_avatar.jpg'}
                          alt={comm.username}
                          className="rounded-circle me-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="d-flex align-items-baseline mb-1">
                            <strong className="text-dark me-2">{comm.username}</strong>
                            <small className="text-muted">{new Date(comm.createdAt).toLocaleString()}</small>
                          </div>
                          <p className="text-dark-75 mb-0">{comm.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted fst-italic">Sé el primero en comentar esta reseña.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {review && review.userId && ( 
          <ReportModal
            show={showReportModal}
            onClose={() => setShowReportModal(false)}
            reportedContentId={review.id}
            contentType={ReportContentType.REVIEW}
            reportedUsername={review.username}
            reportedAuthorId={review.userId} 
            onReportSuccess={() => {
              console.log('Reseña reportada con éxito.');
              setShowReportModal(false);
            }}
          />
        )}

        <style>{`
          .bg-light { background-color: #f8f9fa !important; }
          .text-white-75 { color: rgba(255, 255, 255, 0.75) !important; }
          .text-dark-75 { color: rgba(0, 0, 0, 0.75) !important; }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); }
          ::-webkit-scrollbar { width: 8px; background-color: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background-color: #888; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background-color: #555; }
          .comment-item { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px !important; }
          .comment-item:last-child { border-bottom: none; margin-bottom: 0 !important; padding-bottom: 0; }
        `}</style>
      </div>
    </NavbarLayout>
  );
}