import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSessionManager from '@business/UserSessionManager';
import { getUserById } from '@business/userManagerService';
import NavbarLayout from '../components/NavbarLayout';
import UserSettingsModal from '../components/UserSettingsModal';

import { getAllReports } from '@business/moderationService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminControlPage() {
    const [user, setUser] = useState({ name: '', avatar: 'assets/default_avatar.jpg' });
    const [role, setRole] = useState(''); 
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const navigate = useNavigate();

    const [reportChartData, setReportChartData] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('month'); 
    const [loadingReports, setLoadingReports] = useState(true); 

    const processReportsForChart = (reportsData, period) => {
        const counts = {};

        reportsData.forEach(report => {
            const date = new Date(report.reportedAt);
            let key;

            if (period === 'month') {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            } else { 
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay()); 
                const year = startOfWeek.getFullYear();
                const dayOfYear = Math.floor((startOfWeek - new Date(year, 0, 0)) / (24 * 60 * 60 * 1000)); 
                const weekNum = Math.ceil(dayOfYear / 7); 
                key = `${year}-W${weekNum.toString().padStart(2, '0')}`;
            }

            counts[key] = (counts[key] || 0) + 1;
        });

        const sortedKeys = Object.keys(counts).sort();
        return sortedKeys.map(key => ({
            name: key,
            'Número de Reportes': counts[key]
        }));
    };

    useEffect(() => {
        const payload = UserSessionManager.getPayload();
        const userRole = payload?.role || '';
        setRole(userRole);

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

        if (userRole === 'admin' || userRole === 'moderator') {
            const fetchReportsForChart = async () => {
                setLoadingReports(true);
                try {
                    const allReports = await getAllReports();
                    setReportChartData(processReportsForChart(allReports, chartPeriod));
                } catch (error) {
                    console.error('Error fetching reports for chart:', error);
                    setReportChartData([]);
                } finally {
                    setLoadingReports(false);
                }
            };
            fetchReportsForChart();
        } else {
            setLoadingReports(false); 
        }
    }, [chartPeriod, role]); 

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
                <h3 className="text-center mb-4 fw-bold text-primary">
                    {role === 'admin' ? 'Panel de Administración' : 'Panel de Moderación'}
                </h3>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-4 mb-4">
                    {/* Botones de Navegación Condicionales */}

                    {/* Botones solo para Administrador */}
                    {role === 'admin' && (
                        <>
                            <div className="col">
                                <div className="card text-center shadow-sm p-3 h-100 d-flex flex-column justify-content-center admin-card" onClick={handleGameAdd}>
                                    <div className="card-body">
                                        <i className="bi bi-controller text-info mb-3" style={{ fontSize: '3.5rem' }}></i>
                                        <h5 className="card-title fw-bold text-dark">Agregar Juegos</h5>
                                        <p className="card-text text-muted">Añade nuevos títulos a la plataforma.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col">
                                <div className="card text-center shadow-sm p-3 h-100 d-flex flex-column justify-content-center admin-card" onClick={handleModeratorAdd}>
                                    <div className="card-body">
                                        <i className="bi bi-person-check text-success mb-3" style={{ fontSize: '3.5rem' }}></i>
                                        <h5 className="card-title fw-bold text-dark">Agregar Moderadores</h5>
                                        <p className="card-text text-muted">Otorga permisos de moderación a usuarios.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Botones para Administrador y Moderador */}
                    {(role === 'admin' || role === 'moderator') && (
                        <>
                            <div className="col">
                                <div className="card text-center shadow-sm p-3 h-100 d-flex flex-column justify-content-center admin-card" onClick={handleViewReports}>
                                    <div className="card-body">
                                        <i className="bi bi-flag text-danger mb-3" style={{ fontSize: '3.5rem' }}></i>
                                        <h5 className="card-title fw-bold text-dark">Ver Reportes</h5>
                                        <p className="card-text text-muted">Gestiona reportes de contenido y usuarios.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col">
                                <div className="card text-center shadow-sm p-3 h-100 d-flex flex-column justify-content-center admin-card" onClick={handleViewSanctions}>
                                    <div className="card-body">
                                        <i className="bi bi-shield-fill-x text-warning mb-3" style={{ fontSize: '3.5rem' }}></i>
                                        <h5 className="card-title fw-bold text-dark">Ver Sanciones</h5>
                                        <p className="card-text text-muted">Revisa las sanciones aplicadas a usuarios.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sección para Reportes con la Gráfica Integrada (Visible para Admin y Moderador) */}
                {(role === 'admin' || role === 'moderator') && (
                    <section className="pt-4 border-top">
                        <h4 className="text-primary mt-4 fw-bold">Análisis de Reportes</h4>
                        <div className="card shadow-sm p-4 bg-light rounded-3">
                            <p className="mb-4 text-dark">Esta sección muestra una visión general de los reportes recibidos, incluyendo una gráfica de su volumen a lo largo del tiempo. Puedes cambiar la vista para ver los reportes agrupados por mes o por semana.</p>
                            
                            <div className="mb-4">
                                <h5 className="text-dark fw-bold mb-3">Reportes por Período</h5>
                                <div className="d-flex justify-content-end mb-3">
                                    <div className="btn-group" role="group" aria-label="Chart Period">
                                        <input type="radio" className="btn-check" name="chartPeriod" id="chartMonth" autoComplete="off" checked={chartPeriod === 'month'} onChange={() => setChartPeriod('month')} />
                                        <label className="btn btn-outline-primary" htmlFor="chartMonth">Por Mes</label>

                                        <input type="radio" className="btn-check" name="chartPeriod" id="chartWeek" autoComplete="off" checked={chartPeriod === 'week'} onChange={() => setChartPeriod('week')} />
                                        <label className="btn btn-outline-primary" htmlFor="chartWeek">Por Semana</label>
                                    </div>
                                </div>
                                {loadingReports ? (
                                    <p className="text-muted text-center py-4">
                                        <span className="spinner-border text-primary me-2" role="status" aria-hidden="true"></span>
                                        Cargando datos de la gráfica...
                                    </p>
                                ) : reportChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={reportChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis dataKey="name" stroke="#666" />
                                            <YAxis allowDecimals={false} stroke="#666" />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Legend />
                                            <Bar dataKey="Número de Reportes" fill="#8884d8" name="Total de Reportes" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-muted text-center py-4">No hay datos de reportes para mostrar en la gráfica.</p>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <UserSettingsModal show={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

            {/* Estilos CSS adicionales */}
            <style>{`
                .admin-card {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    border: 1px solid #e0e0e0;
                    border-radius: 0.75rem;
                }
                .admin-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15) !important;
                }
                .admin-card .card-body {
                    padding: 2rem;
                }
                .admin-card .card-title {
                    font-size: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .admin-card .card-text {
                    font-size: 0.95rem;
                    min-height: 40px; /* Asegura altura mínima para texto */
                }
                .admin-card i {
                    color: var(--bs-primary); /* Default icon color */
                }
                /* Colores de íconos personalizados para cada tarjeta */
                .admin-card:nth-child(1) i { color: #0dcaf0; } /* Info - Juegos */
                .admin-card:nth-child(2) i { color: #198754; } /* Success - Moderadores */
                .admin-card:nth-child(3) i { color: #dc3545; } /* Danger - Reportes */
                .admin-card:nth-child(4) i { color: #ffc107; } /* Warning - Sanciones */

                /* Estilos para la gráfica */
                .recharts-wrapper {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .recharts-tooltip-wrapper .recharts-tooltip-item {
                    color: #333 !important;
                }
                .recharts-legend-wrapper .recharts-legend-item-text {
                    color: #555 !important;
                }
            `}</style>
        </NavbarLayout>
    );
}