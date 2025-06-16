import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserSettingsModal from '../components/UserSettingsModal';
import UserSessionManager from '@business/UserSessionManager';
import { getUserById } from '@business/userManagerService';

export default function NavbarLayout({ children }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState({ name: '', avatar: 'assets/default_avatar.jpg' });
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    // Obtener el payload del usuario y la información del usuario
    useEffect(() => {
        const payload = UserSessionManager.getPayload();
        if (payload?._id) {
            setRole(payload.role);
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

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed.length < 2) {
            alert("Por favor ingresa al menos 2 caracteres.");
            return;
        }
        navigate(`/search?query=${encodeURIComponent(trimmed)}&page=1`);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleTabRedirect = (tab) => {
        navigate(`/profile/me?tab=${tab}`);
        setShowDropdown(false);
    };

    const handleOpenSettings = () => {
        setShowSettingsModal(true);
        setShowDropdown(false);
    };

    const handleLogout = () => {
        UserSessionManager.clearToken();
        navigate('/login');
    };

    return (
        <div className="bg-light text-dark min-vh-100">
            <nav className="navbar navbar-expand-lg px-4 fixed-top" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', color: '#000', zIndex: 1040 }}>
                <Link to="/" className="navbar-brand fw-bold text-dark d-flex align-items-center" style={{ textDecoration: 'none' }}>
                    <img src="/assets/logo.png" alt="Logo" width="32" height="32" className="me-2" />
                    Dusk Sky
                </Link>

                <div className="collapse navbar-collapse">
                    <form className="d-flex me-3" role="search" onSubmit={handleSearch}>
                        <input
                            className="form-control me-2 rounded-3 bg-white text-dark border-0"
                            type="search"
                            placeholder="Buscar juegos..."
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ backdropFilter: 'blur(8px)', width: 180, backgroundColor: 'rgba(255,255,255,0.7)' }}
                        />
                        <button
                            type="submit"
                            className="px-4 py-1 fw-semibold"
                            style={{
                                backgroundColor: 'rgba(41, 92, 155, 0.7)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                color: 'white',
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                transition: 'background-color 0.3s ease, transform 0.1s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(41, 92, 155, 0.85)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(41, 92, 155, 0.7)')}
                        >
                            Buscar
                        </button>
                    </form>

                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item"><Link className="nav-link text-dark fw-semibold" to="/allGames">Juegos</Link></li>
                        <li className="nav-item"><Link className="nav-link text-dark" to="/allList">Listas</Link></li>
                        <li className="nav-item"><Link className="nav-link text-dark" to="/friend">Amigos</Link></li>
                        {role === 'admin' && (
                            <li className="nav-item"><Link className="nav-link text-dark" to="/admin">Control de Administrador</Link></li>
                        )}

                        {role === 'moderator' && (
                            <li className="nav-item"><Link className="nav-link text-dark" to="/admin">Control de Moderación</Link></li>
                        )}

                    </ul>
                </div>

                <div className="position-relative" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center bg-white text-dark rounded px-2 py-1">
                        <img src={user.avatar} alt="Avatar" width="32" height="32" className="rounded-circle me-2" />
                        <strong>{user.name}</strong>
                    </div>
                    {showDropdown && (
                        <ul className="dropdown-menu dropdown-menu-end show position-absolute mt-2" style={{ right: 0 }}>
                            <li><Link className="dropdown-item" to="/">Inicio</Link></li>
                            <li><Link className="dropdown-item" to="/profile/me">Perfil</Link></li>
                            <li><hr className="dropdown-divider" /></li>
                            {/* <li><button className="dropdown-item" onClick={handleOpenSettings}>Configuración</button></li> */}
                            <li><button className="dropdown-item text-danger fw-bold" onClick={handleLogout}>Cerrar sesión</button></li>
                            {role === 'moderator' && (
                                <li><Link className="dropdown-item" to="/moderation">Moderación</Link></li>
                            )}
                        </ul>
                    )}
                </div>
            </nav>

            <main style={{ marginTop: '56px' }}>
                {children}
            </main>

            <UserSettingsModal show={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </div>
    );
}
