import React, { useState, useEffect } from 'react';
import { SanctionType, applySanction } from '@business/moderationService';

export default function SanctionModal({ show, onClose, onSanctionApplied, reportedUser, reportId }) {
  const [sanctionType, setSanctionType] = useState(SanctionType.BAND);
  const [reason, setReason] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); 
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setSanctionType(SanctionType.BAND);
      setReason('');
      setEndDate('');
      setIsProcessing(false); 
      setError('');
    }
  }, [show]);

  const handleApplySanction = async () => {
    setError('');
    if (!reason.trim()) {
      setError('La razón es obligatoria para aplicar una sanción.');
      return;
    }

    if (sanctionType === SanctionType.SUSPENSION && !endDate) {
      setError('La fecha de fin es obligatoria para una suspensión.');
      return;
    }

    setIsProcessing(true); 

    const sanctionData = {
      reportId: reportId,
      userId: reportedUser.id,
      type: sanctionType,
      startDate: new Date().toISOString(),
      endDate: sanctionType === SanctionType.SUSPENSION ? new Date(endDate).toISOString() : null,
      reason: reason,
    };

    try {
      const response = await applySanction(sanctionData);
      if (response)
      onSanctionApplied(response);
     
    } catch (err) {
      console.error('Error al aplicar la sanción:', err);
      if (err.message && err.message.includes('duplicate key value violates unique constraint "IX_Sanction_report_id"')) {
        setError('Ya existe una sanción aplicada para este reporte. No se pueden aplicar sanciones duplicadas.');
      } else {
        setError('No se pudo aplicar la sanción. Inténtalo de nuevo.');
      }
    } finally {
      setIsProcessing(false); 
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop-custom d-flex justify-content-center align-items-center">
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
        <div className="modal-content bg-white shadow rounded-4 p-4">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title text-primary fw-bold">Aplicar Sanción al Usuario</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isProcessing} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body pt-3 pb-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="text-center mb-4">
              <img src={reportedUser.avatar} alt={reportedUser.username} className="rounded-circle mb-2" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
              <h5 className="text-dark mb-0">{reportedUser.username}</h5>
              <small className="text-muted">ID: {reportedUser.id}</small>
            </div>

            <div className="mb-3">
              <label htmlFor="sanctionType" className="form-label">Tipo de Sanción:</label>
              <select
                id="sanctionType"
                className="form-select bg-light text-dark border-secondary"
                value={sanctionType}
                onChange={(e) => setSanctionType(e.target.value)}
                disabled={isProcessing} 
              >
                <option value={SanctionType.BAND}>Ban</option>
                <option value={SanctionType.SUSPENSION}>Suspensión</option>
              </select>
            </div>

            {sanctionType === SanctionType.SUSPENSION && (
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">Fecha de Fin (Suspensión):</label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control bg-light text-dark border-secondary"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isProcessing} 
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="reason" className="form-label">Razón:</label>
              <textarea
                id="reason"
                className="form-control bg-light text-dark border-secondary"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe la razón de la sanción..."
                disabled={isProcessing} 
              ></textarea>
            </div>

            <div className="d-grid gap-2 mt-4">
              <button
                className="btn btn-primary btn-lg rounded-pill"
                onClick={handleApplySanction}
                disabled={isProcessing} // El botón se deshabilita si isProcessing es true
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Aplicando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i> Aplicar Sanción
                  </>
                )}
              </button>
            </div>
            <div className="d-grid gap-2 mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill"
                onClick={onClose}
                disabled={isProcessing}
              >
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
          z-index: 1060;
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