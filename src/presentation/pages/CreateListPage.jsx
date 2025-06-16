import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import UserSessionManager from '@business/UserSessionManager'; 
import { createGameList, addGameListItem } from '@business/gamelistService'; 
import { searchGameByName } from '@business/gameService'; 

export default function CreateListPage() {
  const navigate = useNavigate();
  const currentUserId = UserSessionManager.getPayload()?.sub;

  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]); 
  const [gameComments, setGameComments] = useState({}); 

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUserId) {
      alert('Debes iniciar sesión para crear una lista.');
      navigate('/');
    }
  }, [currentUserId, navigate]);

  const handleSearchGames = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    setError(null);
    try {
      const results = await searchGameByName(searchTerm);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching games:', err);
      setError('Error al buscar juegos. Inténtalo de nuevo.');
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAddGameToList = (game) => {
    if (!selectedGames.some(g => g.id === game.id)) {
      setSelectedGames(prev => [...prev, game]);
      setSearchTerm(''); 
      setSearchResults([]);
    } else {
      alert('Este juego ya está en tu lista.');
    }
  };

  const handleRemoveGameFromList = (gameId) => {
    setSelectedGames(prev => prev.filter(game => game.id !== gameId));
    setGameComments(prev => { 
      const newComments = { ...prev };
      delete newComments[gameId];
      return newComments;
    });
  };

  const handleSaveList = async (e) => {
    e.preventDefault();
    setError(null);

    if (!listName.trim()) {
      setError('El nombre de la lista es obligatorio.');
      return;
    }
    if (!currentUserId) {
      setError('No se pudo determinar el usuario. Por favor, inicia sesión de nuevo.');
      return;
    }
    if (selectedGames.length === 0) {
      setError('Tu lista debe contener al menos un juego.');
      return;
    }

    setSavingList(true);
    try {
      const newGameList = {
        userId: currentUserId,
        name: listName,
        description: listDescription,
        isPublic: isPublic,
      };
      const createdList = await createGameList(newGameList);

    
      const itemAddPromises = selectedGames.map(game => 
        addGameListItem(createdList.id, {
          gameId: game.id,
          comment: gameComments[game.id] || '',
        })
      );
      const results = await Promise.allSettled(itemAddPromises);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Falló al añadir el juego '${selectedGames[index].name}':`, result.reason);
        }
      });

      alert('Lista creada y juegos añadidos con éxito!');
      navigate(`/lists/${createdList.id}`); 
    } catch (err) {
      console.error('Error al guardar la lista:', err);
      setError(`Error al crear la lista: ${err.message || 'Error desconocido'}.`);
    } finally {
      setSavingList(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
      navigate('/lists'); 
    }
  };


  return (
    <NavbarLayout>
      <div className="container py-5">
        <h2 className="text-primary fw-bold mb-4">Nueva Lista</h2>

        {error && (
          <div className="alert alert-danger text-center mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveList} className="card p-4 shadow-sm rounded-3">
          {/* Información Básica de la Lista */}
          <div className="mb-4">
            <label htmlFor="listName" className="form-label fw-bold">Nombre de la Lista <span className="text-danger">*</span></label>
            <input
              type="text"
              id="listName"
              className="form-control"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ej. Mis juegos favoritos de 2024"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="listDescription" className="form-label fw-bold">Descripción</label>
            <textarea
              id="listDescription"
              className="form-control"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              rows="4"
              placeholder="Una breve descripción de lo que trata tu lista..."
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Visibilidad</label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="isPublicSwitch"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isPublicSwitch">
                {isPublic ? 'Pública - Cualquiera puede verla' : 'Privada - Solo tú puedes verla'}
              </label>
            </div>
          </div>

          <hr className="my-4" />

          {/* Sección para Añadir Juegos */}
          <h4 className="text-primary fw-bold mb-3">Añadir Juegos a la Lista</h4>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Busca juegos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchGames(); }}}
            />
            <button className="btn btn-outline-primary" type="button" onClick={handleSearchGames} disabled={loadingSearch}>
              {loadingSearch ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-search"></i>
              )} Buscar
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="list-group mb-3 shadow-sm rounded-3 overflow-hidden">
              {searchResults.map(game => (
                <button
                  key={game.id}
                  type="button"
                  className="list-group-item list-group-item-action d-flex align-items-center"
                  onClick={() => handleAddGameToList(game)}
                >
                  <img 
                    src={game.headerUrl || 'https://via.placeholder.com/40x60?text=Game'} 
                    alt={game.name} 
                    className="me-3 rounded" 
                    style={{ width: 40, height: 60, objectFit: 'cover' }} 
                  />
                  <div>
                    <h6 className="mb-0 text-dark">{game.name}</h6>
                    {/* Puedes añadir más detalles aquí si tu gameService los retorna, ej. game.releaseYear */}
                    <small className="text-muted">ID: {game.id.substring(0,8)}...</small>
                  </div>
                  <i className="bi bi-plus-circle-fill text-success ms-auto"></i>
                </button>
              ))}
            </div>
          )}

          {selectedGames.length > 0 && (
            <div className="mb-4">
              <h5 className="text-dark fw-bold mb-3">Juegos en tu Lista ({selectedGames.length})</h5>
              <div className="list-group">
                {selectedGames.map(game => (
                  <div key={game.id} className="list-group-item d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                    <img 
                      src={game.coverImageUrl || 'https://via.placeholder.com/50x75?text=Game'} 
                      alt={game.name} 
                      className="me-sm-3 mb-2 mb-sm-0 rounded" 
                      style={{ width: 50, height: 75, objectFit: 'cover' }} 
                    />
                    <div className="flex-grow-1 me-sm-3">
                      <h6 className="mb-1 text-dark fw-bold">{game.name}</h6>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder={`Comentario sobre ${game.name} (opcional)`}
                        value={gameComments[game.id] || ''}
                        onChange={(e) => setGameComments(prev => ({ ...prev, [game.id]: e.target.value }))}
                      ></textarea>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm mt-2 mt-sm-0" 
                      onClick={() => handleRemoveGameFromList(game.id)}
                    >
                      <i className="bi bi-x-circle me-1"></i> Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedGames.length === 0 && !loadingSearch && searchResults.length === 0 && (
            <div className="text-center text-muted py-5">
              <p>Tu lista está vacía.</p>
              <p>Añade juegos usando la barra de búsqueda de arriba.</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="d-flex justify-content-end gap-3 mt-4">
            <button type="button" className="btn btn-outline-secondary btn-lg rounded-pill px-4" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-lg rounded-pill px-4" disabled={savingList}>
              {savingList ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i> Guardar Lista
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        body { background-color: #f8f9fa; }
        .container { max-width: 900px; }
        .form-label.fw-bold { color: #343a40; }
        .form-control, .form-select { border-radius: 0.5rem; border-color: #ced4da; }
        .form-control:focus, .form-select:focus { 
            border-color: #80bdff;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .list-group-item {
          border-color: #e9ecef;
          padding: 0.75rem 1.25rem;
        }
        .list-group-item:hover {
          background-color: #f8f9fa;
        }
        .btn-outline-primary:hover {
            color: #fff;
            background-color: #0d6efd;
            border-color: #0d6efd;
        }
      `}</style>
    </NavbarLayout>
  );
}