import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSessionManager from '@business/UserSessionManager';
import { getUserById } from '@business/userManagerService';
import NavbarLayout from '../components/NavbarLayout';
import UserSettingsModal from '../components/UserSettingsModal'; 

export default function AdminControlPage() {
    const [user, setUser] = useState({ name: '', avatar: 'assets/default_avatar.jpg' });
    const [role, setRole] = useState('');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const payload = UserSessionManager.getPayload();
        setRole(payload?.role || '');
        if (payload?._id) {
            getUserById(payload._id)
                .then((res) => {
                    setUser({
                        name: payload.username || 'Usuario',
                        avatar: res.avatar_url || 'assets/default_avatar.jpg',
                    });
                })
                .catch(() => {
                    setUser({ name: payload?.username || 'Usuario', avatar: 'assets/default_avatar.jpg' });
                });
        }
    }, []);

    const handleGameAdd = () => {
        navigate('/admin/addGame');
    };

    const handleModeratorAdd = () => {
        navigate('/admin/addModerator');
    };

    const handleViewReports = () => {
        navigate('/admin/reports');
    };

    const handleViewSanctions = () => {
        navigate('/admin/sanctions');
    };

    return (
        <NavbarLayout user={user} showSettingsModal={showSettingsModal} setShowSettingsModal={setShowSettingsModal}>
            <div className="container py-5">
                <h3 className="text-center mb-4 fw-bold text-primary">Panel de Administración</h3>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-4 mb-4">
                    {/* Agregar juegos */}
                    <div className="col">
                        <div className="card text-center shadow-sm" style={{ cursor: 'pointer' }} onClick={handleGameAdd}>
                            <div className="card-body">
                                <h5 className="card-title">Agregar Juegos</h5>
                                <p className="card-text">Haz clic aquí para agregar nuevos juegos a la plataforma.</p>
                                <i className="bi bi-controller" style={{ fontSize: '3rem' }}></i> {/* Ícono de control */}
                            </div>
                        </div>
                    </div>

                    {/* Agregar moderadores */}
                    <div className="col">
                        <div className="card text-center shadow-sm" style={{ cursor: 'pointer' }} onClick={handleModeratorAdd}>
                            <div className="card-body">
                                <h5 className="card-title">Agregar Moderadores</h5>
                                <p className="card-text">Haz clic aquí para agregar nuevos moderadores.</p>
                                <i className="bi bi-person-check" style={{ fontSize: '3rem' }}></i> {/* Ícono de persona */}
                            </div>
                        </div>
                    </div>

                    {/* Ver reportes */}
                    <div className="col">
                        <div className="card text-center shadow-sm" style={{ cursor: 'pointer' }} onClick={handleViewReports}>
                            <div className="card-body">
                                <h5 className="card-title">Ver Reportes</h5>
                                <p className="card-text">Haz clic aquí para ver todos los reportes.</p>
                                <i className="bi bi-file-earmark-earphones" style={{ fontSize: '3rem' }}></i> {/* Ícono de reporte */}
                            </div>
                        </div>
                    </div>

                    {/* Ver sanciones */}
                    <div className="col">
                        <div className="card text-center shadow-sm" style={{ cursor: 'pointer' }} onClick={handleViewSanctions}>
                            <div className="card-body">
                                <h5 className="card-title">Ver Sanciones</h5>
                                <p className="card-text">Haz clic aquí para ver las sanciones aplicadas.</p>
                                <i className="bi bi-pen-fill" style={{ fontSize: '3rem' }}></i> {/* Ícono de sanción */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección para Reportes */}
                <section className="pt-4 border-top">
                    <h4 className="text-primary mt-4">Reporte de reportes por jugadores</h4>
                    <div className="card shadow-sm p-4">
                        <p>En esta sección podrás ver los reportes realizados por los jugadores. Aquí se pueden manejar las acciones necesarias para los reportes, incluyendo aprobación o eliminación de contenido.</p>
                    </div>
                </section>
            </div>

            <UserSettingsModal show={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </NavbarLayout>
    );
}
