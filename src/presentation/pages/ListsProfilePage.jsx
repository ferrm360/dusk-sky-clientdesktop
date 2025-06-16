import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '@business/userManagerService';
import UserSessionManager from '@business/UserSessionManager';

export default function ListProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);

  const payload = UserSessionManager.getPayload();
  const loggedUserId = payload?._id;
  const realId = userId === 'me' ? loggedUserId : userId;

  useEffect(() => {
    if (!realId) return;
    getUserById(realId).then(setProfile).catch(console.error);
  }, [realId]);

  return (
    <div className="container mt-4">
      <h5 className="text-primary mb-3">Mis listas</h5>
      <div className="d-flex gap-4 overflow-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="card shadow-sm border-0 bg-light text-dark" style={{ width: '260px' }}>
            <img src="/assets/sample_list.jpg" className="card-img-top" alt="Lista" />
            <div className="card-body">
              <h6 className="card-title fw-bold">Nombre de la lista {i}</h6>
              <p className="card-text">Descripción breve de la lista {i}.</p>
              <span className="badge bg-primary">{Math.floor(Math.random() * 10 + 1)} juegos</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
