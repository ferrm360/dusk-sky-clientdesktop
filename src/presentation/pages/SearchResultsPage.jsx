import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import { searchGameByName } from '@business/gameService';


export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const query = new URLSearchParams(location.search).get('query') || '';

  useEffect(() => {
    if (query) {
      searchGameByName(query)
        .then(setResults)
        .catch(() => setResults([]));
    }
  }, [query]);

  const handleClick = (game) => {
    navigate(`/juegos/${encodeURIComponent(game.name)}`);
  };

  const formatDateYear = (rawDate) => {
    if (!rawDate) return '';
    const date = new Date(rawDate);
    return isNaN(date.getFullYear()) ? '' : date.getFullYear();
  };

  const shortDescription = (desc, limit = 320) => {
    if (!desc) return '';
    return desc.length > limit ? desc.slice(0, limit).trim() + '...' : desc;
  };

  return (
    <NavbarLayout>
      <div className="container py-5 bg-light text-dark min-vh-100">
        <h4 className="text-primary mb-4">Resultados para “{query}”</h4>

        {results.length === 0 ? (
          <div className="text-muted">
            <p className="mb-2">Parece que no se encuentra este juego registrado.</p>
            <p>
              <span className="text-success fw-semibold" role="button">
                Solicítalo
              </span>{' '}
              para que lo agreguemos a Dusk Sky.
            </p>
          </div>
        ) : (
          <div className="list-group">
            {results.map((game) => (
              <div
                key={game.id}
                className="list-group-item list-group-item-action border-0 border-bottom py-4 px-3 game-card-hover"
                style={{
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                }}
                onClick={() => handleClick(game)}
              >
                <div className="d-flex flex-row">
                  <img
                    src={game.headerUrl}
                    alt={game.name}
                    style={{
                      width: '100px',
                      height: '140px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginRight: '20px',
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <h5 className="mb-0 fw-bold text-dark me-2">{game.name}</h5>
                      <span className="text-muted fs-6">{formatDateYear(game.releaseDate)}</span>
                    </div>
                    <p className="text-muted mb-2" style={{ fontSize: '0.95rem' }}>
                      {shortDescription(game.description)}
                      {game.description.length > 320 && (
                        <span className="text-primary ms-1 fw-semibold" style={{ fontSize: '0.9rem' }}>
                          Leer más
                        </span>
                      )}
                    </p>
                    <div className="text-muted small">
                      <strong>Géneros:</strong> {game.genres?.join(', ') || 'N/A'}<br />
                      <strong>Desarrollado por:</strong> {game.developer || 'N/A'}<br />
                      <strong>Publicado por:</strong> {game.publisher || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NavbarLayout>
  );
}
