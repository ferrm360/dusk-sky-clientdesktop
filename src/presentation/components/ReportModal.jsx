import React, { useState, useEffect } from 'react';
import { createReport, ReportContentType, ReportStatus } from '@business/moderationService'; 
import UserSessionManager from '@business/UserSessionManager'; 


export default function ReportModal({
  show,
  onClose,
  reportedContentId,
  contentType,
  reportedUsername,
  reportedAuthorId,
  onReportSuccess
}) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const currentUserId = UserSessionManager.getPayload()?.sub || UserSessionManager.getPayload()?._id;

  useEffect(() => {
    if (show) {
      setReason('');
      setIsSubmitting(false);
      setSubmitError('');
      setSubmitSuccess(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      setSubmitError('Debes iniciar sesión para reportar contenido.');
      return;
    }

    if (!reason.trim()) {
      setSubmitError('Por favor, describe la razón del reporte.');
      return;
    }

  

    setIsSubmitting(true);
    setSubmitError('');

    const reportData = {
      reportedUserId: reportedAuthorId, 
      contentType: contentType,
      reason: reason.trim(),
    };

    try {
      await createReport(reportData);
      setSubmitSuccess(true);
      if (onReportSuccess) {
        onReportSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error al enviar reporte:', err);
      setSubmitError('Hubo un error al enviar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  const contentDisplayName = {
    [ReportContentType.COMMENT]: 'comentario',
    [ReportContentType.REVIEW]: 'reseña',
    [ReportContentType.PROFILE]: 'perfil'
  }[contentType] || 'contenido';

  return (
    <div className="modal-backdrop-custom d-flex justify-content-center align-items-center">
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
        <div className="modal-content bg-white shadow rounded-4 p-4">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title text-danger fw-bold">Reportar {contentDisplayName}</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body pt-3 pb-4">
            {submitSuccess ? (
              <div className="text-center text-success">
                <i className="bi bi-check-circle-fill display-4 mb-3"></i>
                <p className="lead">¡Reporte enviado con éxito!</p>
                <p className="text-muted">Gracias por ayudarnos a mantener la comunidad segura. Tu reporte será revisado por nuestro equipo de moderación.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-dark mb-3">Estás a punto de reportar el {contentDisplayName} de **{reportedUsername || 'un usuario desconocido'}**.</p>
                <div className="mb-3">
                  <label htmlFor="reason" className="form-label fw-semibold">Razón del reporte:</label>
                  <textarea
                    id="reason"
                    className="form-control bg-light text-dark border-secondary"
                    rows="4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`Describe por qué estás reportando esta ${contentDisplayName}...`}
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                {submitError && <div className="alert alert-danger small mt-3">{submitError}</div>}
                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-danger btn-lg rounded-pill"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-flag-fill me-2"></i> Enviar Reporte
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Estilos CSS personalizados (se pueden mover a CSS global) */}
      <style>{`
        .modal-backdrop-custom { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); z-index: 1050; }
        .text-dark { color: #212529 !important; }
        .bg-light { background-color: #f8f9fa !important; }
        .form-control { border-radius: 0.5rem; }
        .form-control:focus { border-color: #dc3545; box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25); }
      `}</style>
    </div>
  );
}