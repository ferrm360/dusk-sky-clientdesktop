import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import { importGameFromSteam } from '@business/gameService'; 

export default function AddGame() {
  const [importSteam, setImportSteam] = useState(true); // Default to 'Yes' for Steam import
  const [gameLink, setGameLink] = useState('');
  const [gameDetails, setGameDetails] = useState({
    name: '',
    description: '',
    developer: '',
    publisher: '',
    releaseDate: '',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [extractedAppId, setExtractedAppId] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleImportChange = (e) => {
    setImportSteam(e.target.value === 'yes');
    setError('');
    setGameLink('');
    setGameDetails({ name: '', description: '', developer: '', publisher: '', releaseDate: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGameDetails({ ...gameDetails, [name]: value });
  };

  const handleGameLinkChange = (e) => {
    setGameLink(e.target.value);
    if (error) setError(''); 
  };

  const validateSteamLinkOrAppId = (link) => {
    const steamLinkPattern = /^https:\/\/store\.steampowered\.com\/app\/(\d+)\/[A-Za-z0-9_%-]+\/?$/i; // More robust regex
    const appIdPattern = /^\d+$/; // For pure AppID (numbers only)

    const steamMatch = link.match(steamLinkPattern);
    if (steamMatch) {
      return steamMatch[1]; 
    }

    if (appIdPattern.test(link)) {
      return link; 
    }

    return null; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(''); 

    if (importSteam) {
      const appId = validateSteamLinkOrAppId(gameLink);

      if (!appId) {
        setError('Por favor, ingresa un link de Steam válido o un AppID (solo números).');
        return;
      }

      console.log("AppID obtenido:", appId);
      setExtractedAppId(appId); 
      setError('');
      setShowConfirmation(true);
    } else {
  
      if (!gameDetails.name || !gameDetails.description || !gameDetails.developer || !gameDetails.publisher || !gameDetails.releaseDate) {
        setError('Por favor, completa todos los campos del formulario.');
        return;
      }
      
      console.log("Juego agregado manualmente:", gameDetails);
      setSuccessMessage('Juego agregado manualmente exitosamente.');
      setError('');
      setGameDetails({ name: '', description: '', developer: '', publisher: '', releaseDate: '' }); // Clear form
    }
  };

  const handleConfirm = async () => {
    setShowConfirmation(false); 

    console.log('Attempting to import game with AppID:', extractedAppId);

    try {
      await importGameFromSteam(extractedAppId);
      console.log('Game imported successfully.');
      setSuccessMessage('¡Juego importado exitosamente!'); 
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError('Este juego ya ha sido importado previamente.');
        console.error('Error: Game already imported');
      } else {
        setError('Hubo un error al importar el juego. Intenta de nuevo.');
        console.error('Unknown error importing game:', error);
      }
    }
  };

  return (
    <NavbarLayout>
      <div className="bg-light text-dark min-vh-100 py-5"> {/* Main container with white background */}
        <div className="container py-4">
          <div className="card shadow-lg border-0 rounded-4 p-lg-5 p-4 mx-auto" style={{ maxWidth: '800px' }}>
            <h2 className="text-center mb-4 text-primary fw-bold">Agregar un Nuevo Juego</h2>

            {/* Success/Error Alerts */}
            {successMessage && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>{successMessage}</div>
              </div>
            )}
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Option to import game from Steam */}
              <div className="mb-4">
                <label className="form-label fw-semibold">¿Cómo deseas agregar el juego?</label>
                <div className="d-flex gap-4">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="importYes"
                      name="importSteam"
                      value="yes"
                      checked={importSteam === true}
                      onChange={handleImportChange}
                    />
                    <label className="form-check-label" htmlFor="importYes">Importar desde Steam</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="importNo"
                      name="importSteam"
                      value="no"
                      checked={importSteam === false}
                      onChange={handleImportChange}
                    />
                    <label className="form-check-label" htmlFor="importNo">Agregar manualmente</label>
                  </div>
                </div>
              </div>

              {/* If Steam import option is 'Yes' */}
              {importSteam && (
                <div className="mb-4">
                  <label htmlFor="gameLink" className="form-label">
                    Ingresa el link del juego en Steam o el AppID:
                  </label>
                  <input
                    type="text"
                    id="gameLink"
                    value={gameLink}
                    onChange={handleGameLinkChange}
                    placeholder="Ej: https://store.steampowered.com/app/858940/Flowers_Le_volume_sur_ete/ o 858940"
                    className="form-control form-control-lg"
                  />
                  <div className="form-text text-muted">Puedes encontrar el AppID en la URL del juego en Steam o en sitios como SteamDB.</div>
                </div>
              )}

              {/* If option is 'No', show the manual game form */}
              {!importSteam && (
                <>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre del juego:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={gameDetails.name}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Ej: Cyberpunk 2077"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Descripción:</label>
                    <textarea
                      id="description"
                      name="description"
                      value={gameDetails.description}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="4"
                      placeholder="Una breve descripción del juego."
                    ></textarea>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="developer" className="form-label">Desarrollador:</label>
                      <input
                        type="text"
                        id="developer"
                        name="developer"
                        value={gameDetails.developer}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Ej: CD Projekt Red"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="publisher" className="form-label">Publisher:</label>
                      <input
                        type="text"
                        id="publisher"
                        name="publisher"
                        value={gameDetails.publisher}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Ej: CD Projekt"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="releaseDate" className="form-label">Fecha de lanzamiento:</label>
                    <input
                      type="date"
                      id="releaseDate"
                      name="releaseDate"
                      value={gameDetails.releaseDate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="text-center mt-4">
                <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5">
                  {importSteam ? 'Importar Juego' : 'Agregar Juego'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="modal-backdrop-custom d-flex justify-content-center align-items-center">
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '560px' }}>
              <div className="modal-content bg-white shadow rounded-4 p-4"> {/* Rounded corners, shadow */}
                <div className="modal-header border-0 pb-0"> {/* No border, no padding bottom */}
                  <h5 className="modal-title text-primary fw-bold">Confirmación</h5>
                  <button type="button" className="btn-close" onClick={() => setShowConfirmation(false)} aria-label="Close" />
                </div>
                <div className="modal-body text-center pt-3 pb-4">
                  <i className="bi bi-question-circle-fill text-info display-4 mb-3"></i> {/* Icon */}
                  <p className="lead text-dark">¿Estás seguro de que quieres agregar este juego?</p>
                  <p className="text-muted small mb-0">Se importará el juego con el AppID:</p>
                  <p className="fw-bold fs-5 text-primary">{extractedAppId}</p> {/* AppID highlighted */}
                </div>
                <div className="modal-footer justify-content-center border-0 pt-0 gap-3"> {/* No border, no padding top */}
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={handleConfirm}
                  >
                    Confirmar
                  </button>
                  <button
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        .bg-light {
          background-color: #f8f9fa !important; /* A very light grey for subtle background */
        }
        .form-label {
          font-weight: 500; /* Slightly bolder labels */
        }
        .form-control {
          border-radius: 0.5rem; /* Rounded input fields */
          border-color: #ced4da; /* Default border color */
          padding: 0.75rem 1rem; /* More generous padding */
        }
        .form-control:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .btn-primary {
          background-color: #0d6efd; /* Bootstrap primary blue */
          border-color: #0d6efd;
          transition: all 0.2s ease-in-out;
        }
        .btn-primary:hover {
          background-color: #0a58ca;
          border-color: #0a58ca;
        }
        .btn-outline-secondary {
          border-color: #6c757d;
          color: #6c757d;
          transition: all 0.2s ease-in-out;
        }
        .btn-outline-secondary:hover {
          background-color: #6c757d;
          color: white;
        }
        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6); /* Slightly darker overlay for white background */
          z-index: 1050;
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