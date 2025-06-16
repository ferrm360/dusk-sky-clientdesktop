import React, { useState, useEffect } from 'react';
import { ReportStatus, ReportContentType, SanctionType, applySanction } from '@business/moderationService';
import { getUserById as getUserFromAuthService } from '@business/authService';
import { getUserById as getUserFromUserManagerService } from '@business/UserManagerService';

import SanctionModal from './SanctionModal'; 

export default function ReportDetailModal({ show, onClose, report, onUpdateReportStatus }) {
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [reporterInfo, setReporterInfo] = useState(null);
  const [showSanctionModal, setShowSanctionModal] = useState(false); 

  useEffect(() => {
    if (report && show) {
      setModeratorNotes('');
      setIsProcessing(false);
   
    }
  }, [report, show]);

  if (!show || !report) return null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case ReportStatus.PENDING:
        return 'bg-warning text-dark';
      case ReportStatus.RESOLVED:
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const getContentTypeDisplay = (type) => {
    switch (type) {
      case ReportContentType.COMMENT:
        return 'Comentario';
      case ReportContentType.REVIEW:
        return 'Reseña';
      case ReportContentType.PROFILE:
        return 'Perfil';
      default:
        return 'Desconocido';
    }
  };

  const handleApplyVerdict = async (statusToApply) => {
    setIsProcessing(true);
    try {
      await onUpdateReportStatus(report.id, statusToApply, moderatorNotes);
    } catch (error) {
      console.error('Error al aplicar el veredicto:', error);
      alert('Error al aplicar el veredicto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenSanctionModal = () => {
    setShowSanctionModal(true);
  };

  const handleCloseSanctionModal = () => {
    setShowSanctionModal(false);
  };

  const handleSanctionApplied = async (sanctionData) => {
   
    console.log('Sanción aplicada:', sanctionData);
    handleCloseSanctionModal(); 

  };

  return (
    <div className="modal-backdrop-custom d-flex justify-content-center align-items-center">
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '700px' }}>
        <div className="modal-content bg-white shadow rounded-4 p-4">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title text-primary fw-bold">Detalles del Reporte: {report.id.substring(0, 8)}...</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isProcessing} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body pt-3 pb-4">
            <div className="row g-3 mb-4">
              {/* Columna de Información del Reporte */}
              <div className="col-md-6">
                <h6 className="text-dark fw-bold mb-2">Información del Reporte:</h6>
                <p className="text-muted mb-1"><strong>ID:</strong> {report.id}</p>
                <p className="text-muted mb-1">
                  <strong>Tipo de Contenido:</strong> {getContentTypeDisplay(report.contentType)}
                </p>
                <p className="text-muted mb-1">
                  <strong>Razón:</strong> {report.reason || 'No especificada'}
                </p>
                <p className="text-muted mb-1">
                  <strong>Fecha Reporte:</strong> {new Date(report.reportedAt).toLocaleString()}
                </p>
                <p className="text-muted mb-0">
                  <strong>Estado Actual:</strong> <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </p>
              </div>
              {/* Columna de Usuario Reportado */}
              <div className="col-md-6">
                <h6 className="text-dark fw-bold mb-2">Usuario Reportado:</h6>
                <div className="d-flex align-items-center mb-2">
                  <img src={report.reportedUserAvatar} alt={report.reportedUsername} className="rounded-circle me-3" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  <div>
                    <h5 className="text-dark mb-0">{report.reportedUsername}</h5>
                    <small className="text-muted">ID: {report.reportedUserId}</small>
                  </div>
                </div>
                {reporterInfo && (
                  <>
                    <h6 className="text-dark fw-bold mt-3 mb-2">Reportado Por:</h6>
                    <div className="d-flex align-items-center">
                        <img src={reporterInfo.avatar} alt={reporterInfo.username} className="rounded-circle me-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                        <span className="text-dark">{reporterInfo.username}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <hr className="my-4"/>

            {/* Sección para Tomar Veredicto */}
            <h6 className="text-dark fw-bold mb-3">Tomar Veredicto:</h6>
            {report.status === ReportStatus.RESOLVED ? (
              <div className="alert alert-info text-center" role="alert">
                Este reporte ya ha sido resuelto.
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label htmlFor="moderatorNotes" className="form-label">Notas del Moderador (Opcional):</label>
                  <textarea
                    id="moderatorNotes"
                    className="form-control bg-light text-dark border-secondary"
                    rows="3"
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    placeholder="Añade notas internas sobre la acción tomada o la revisión..."
                    disabled={isProcessing}
                  ></textarea>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button
                    className="btn btn-success btn-lg rounded-pill"
                    onClick={() => handleApplyVerdict(ReportStatus.RESOLVED)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill me-2"></i> Marcar como Resuelto
                      </>
                    )}
                  </button>
                  {/* Nuevo botón para aplicar sanción */}
                  <button
                    className="btn btn-danger btn-lg rounded-pill mt-2"
                    onClick={handleOpenSanctionModal}
                    disabled={isProcessing}
                  >
                    <i className="bi bi-shield-fill-exclamation me-2"></i> Aplicar Sanción
                  </button>
                </div>
              </>
            )}

            <div className="d-grid gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Sanción */}
      <SanctionModal
        show={showSanctionModal}
        onClose={handleCloseSanctionModal}
        onSanctionApplied={handleSanctionApplied}
        reportedUser={{
          id: report.reportedUserId,
          username: report.reportedUsername,
          avatar: report.reportedUserAvatar,
        }}
        reportId={report.id} // Pasa el ID del reporte para vincular la sanción
      />

      <style>{`
        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: 1050;
        }
        .text-dark { color: #212529 !important; }
        .bg-light { background-color: #f8f9fa !important; }
        .form-control { border-radius: 0.5rem; }
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </div>
  );
}