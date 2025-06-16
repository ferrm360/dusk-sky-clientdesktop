import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import { visualNovelGames, rpgGames, actionGames, simulationGames } from '@business/games/gameSection';

const sections = [
  { title: 'Novelas Visuales', games: visualNovelGames },
  { title: 'Juegos RPG', games: rpgGames },
  { title: 'Acción', games: actionGames },
  { title: 'Simulación', games: simulationGames }
];

export default function AllGamesPage() {
  const navigate = useNavigate();

  const handleGameClick = (game) => {
    navigate(`/juegos/${encodeURIComponent(game.title)}`);
  };

  const scrollSection = (ref, direction) => {
    if (ref?.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <NavbarLayout>
      <div className="bg-light text-dark min-vh-100 pt-5">
        <div className="container py-5">
          <h2 className="text-primary mb-2">Todos los juegos</h2>
          <p className="text-muted mb-4">
            Descubre tu próximo juego favorito. Navega por géneros como novelas visuales y RPGs.
          </p>

          {sections.map((section, idx) => {
            const rowRef = useRef();
            return (
              <div key={idx} className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="text-dark">{section.title}</h4>
                  {section.games.length > 6 && (
                    <div>
                      <button
                        className="btn btn-sm btn-outline-dark me-2"
                        onClick={() => scrollSection(rowRef, 'left')}
                      >
                        ◀
                      </button>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => scrollSection(rowRef, 'right')}
                      >
                        ▶
                      </button>
                    </div>
                  )}
                </div>

                <div
                  ref={rowRef}
                  className="d-flex gap-3 overflow-auto py-2"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {section.games.map((game, i) => (
                    <div
                      key={i}
                      className="card border-0 shadow-sm game-card-hover flex-shrink-0"
                      style={{
                        width: '180px',
                        backgroundColor: '#2c2c2c',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleGameClick(game)}
                    >
                      <img
                        src={game.imageUrl}
                        alt={game.title}
                        className="card-img-top"
                        style={{ height: '250px', objectFit: 'cover' }}
                      />
                      <div className="card-body p-2 text-center">
                        <h6 className="card-title m-0">{game.title}</h6>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </NavbarLayout>
  );
}
