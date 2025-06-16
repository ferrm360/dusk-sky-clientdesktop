import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ProfileSubnav({ user, activeTab }) {
  const navigate = useNavigate();
  const { userId } = useParams();

  const tabs = [
    { key: 'games', label: 'Activity' },
    { key: 'watchlist', label: 'Watchlist' },
    { key: 'likes', label: 'Likes' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'lists', label: 'Lists' }
  ];

  const handleTabClick = (key) => {
    const suffix = key === 'games' ? '' : `/${key}`;
    navigate(`/profile/${userId}${suffix}`);
  };

  return (
    <div className="bg-black text-white border-bottom px-4 py-2 d-flex align-items-center" style={{ zIndex: 1030 }}>
      <img src={user.avatar} alt="Avatar" className="rounded-circle me-3" width="32" height="32" />
      <strong className="me-4">{user.name}</strong>
      <ul className="nav">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.key}>
            <button
              className={`nav-link btn btn-link px-3 ${activeTab === tab.key ? 'text-success fw-bold border-bottom border-success' : 'text-light'}`}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
