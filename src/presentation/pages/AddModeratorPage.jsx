import React, { useEffect, useState, useCallback } from 'react'; // Import useCallback
import NavbarLayout from '../components/NavbarLayout';
import { searchUsersByUsername, getUserById as getUserAuthData } from '@business/authService';
import { getUserById } from '@business/userManagerService';
import { promoteUser, demoteUser } from '@business/authService';
import UserSessionManager from '@business/UserSessionManager';
import { useNavigate } from 'react-router-dom';

export default function AddModeratorPage() {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const navigate = useNavigate();

    const currentUser = UserSessionManager.getPayload();
    const userId = currentUser?.sub || currentUser?._id;

    useEffect(() => {
        if (!userId) {
            console.error('No se ha encontrado el userId.');
            return;
        }
    }, [userId]);

   
    const handleSearch = useCallback(async (searchQuery) => {
        if (searchQuery.trim().length < 1) {
            setSearchResults([]); 
            return;
        }

        try {
            setLoading(true); 
            const results = await searchUsersByUsername(searchQuery.trim());

            const detailed = await Promise.all(
                results
                    .filter((u) => u.id !== userId)
                    .map(async (user) => {
                        const profile = await getUserById(user.id);
                        return {
                            id: user.id,
                            username: user.username,
                            avatar: profile.avatar_url || 'assets/default_avatar.jpg',
                            role: user.role || 'user',
                        };
                    })
            );

            setSearchResults(detailed);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        } finally {
            setLoading(false); 
        }
    }, [userId]); 

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(search);
        }, 300); 

        return () => clearTimeout(timeoutId); 
    }, [search, handleSearch]); 

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setActionType(user.role === 'moderator' ? 'demote' : 'promote');
        setShowModal(true);
    };

    const handleModalConfirm = async () => {
        setShowModal(false); 

        if (!selectedUser) return;

        try {
            if (actionType === 'promote') {
                console.log(`Promoting user ${selectedUser.username} to moderator`);
                await promoteUser(selectedUser.id);
                alert(`El usuario ${selectedUser.username} ha sido promovido a moderador.`);
            } else if (actionType === 'demote') {
                console.log(`Demoting user ${selectedUser.username} from moderator`);
                await demoteUser(selectedUser.id);
                alert(`El usuario ${selectedUser.username} ha sido despromovido de moderador.`);
            }
            
            handleSearch(search); 
            
        } catch (error) {
            console.error(`Error during ${actionType} action:`, error);
            alert(`Hubo un error al ${actionType === 'promote' ? 'promover' : 'despromover'} al usuario.`);
        } finally {
            setSelectedUser(null);
        }
    };

    const handleModalCancel = () => {
        setShowModal(false);
        setSelectedUser(null); 
    };

    return (
        <NavbarLayout>
            <div className="container py-5 bg-light text-dark min-vh-100 position-relative">
                <h2 className="text-primary mb-4">Buscar Usuarios para Agregar como Moderadores</h2>

                <div className="d-flex gap-2 mb-4" style={{ maxWidth: 500 }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Busca un usuario..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>

                {loading && search.length > 0 && (
                    <div className="text-center mt-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                )}

                {!loading && searchResults.length > 0 ? (
                    <div className="row g-4">
                        {searchResults.map((user) => (
                            <div key={user.id} className="col-6 col-md-4 col-lg-3">
                                <div
                                    className={`card text-center shadow-sm game-card-hover ${user.role === 'moderator' ? 'border-warning' : 'border-success'}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.username}
                                        className="card-img-top"
                                        style={{ height: '180px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body">
                                        <h6 className={`card-title m-0 ${user.role === 'moderator' ? 'text-warning' : 'text-success'}`}>
                                            {user.username}
                                        </h6>
                                        <small className="text-muted">{user.role === 'moderator' ? 'Moderador' : 'Usuario'}</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !loading && search.length > 0 && searchResults.length === 0 ? (
                     <div className="text-center text-muted mt-5">
                         <h5>No se encontraron usuarios que coincidan con "{search}".</h5>
                     </div>
                 ) : (
                    <div className="text-center text-muted mt-5">
                        <h5>Empieza a escribir para buscar usuarios.</h5>
                    </div>
                )}
            </div>

            {/* Modal de Confirmación */}
            {showModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '560px' }}>
                        <div className="modal-content bg-white shadow rounded-3 p-4">
                            <div className="modal-header">
                                <h5 className="modal-title">{actionType === 'promote' ? 'Hacer moderador' : 'Quitar moderador'}</h5>
                                <button type="button" className="btn-close" onClick={handleModalCancel} />
                            </div>
                            <div className="modal-body text-center">
                                <img
                                    src={selectedUser?.avatar}
                                    alt={selectedUser?.username}
                                    className="rounded-circle mb-3"
                                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                                />
                                <p>
                                    {actionType === 'promote'
                                        ? `¿Estás seguro de que deseas convertir a ${selectedUser?.username} en moderador?`
                                        : `¿Estás seguro de que deseas quitar a ${selectedUser?.username} el rol de moderador?`}
                                </p>
                            </div>
                            <div className="modal-footer justify-content-center gap-3">
                                <button
                                    className="btn"
                                    style={{ backgroundColor: '#2b466e', color: 'white' }}
                                    onClick={handleModalConfirm}
                                >
                                    Aceptar
                                </button>
                                <button
                                    className="btn btn-outline-dark"
                                    onClick={handleModalCancel}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </NavbarLayout>
    );
}