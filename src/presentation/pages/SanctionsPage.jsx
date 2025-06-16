import React, { useState, useEffect } from 'react';
import NavbarLayout from '../components/NavbarLayout';
import { getAllSanctions, deleteSanction, SanctionType } from '@business/moderationService';
import { getUserById as getUserFromAuthService } from '@business/authService';
import { getUserById as getUserFromManagerService } from '@business/UserManagerService';

function ConfirmDeleteSanctionModal({ show, onClose, onConfirm, sanctionToDelete }) {
  if (!show || !sanctionToDelete) return null;

  return (
    <div className="modal-backdrop-custom d-flex justify-content-center align-items-center">
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
        <div className="modal-content bg-white shadow rounded-4 p-4">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title text-danger fw-bold">Confirmar Eliminación</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body pt-3 pb-4 text-center">
            <p className="text-dark mb-4">
              ¿Estás seguro de que quieres quitar la sanción a **{sanctionToDelete.reportedUsername}**?
            </p>
            {sanctionToDelete.reportedUserAvatar && (
              <img
                src={sanctionToDelete.reportedUserAvatar}
                alt={sanctionToDelete.reportedUsername}
                className="rounded-circle mb-3"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            )}
            <p className="text-muted">
              Tipo: **{sanctionToDelete.type}**<br />
              Razón: **{sanctionToDelete.reason || 'N/A'}**
            </p>

            <div className="d-grid gap-2 mt-4">
              <button className="btn btn-danger btn-lg rounded-pill" onClick={onConfirm}>
                <i className="bi bi-trash-fill me-2"></i> Sí, Quitar Sanción
              </button>
              <button className="btn btn-outline-secondary rounded-pill" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: 2000;
        }
      `}</style>
    </div>
  );
}


export default function SanctionsPage() {
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sanctionToDelete, setSanctionToDelete] = useState(null);

  const getSanctionStatus = (sanction) => {
    const now = new Date();
    const endDate = sanction.endDate ? new Date(sanction.endDate) : null;

    if (sanction.type === SanctionType.Ban) {
      return (endDate === null || endDate > now) ? 'Activa' : 'Inactiva';
    } else if (sanction.type === SanctionType.Suspension) {
      return (endDate && endDate > now) ? 'Activa' : 'Inactiva';
    }
    return 'Desconocido';
  };

  useEffect(() => {
    const fetchSanctions = async () => {
      setLoading(true);
      try {
        const sanctionsData = await getAllSanctions();
        
        const enrichedSanctions = await Promise.all(sanctionsData.map(async (sanction) => {
          let reportedUsername = 'Desconocido';
          let reportedUserAvatar = 'https://via.placeholder.com/60';

          try {
            const userAuthInfo = await getUserFromAuthService(sanction.userId);
            if (userAuthInfo && userAuthInfo.username) {
              reportedUsername = userAuthInfo.username;
            }
          } catch (e) {
            console.warn(`Could not fetch auth info for user ${sanction.userId}:`, e);
          }

          try {
            const userManagerInfo = await getUserFromManagerService(sanction.userId);
            if (userManagerInfo && userManagerInfo.avatar_url) {
              reportedUserAvatar = userManagerInfo.avatar_url;
            }
          } catch (e) {
            console.warn(`Could not fetch manager info for user ${sanction.userId}:`, e);
          }

          return {
            ...sanction,
            reportedUsername,
            reportedUserAvatar,
            calculatedStatus: getSanctionStatus(sanction)
          };
        }));

        const filtered = enrichedSanctions.filter(sanction => {
          if (filter === 'all') return true;
          if (filter === 'active') return sanction.calculatedStatus === 'Activa';
          if (filter === 'resolved') return sanction.calculatedStatus === 'Inactiva';
          return true;
        });

        setSanctions(filtered);
      } catch (error) {
        console.error('Error fetching sanctions:', error);
        setSanctions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSanctions();
  }, [filter]);

  const handleOpenDeleteModal = (sanction) => {
    setSanctionToDelete(sanction);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSanctionToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!sanctionToDelete) return;

    try {
      await deleteSanction(sanctionToDelete.id);
      alert('Sanción eliminada correctamente.');
      setSanctions(prevSanctions => prevSanctions.filter(s => s.id !== sanctionToDelete.id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error al eliminar la sanción:', error);
      alert(`Error al eliminar la sanción: ${error.message || 'Error desconocido'}`);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Activa':
        return 'bg-warning text-dark';
      case 'Inactiva':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <NavbarLayout>
      <div className="container py-5 bg-white shadow-lg rounded-4 min-vh-100 my-5"> {/* Contenedor principal con sombra y bordes */}
        <h2 className="text-primary fw-bold mb-4 border-bottom pb-2">Historial de Sanciones</h2>

        <div className="mb-4 d-flex align-items-center">
          <label htmlFor="sanctionFilter" className="me-3 fw-bold text-muted">Filtrar por estado:</label>
          <select
            id="sanctionFilter"
            className="form-select form-select-sm w-auto border-secondary" // Tamaño más pequeño y borde
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="active">Activas</option>
            <option value="resolved">Inactivas/Resueltas</option>
          </select>
        </div>

        {loading ? (
          <p className="text-muted text-center py-5">
            <span className="spinner-border text-primary me-2" role="status" aria-hidden="true"></span>
            Cargando sanciones...
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped border rounded-3 overflow-hidden"> {/* table-hover para interactividad, rounded-3 para bordes */}
              <thead className="table-dark"> {/* Encabezado oscuro */}
                <tr>
                  <th scope="col" className="text-center">ID Sanción</th>
                  <th scope="col">Usuario Sancionado</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Razón</th>
                  <th scope="col">Fecha Inicio</th>
                  <th scope="col">Fecha Fin</th>
                  <th scope="col" className="text-center">Estado</th>
                  <th scope="col" className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sanctions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      <i className="bi bi-info-circle me-2"></i> No hay sanciones para mostrar con el filtro actual.
                    </td>
                  </tr>
                ) : (
                  sanctions.map(sanction => (
                    <tr key={sanction.id}>
                      <td className="text-break text-center align-middle small">{sanction.id.substring(0, 8)}...</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={sanction.reportedUserAvatar}
                            alt={sanction.reportedUsername}
                            className="rounded-circle me-2 border border-secondary"
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                          />
                          <div>
                            <span className="fw-bold text-primary d-block">{sanction.reportedUsername}</span>
                            <small className="text-muted">(ID: {sanction.userId.substring(0, 8)}...)</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">{sanction.type}</td>
                      <td className="text-break align-middle">{sanction.reason || 'N/A'}</td>
                      <td className="align-middle">{new Date(sanction.startDate).toLocaleDateString()}</td> {/* Solo fecha */}
                      <td className="align-middle">{sanction.endDate ? new Date(sanction.endDate).toLocaleDateString() : 'Permanente'}</td> {/* Solo fecha */}
                      <td className="text-center align-middle">
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(sanction.calculatedStatus)}`}>
                          {sanction.calculatedStatus}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill"
                          onClick={() => handleOpenDeleteModal(sanction)}
                          title="Quitar Sanción"
                        >
                          <i className="bi bi-trash"></i> Quitar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteSanctionModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        sanctionToDelete={sanctionToDelete}
      />

      {/* Estilos CSS adicionales para la tabla y elementos, puedes moverlos a un archivo CSS global */}
      <style>{`
        .table-responsive {
          border-radius: 0.75rem; /* Bordes redondeados para el contenedor de la tabla */
          overflow: hidden; /* Asegura que los bordes redondeados se apliquen bien */
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1); /* Sombra para la tabla */
        }
        .table thead th {
          border-bottom: 2px solid #343a40; /* Borde más pronunciado en el encabezado */
          padding: 1rem;
        }
        .table tbody td {
          padding: 0.8rem 1rem;
        }
        .table-hover tbody tr:hover {
          background-color: #f0f2f5; /* Color al pasar el ratón */
        }
        .badge.rounded-pill {
          min-width: 80px; /* Ancho mínimo para los badges de estado */
        }
        .text-primary { color: #0d6efd !important; }
        .text-dark { color: #212529 !important; }
        .bg-light { background-color: #f8f9fa !important; }
      `}</style>
    </NavbarLayout>
  );
}