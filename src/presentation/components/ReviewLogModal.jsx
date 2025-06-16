import React, { useState, useEffect } from 'react';
import UserSessionManager from '@business/UserSessionManager';
import { getLikedGameIds, createTracking } from '@business/gameTrackingService';
import { addReview } from '@business/reviewService';

export default function ReviewLogModal({ show, onClose, game }) {
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!show || !game?.id) return;

    const payload = UserSessionManager.getPayload();
    if (!payload || !payload._id) return;

    const userId = payload._id;

    getLikedGameIds(userId)
      .then((likedIds) => {
        if (likedIds.includes(game.id)) setLiked(true);
      })
      .catch(console.error);
  }, [show, game]);

  if (!show) return null;

  const handleStarClick = (val) => setRating(val);

  const handleSubmit = async () => {
    const payload = UserSessionManager.getPayload();
    if (!payload || !payload._id) {
      alert('Usuario no autenticado.');
      return;
    }

    const userId = payload._id;

    try {
      await Promise.all([
        addReview({
          userId,
          gameId: game.id,
          content,
          rating,
          createdAt: new Date(),
          likes: 0,
          likedBy: [],
        }),
        createTracking({
          userId,
          gameId: game.id,
          liked,
          status: 'played',
        })
      ]);
      onClose();
    } catch (error) {
      alert('Ocurrió un error al guardar tu reseña o seguimiento.');
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box bg-dark text-white">
        <div className="d-flex">
          <img
            src={game.headerUrl}
            alt={game.name}
            style={{ width: '140px', height: '210px', objectFit: 'cover', borderRadius: '6px', marginRight: '20px' }}
          />
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-3">
              {game.name}{' '}
              <span className="text-muted fs-6">{new Date(game.releaseDate).getFullYear()}</span>
            </h4>

            <div className="mb-3">
              <label className="form-label me-2">Watched on</label>
              <input
                type="date"
                value={watchedDate}
                className="form-control"
                style={{ maxWidth: '160px' }}
                onChange={(e) => setWatchedDate(e.target.value)}
              />
            </div>

            <textarea
              className="form-control mb-3"
              placeholder="Escribe una reseña..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="d-flex align-items-center mb-3">
              <div className="me-4">
                <label className="form-label">Rating</label>
                <div>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <span
                      key={val}
                      onClick={() => handleStarClick(val)}
                      style={{
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: val <= rating ? '#ffc107' : '#777',
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 ms-4">
                <button
                  onClick={() => setLiked(!liked)}
                  className="btn btn-outline-light"
                >
                  {liked ? '❤️ Liked' : '🤍 Like'}
                </button>
              </div>
            </div>

            <div className="text-end">
              <button className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
              <button className="btn btn-success" onClick={handleSubmit}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
