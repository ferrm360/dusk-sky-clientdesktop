import React, { useState, useEffect  } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage'; 
import GameProfilePage from './pages/GamesProfilePage'; 
import ListsProfilePage from './pages/ListsProfilePage';
import AllGamesPages from './pages/AllGamesPage';
import ListPage from './pages/ListPage';
import GameDetail from './pages/GameDetail';
import SearchResultsPage from './pages/SearchResultsPage';
import FriendPage from './pages/FriendPage';
import ActivityProfilePage from './pages/ActivityProfilePage';
import AdminControlPage from './pages/AdminControlPage';
import AddGamePage from './pages/AddGame';
import AddModeratorPage from './pages/AddModeratorPage';
import ReportsPage from './pages/ReportsPage';
import SanctionsPage from './pages/SanctionsPage';
import ReviewDetailsPage from './pages/ReviewDetailsPage'; 
import GameListPage from './pages/GameListPage'; 
import CreateListPage from './pages/CreateListPage';
import UserSessionManager from '@business/UserSessionManager'; 




export default function App() {
  const [loggedInStatus, setLoggedInStatus] = useState(UserSessionManager.isLoggedIn()); 

    useEffect(() => {
    const handleSessionChange = () => {
      setLoggedInStatus(UserSessionManager.isLoggedIn());
    };

    UserSessionManager.eventTarget.addEventListener('sessionChanged', handleSessionChange);

    return () => {
      UserSessionManager.eventTarget.removeEventListener('sessionChanged', handleSessionChange);
    };
  }, []); 

  return (
    <Router>
      <Routes>
        {!loggedInStatus  ? (
          <>
            <Route path="/login" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />}>
              <Route index element={<ActivityProfilePage />} />
              <Route path="watchlist" element={<GameProfilePage />} />
              <Route path="likes" element={<GameProfilePage />} />
              <Route path="reviews" element={<GameProfilePage />} />
              <Route path="lists" element={<ListsProfilePage />} />
            </Route>

            <Route path="/gameProfile" element={<GameProfilePage />} />
            <Route path="/listProfile" element={<ListsProfilePage />} />
            <Route path="/allGames" element={<AllGamesPages />} />
            <Route path="/allList" element={<ListPage />} />
            <Route path="/juegos/:name" element={<GameDetail />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/friend" element={<FriendPage />} />
            <Route path="/admin" element={<AdminControlPage />} />
            <Route path="/admin/addGame" element={<AddGamePage />} />
            <Route path="/admin/addModerator" element={<AddModeratorPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/sanctions" element={<SanctionsPage />} />
            <Route path="/game/:gameId/review/:reviewId" element={<ReviewDetailsPage />} />
            <Route path="/lists/:id" element={<GameListPage />} /> 
            <Route path="/lists/new" element={<CreateListPage />} /> 



            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
