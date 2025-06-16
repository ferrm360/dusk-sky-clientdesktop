import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrackingsByUser, getLikedGameIds } from '@business/gameTrackingService';
import { getGameById } from '@business/gameService';
import { getUserById } from '@business/userManagerService';
import UserSessionManager from '@business/UserSessionManager';

export default function ActivityProfilePage() {
  const { userId } = useParams();
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const navigate = useNavigate();

  const payload = UserSessionManager.getPayload();
  const loggedUserId = payload?._id;
  const realId = userId === 'me' ? loggedUserId : userId;

  useEffect(() => {
    if (!realId) return;

    const loadRecent = async () => {
      const trackings = await getTrackingsByUser(realId);
      const sorted = trackings.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const recent = await Promise.all(sorted.slice(0, 5).map(async t => {
        const game = await getGameById(t.gameId);
        return { gameTitle: game.name, gameImage: game.headerUrl };
      }));
      setRecentGames(recent);
    };

    const loadFavs = async () => {
      const likedIds = await getLikedGameIds(realId);
      const liked = await Promise.all(likedIds.slice(0, 5).map(async id => {
        const game = await getGameById(id);
        return { gameTitle: game.name, gameImage: game.headerUrl };
      }));
      setFavoriteGames(liked);
    };

    loadRecent();
    loadFavs();
  }, [realId]);

  const handleGameClick = (name) => {
    navigate(`/juegos/${encodeURIComponent(name)}`);
  };

  const renderCard = (imgUrl, title = '', click) => (
    <div
      key={title}
      className="card border-0 shadow-sm game-card-hover"
      style={{ width: '180px', minHeight: '270px', cursor: 'pointer' }}
      onClick={click}
    >
      <img src={imgUrl} alt={title} className="card-img-top" style={{ objectFit: 'cover', height: '100%' }} />
    </div>
  );

return (
  <div className="container mt-4">
    <section className="mb-5">
      <h5 className="text-primary mb-3">Juegos favoritos</h5>
      <div className="d-flex gap-3 overflow-auto">
        {favoriteGames.length > 0
          ? favoriteGames.map(g => renderCard(g.gameImage, g.gameTitle, () => handleGameClick(g.gameTitle)))
          : <p className="text-muted">No hay juegos favoritos.</p>}
      </div>
    </section>

    <section className="mb-5">
      <h5 className="text-primary mb-3">Actividad reciente</h5>
      <div className="d-flex gap-3 overflow-auto">
        {recentGames.length > 0
          ? recentGames.map(g => renderCard(g.gameImage, g.gameTitle, () => handleGameClick(g.gameTitle)))
          : <p className="text-muted">Sin actividad reciente.</p>}
      </div>
    </section>
  </div>
);

}
