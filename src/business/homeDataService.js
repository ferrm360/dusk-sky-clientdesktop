import { get } from '@data/apiClient';
import UserSessionManager from './UserSessionManager';
import { popularGamesFallback } from './games/popularGames';
import { getReviewsFromFriends } from './reviewService'; 
import { getFriends } from './friendshipService';
import { getUserById } from '@business/usermanagerService';
import { getUserById as getUserFromAuth } from '@business/authService';
import { getGameById } from '@business/gameService';

const FRIENDS_URL = '/friendships/user/';
const REVIEWS_TOP_URL = '/reviews/top?limit=6';
const REVIEWS_FRIENDS_URL = '/reviews/friends';

export async function fetchHomeData(userId) {
  try {
    const friends = await getFriends(userId);

    const friendIds = friends.filter(f => f.receiver_id !== userId || f.sender_id !== userId) 
                              .map(f => f.receiver_id === userId ? f.sender_id : f.receiver_id); 

    let reviews = [];
    let games = [];

    const hasFriends = friendIds.length > 0;

    if (hasFriends) {
      reviews = await getReviewsFromFriends(friendIds, 6);
    } else {
      reviews = await get(REVIEWS_TOP_URL);
    }

    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        let user, game;

        try {
          user = await getUserById(review.userId);
        } catch (error) {
          console.error('Error obteniendo datos de usuario:', error);
          user = { username: 'Usuario', avatar_url: '/assets/default_avatar.jpg' }; 
        }

        let userName = '';
        try {
          const userFromAuth = await getUserFromAuth(review.userId);
          userName = userFromAuth.username || 'Usuario';
        } catch (error) {
          console.error('Error obteniendo datos de auth:', error);
        }

        let avatar = '/assets/default_avatar.jpg'; 
        if (user.avatar_url) avatar = user.avatar_url; 

        try {
          game = await getGameById(review.gameId);
          console.log('game',game);
        } catch (error) {
          console.error('Error obteniendo datos de juego:', error);
          game = { name: 'Juego desconocido', headerUrl: '/assets/game_placeholder.png' }; 
        }

        return {
          ...review,
          username: userName,
          avatar: avatar, 
          gameTitle: game.name,
          gameImage: game.headerUrl
        };
      })
    );
    games = popularGamesFallback;

    return { hasFriends, reviews: enrichedReviews, games };
  } catch (err) {
    console.error('Error cargando datos del home:', err);
    return { hasFriends: false, reviews: [], games: popularGamesFallback };
  }
}
