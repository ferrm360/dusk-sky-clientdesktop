import React, { useEffect, useState } from 'react';
import NavbarLayout from '../components/NavbarLayout';
import {
    getFriends,
    getPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest
} from '@business/friendshipService';
import { getUserById } from '@business/userManagerService';
import { searchUsersByUsername, getUserById as getUserAuthData } from '@business/authService';
import UserSessionManager from '@business/UserSessionManager';
import { useNavigate } from 'react-router-dom';

export default function FriendPage() {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const currentUser = UserSessionManager.getPayload();
    const userId = currentUser?.sub || currentUser?._id; 

    useEffect(() => {
        console.log('Current user ID:', userId); 
        if (!userId) {
            console.error('No se ha encontrado el userId.');
            return;
        }
        fetchFriends(userId);  
        fetchPending(userId);  
    }, [userId]);

    const fetchFriends = async (userId) => {
        setLoading(true);
        try {
            const friendList = await getFriends(userId);  

            const detailedFriends = await Promise.all(
                friendList.map(async (f) => {
                    let friendId = f.sender_id === userId ? f.receiver_id : f.sender_id;
                    
                    const profile = await getUserById(friendId); 
                    const userData = await getUserAuthData(friendId); 
                    return {
                        id: friendId, 
                        username: userData?.username || 'Usuario',
                        avatar: profile.avatar_url || 'assets/default_avatar.jpg',
                    };
                })
            );

            setFriends(detailedFriends);
        } catch (error) {
            console.error('Error fetching friends:', error); 
            setFriends([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPending = async (userId) => {
        try {
            const requests = await getPendingRequests(userId); 
            const detailed = await Promise.all(
                requests.map(async (r) => {
                    const senderId = r.sender_id;
                    const receiverId = r.receiver_id;
                    const friendId = senderId === userId ? receiverId : senderId; 

                    const profile = await getUserById(friendId);
                    const userData = await getUserAuthData(friendId); 
                    return {
                        id: r.id,
                        sender_id: r.sender_id,
                        username: userData?.username || 'Usuario',
                        avatar: profile.avatar_url || 'assets/default_avatar.jpg'
                    };
                })
            );
            setPendingRequests(detailed);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            setPendingRequests([]);
        }
    };

    const handleSearch = async () => {
        if (search.trim().length < 1) return;

        try {
            const results = await searchUsersByUsername(search.trim());

            const detailed = await Promise.all(
                results
                    .filter((u) => u.id !== userId)  
                    .map(async (user) => {
                        const profile = await getUserById(user.id);  
                        return {
                            id: user.id,
                            username: user.username,
                            avatar: profile.avatar_url || 'assets/default_avatar.jpg',
                        };
                    })
            );

            setSearchResults(detailed);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        }
    };

    const filteredFriends = friends.filter((f) =>
        f.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <NavbarLayout>
            <div className="container py-5 bg-light text-dark min-vh-100 position-relative">
                <h2 className="text-primary mb-4">Amigos</h2>

                <div className="d-flex gap-2 mb-4" style={{ maxWidth: 500 }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar amigos o jugadores..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-outline-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                </div>

                {pendingRequests.length > 0 && (
                    <>
                        <h5 className="text-dark">Solicitudes pendientes</h5>
                        <div className="d-flex flex-wrap gap-3 mb-5">
                            {pendingRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="d-flex align-items-center border rounded p-2 shadow-sm"
                                    style={{ cursor: 'pointer', background: 'white', maxWidth: '220px' }}
                                    onClick={() => setSelectedRequest(req)}
                                >
                                    <img
                                        src={req.avatar}
                                        alt={req.username}
                                        className="rounded-circle me-2"
                                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                    />
                                    <span className="fw-semibold text-dark">{req.username}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {loading ? (
                    <p className="text-muted">Cargando amigos...</p>
                ) : (
                    <>
                        {friends.length > 0 ? (
                            <>
                                <h5 className="text-dark">Tus amigos</h5>
                                <div className="row g-4 mb-5">
                                    {filteredFriends.map((friend) => (
                                        <div key={friend.id} className="col-6 col-md-4 col-lg-3">
                                            <div
                                                className="card text-center shadow-sm game-card-hover border-success border-2"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/profile/${friend.id}`)}
                                            >
                                                <img
                                                    src={friend.avatar}
                                                    alt={friend.username}
                                                    className="card-img-top"
                                                    style={{ height: '180px', objectFit: 'cover' }}
                                                />
                                                <div className="card-body">
                                                    <h6 className="card-title m-0 text-success">{friend.username}</h6>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted mt-5">
                                <h5>Ups, no tienes amigos aún.</h5>
                                <p>Empieza buscando a alguien con el campo de arriba.</p>
                            </div>
                        )}
                    </>
                )}

                {searchResults.length > 0 && (
                    <>
                        <h5 className="text-dark">Jugadores encontrados</h5>
                        <div className="row g-4">
                            {searchResults.map((user) => (
                                <div key={user.id} className="col-6 col-md-4 col-lg-3">
                                    <div
                                        className="card text-center shadow-sm game-card-hover"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/profile/${user.id}`)}
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.username}
                                            className="card-img-top"
                                            style={{ height: '180px', objectFit: 'cover' }}
                                        />
                                        <div className="card-body">
                                            <h6 className="card-title m-0">{user.username}</h6>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {selectedRequest && (
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
                    >
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '560px' }}>
                            <div className="modal-content bg-white shadow rounded-3 p-4">
                                <div className="modal-header">
                                    <h5 className="modal-title">Solicitud de amistad</h5>
                                    <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)} />
                                </div>
                                <div className="modal-body text-center">
                                    <img
                                        src={selectedRequest.avatar}
                                        alt={selectedRequest.username}
                                        className="rounded-circle mb-3"
                                        style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                                    />
                                    <p><strong>{selectedRequest.username}</strong> quiere ser tu amigo.</p>
                                </div>
                                <div className="modal-footer justify-content-center gap-3">
                                    <button
                                        className="btn"
                                        style={{ backgroundColor: '#2b466e', color: 'white' }}
                                        onClick={async () => {
                                            await acceptFriendRequest(selectedRequest.id);
                                            setPendingRequests(p => p.filter(r => r.id !== selectedRequest.id));
                                            setSelectedRequest(null);
                                        }}
                                    >
                                        Aceptar
                                    </button>
                                    <button
                                        className="btn btn-outline-dark"
                                        onClick={async () => {
                                            await rejectFriendRequest(selectedRequest.id);
                                            setPendingRequests(p => p.filter(r => r.id !== selectedRequest.id));
                                            setSelectedRequest(null);
                                        }}
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </NavbarLayout>
    );
}
