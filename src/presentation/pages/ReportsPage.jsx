import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarLayout from '../components/NavbarLayout';
import { getAllReports, updateReport, ReportStatus, ReportContentType } from '@business/moderationService';
import { getUserById as getUserFromAuthService } from '@business/authService';
import { getUserById as getUserFromManagerService } from '@business/UserManagerService';
import ReportDetailModal from '../components/ReportDetailModal';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState(ReportStatus.PENDING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const navigate = useNavigate();

  const fetchAndEnrichReports = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const fetchedReports = await getAllReports();

      const enrichedReports = await Promise.all(
        fetchedReports.map(async (report) => {
          let reportedUsername = 'Usuario Desconocido';
          let reportedUserAvatar = 'assets/default_avatar.jpg';
          let reportedUserActualId = report.reportedUserId; 

          if (reportedUserActualId && reportedUserActualId.trim() !== "") {
            try {
              const authUser = await getUserFromAuthService(reportedUserActualId);
              const managerUser = await await getUserFromManagerService(reportedUserActualId); // Corrección: await doble aquí.
              reportedUsername = authUser?.username || 'Usuario Desconocido';
              reportedUserAvatar = managerUser?.avatar_url || 'assets/default_avatar.jpg';
            } catch (fetchErr) {
              console.warn(`No se pudo obtener info para ID '${reportedUserActualId}':`, fetchErr);
              reportedUsername = `ID: ${reportedUserActualId.substring(0, 8)}... (Error)`;
            }
          } else {
            console.warn(`Reporte con reportedUserId vacío o nulo: ${report.id}`);
            reportedUsername = `Usuario Desconocido (ID vacío)`;
          }

          return {
            ...report,
            reportedUsername,
            reportedUserAvatar,
            reportedUserActualId, 
            id: report.id, 
            status: report.status
          };
        })
      );

      setReports(enrichedReports);
      if (statusFilter === 'all') {
        setFilteredReports(enrichedReports);
      } else {
        setFilteredReports(enrichedReports.filter(report => report.status === statusFilter));
      }

    } catch (err) {
      console.error('Error al cargar los reportes:', err);
      setError(true);
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAndEnrichReports();
  }, [fetchAndEnrichReports]);

  const handleStatusFilterChange = (e) => {
    const selectedStatus = e.target.value;
    setStatusFilter(selectedStatus);
  };

  const handleRowClick = (report) => {
    if (!report || !report.status) {
      console.error("El reporte seleccionado no tiene un estado válido.");
      return;
    }

    setSelectedReport(report);  
    setShowDetailModal(true);  
  };

  const handleUpdateReportStatus = async (reportId, newStatus, moderatorNotes = '') => {
    try {
      const reportToUpdate = reports.find(r => r.id === reportId);
      if (!reportToUpdate) {
        throw new Error(`Reporte con ID ${reportId} no encontrado.`);
      }

      const updatedReportData = {
        ...reportToUpdate,
        status: newStatus,
        notes: moderatorNotes,
      };

      const response = await updateReport(reportId, updatedReportData);

      if (response.status === 204) {
        alert("Reporte actualizado correctamente");
      } else {
        const data = await response.json();
        console.log("Respuesta del backend:", data);
      }

      await fetchAndEnrichReports();
      setShowDetailModal(false);
      setSelectedReport(null);
      alert('¡Estado del reporte actualizado con éxito!');
    } catch (error) {
      console.error('Error al actualizar el estado del reporte:', error);
      alert('Error al actualizar el estado del reporte. Por favor, inténtalo de nuevo.');
    }
  };



  const getStatusBadgeClass = (status) => {
    switch (status) {
      case ReportStatus.PENDING: return 'bg-warning text-dark';
      case ReportStatus.RESOLVED: return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getContentTypeDisplay = (type) => {
    switch (type) {
      case ReportContentType.COMMENT: return 'Comentario';
      case ReportContentType.REVIEW: return 'Reseña';
      case ReportContentType.PROFILE: return 'Perfil';
      default: return 'Desconocido';
    }
  };

  return (
    <NavbarLayout>
      <div className="bg-white text-dark min-vh-100 py-5">
        <div className="container">
          <h2 className="text-primary mb-4 fw-bold text-center">Panel de Reportes de Moderación</h2>

          <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3 shadow-sm">
            <div className="d-flex align-items-center">
              <label htmlFor="statusFilter" className="form-label mb-0 me-3 fw-semibold">Filtrar por estado:</label>
              <select
                id="statusFilter"
                className="form-select w-auto rounded-pill px-4 shadow-sm"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value={ReportStatus.PENDING}>Pendientes</option>
                <option value={ReportStatus.RESOLVED}>Resueltos</option>
                <option value="all">Todos</option>
              </select>
            </div>
            {loading && (
              <div className="spinner-border text-primary spinner-border-sm" role="status">
                <span className="visually-hidden">Cargando reportes...</span>
              </div>
            )}
          </div>

          {error ? (
            <div className="alert alert-danger text-center mt-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> Error al cargar los reportes. Por favor, inténtalo de nuevo más tarde.
            </div>
          ) : (
            <div className="card shadow-lg border-0 rounded-4 mt-4">
              <div className="card-body p-0">
                {filteredReports.length === 0 && !loading ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-folder-x display-4 mb-3"></i>
                    <p className="lead">No hay reportes para mostrar con este filtro.</p>
                    {statusFilter === 'all' && <p>¡Parece que no hay reportes en la base de datos!</p>}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-primary text-white">
                        <tr>
                          <th className="py-3 px-4 rounded-top-start">ID Reporte</th>
                          <th className="py-3 px-4">Usuario Reportado</th>
                          <th className="py-3 px-4">Tipo</th>
                          <th className="py-3 px-4">Razón</th>
                          <th className="py-3 px-4">Fecha Reporte</th>
                          <th className="py-3 px-4 rounded-top-end">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map(report => (
                          <tr
                            key={report.id}
                            onClick={() => handleRowClick(report)}
                            className="report-row-clickable"
                          >
                            <td className="px-4 py-3 text-muted small">{report.id.substring(0, 8)}...{report.id.substring(report.id.length - 8)}</td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <img src={report.reportedUserAvatar} alt={report.reportedUsername} className="rounded-circle me-2" style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                                <span className="fw-semibold text-dark">{report.reportedUsername}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-dark">{getContentTypeDisplay(report.contentType)}</td>
                            <td className="px-4 py-3 text-dark report-reason-preview">{report.reason || 'N/A'}</td>
                            <td className="px-4 py-3 text-muted small">{new Date(report.reportedAt).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedReport && (
        <ReportDetailModal
          show={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReport(null);
          }}
          report={selectedReport}
          onUpdateReportStatus={handleUpdateReportStatus}
        />
      )}

      <style>{`
        /* ... (Estilos CSS personalizados) ... */
        .bg-white { background-color: #ffffff !important; }
        .bg-light { background-color: #f8f9fa !important; }
        .text-dark { color: #212529 !important; }
        .text-primary { color: #0d6efd !important; }
        .fw-bold { font-weight: 700 !important; }
        .rounded-4 { border-radius: 1rem !important; }
        .rounded-3 { border-radius: 0.75rem !important; }
        .rounded-pill { border-radius: 50rem !important; }
        .shadow-lg { box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important; }
        .shadow-sm { box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important; }

        .form-select { border-color: #dee2e6; }
        .form-select:focus { border-color: #86b7fe; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); }

        .table { --bs-table-bg: #fff; --bs-table-striped-bg: #f8f9fa; border-collapse: separate; border-spacing: 0; }
        .table thead th { border-bottom: none; vertical-align: middle; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .table tbody tr { border-bottom: 1px solid #e9ecef; }
        .table tbody tr:last-child { border-bottom: none; }

        .table-hover tbody tr:hover { background-color: #e9ecef; }
        .report-row-clickable { cursor: pointer; transition: background-color 0.15s ease-in-out; }
        .report-row-clickable:hover { background-color: #e2e6ea; }
        .report-reason-preview { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        ::-webkit-scrollbar { width: 8px; background-color: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background-color: #999; }
      `}</style>
    </NavbarLayout>
  );
}