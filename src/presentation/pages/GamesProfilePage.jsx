import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getTrackingsByUser } from '@business/gameTrackingService';
import { getGameById } from '@business/gameService';
import { getUserById } from '@business/userManagerService';
import UserSessionManager from '@business/UserSessionManager';

const STATUS_LABELS = {
  played: 'Tus juegos jugados',
  playing: 'Jugando actualmente',
  backlog: 'Tus juegos en backlog',
  abandoned: 'Juegos que abandonaste',
};

const WATCHLIST_STATUSES = ['playing', 'backlog', 'abandoned', 'played'];

export default function GameProfilePage() {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('played');
  const [username, setUsername] = useState('');
  
  const payload = UserSessionManager.getPayload();
  const loggedUserId = payload?._id;
  const realId = userId === 'me' ? loggedUserId : userId;

 const tab = useMemo(() => {
  const segments = location.pathname.split('/');
  const last = segments[segments.length - 1];
  if (['watchlist', 'likes', 'reviews', 'lists'].includes(last)) {
    return last;
  }
  return 'games';
}, [location.pathname]);


  const handleClick = (title) => {
    navigate(`/juegos/${encodeURIComponent(title)}`);
  };

  useEffect(() => {
    if (!realId) return;

    const load = async () => {
      try {
        const [trackings, user] = await Promise.all([
          getTrackingsByUser(realId),
          getUserById(realId)
        ]);
        setUsername(user?.username || '');

        const enriched = await Promise.all(
          trackings.map(async t => {
            const game = await getGameById(t.gameId);
            return {
              gameTitle: game.name,
              gameImage: game.headerUrl,
              rating: t.rating || 0,
              liked: t.liked,
              hasReview: !!t.review,
              status: t.status,
            };
          })
        );

        let filtered = [];
        if (tab === 'games') {
          filtered = enriched.filter(g => g.status === selectedStatus);
        } else if (tab === 'watchlist') {
          filtered = enriched.filter(g => WATCHLIST_STATUSES.includes(g.status));
        } else if (tab === 'likes') {
          filtered = enriched.filter(g => g.liked);
        } else if (tab === 'reviews') {
          filtered = enriched.filter(g => g.hasReview);
        }

        setGames(filtered);
      } catch (err) {
        console.error('Error loading games:', err);
      }
    };

    load();
  }, [realId, tab, selectedStatus]);

  return (
    <div className="container py-4">
      <h4 className="text-dark mb-4">
        {tab === 'games' && `${STATUS_LABELS[selectedStatus]}${username ? ` (${username})` : ''}`}
        {tab === 'watchlist' && `Lista de seguimiento${username ? ` (${username})` : ''}`}
        {tab === 'likes' && `Juegos favoritos${username ? ` (${username})` : ''}`}
        {tab === 'reviews' && `Juegos con reseña${username ? ` (${username})` : ''}`}
      </h4>

      {tab === 'games' && (
        <div className="mb-4 d-flex gap-3 flex-wrap">
          {Object.keys(STATUS_LABELS).map(status => (
            <div key={status} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="statusFilter"
                id={`radio-${status}`}
                value={status}
                checked={selectedStatus === status}
                onChange={() => setSelectedStatus(status)}
              />
              <label className="form-check-label" htmlFor={`radio-${status}`}>
                {STATUS_LABELS[status]}
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="row g-4">
        {games.length > 0 ? (
          games.map((game, i) => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={i}>
              <div
                className="card border-0 shadow-sm bg-light text-dark"
                onClick={() => handleClick(game.gameTitle)}
                style={{ cursor: 'pointer' }}
              >
                <img src={game.gameImage} alt={game.gameTitle} className="card-img-top" />
                <div className="card-body p-2">
                  <p className="mb-1 fw-semibold text-truncate">{game.gameTitle}</p>
                  <small className="text-warning">⭐ {game.rating.toFixed(1)}</small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">
            {tab === 'games'
              ? 'No hay juegos con ese estado.'
              : 'No hay juegos en esta sección.'}
          </p>
        )}
      </div>
    </div>
  );
}
