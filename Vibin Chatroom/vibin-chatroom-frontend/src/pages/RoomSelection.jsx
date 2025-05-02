import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { io } from "socket.io-client";
import musicGif from "../assets/Music.gif";
import moviesGif from "../assets/Movie.gif";
import tvshowsGif from "../assets/Drama.gif";
import booksGif from "../assets/Music.gif";
import gamesGif from "../assets/Music.gif";
import beautyGif from "../assets/Music.gif";

export default function RoomSelection() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth0();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [socket, setSocket] = useState(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const roomGifs = {
    music: musicGif,
    movies: moviesGif,
    tvshows: tvshowsGif,
    books: booksGif,
    games: gamesGif,
    beauty: beautyGif
  };

  const allRooms = [
    { id: "music", name: "Music", emoji: "🎵", color: "from-purple-500 to-pink-500", gif: roomGifs.music },
    { id: "movies", name: "Movies", emoji: "🎬", color: "from-red-500 to-amber-500", gif: roomGifs.movies },
    { id: "tvshows", name: "TV Shows", emoji: "📺", color: "from-blue-500 to-cyan-500", gif: roomGifs.tvshows },
    { id: "books", name: "Books", emoji: "📚", color: "from-amber-500 to-orange-500", gif: roomGifs.books },
    { id: "games", name: "Games", emoji: "🎮", color: "from-green-500 to-emerald-500", gif: roomGifs.games },
    { id: "beauty", name: "Beauty", emoji: "💄", color: "from-rose-500 to-fuchsia-500", gif: roomGifs.beauty }
  ];

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // Handle authentication and nickname setup
  useEffect(() => {
    if (socket && isAuthenticated) {
      const savedNickname = localStorage.getItem('vibinNickname');
      const authNickname = user.nickname || user.name || user.email.split('@')[0];
      
      if (savedNickname) {
        socket.emit("set_username", savedNickname);
        setNickname(savedNickname);
      } else {
        setShowNicknameModal(true);
        setNickname(authNickname);
      }

      socket.emit("authenticate", user.sub);
    }
  }, [socket, isAuthenticated, user]);

  // Load rooms from localStorage and backend
  useEffect(() => {
    const loadRooms = async () => {
      const localRooms = JSON.parse(localStorage.getItem('vibinJoinedRooms') || '[]');
      
      if (isAuthenticated && user?.sub) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/users/${encodeURIComponent(user.sub)}/rooms`);
          const dbRooms = response.data.rooms || [];
          const allRooms = [...new Set([...localRooms, ...dbRooms])];
          setJoinedRooms(allRooms);
          await saveRoomsToBackend(user.sub, allRooms);
        } catch (error) {
          console.error("Failed to load rooms:", error);
          setJoinedRooms(localRooms);
        }
      } else {
        setJoinedRooms(localRooms);
      }
      setLoading(false);
    };

    loadRooms();
  }, [isAuthenticated, user?.sub]);

  // Save rooms to backend
  const saveRoomsToBackend = async (userId, rooms) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/rooms`,
        { rooms },
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Failed to save rooms:', error);
      throw error;
    }
  };

  // Sync rooms to localStorage and backend
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('vibinJoinedRooms', JSON.stringify(joinedRooms));
      if (isAuthenticated && user?.sub) {
        saveRoomsToBackend(user.sub, joinedRooms)
          .catch(err => console.error("Failed to save rooms:", err));
      }
    }
  }, [joinedRooms, loading, isAuthenticated, user?.sub]);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleRoom = (roomId) => {
    const newRooms = joinedRooms.includes(roomId)
      ? joinedRooms.filter(id => id !== roomId)
      : [...joinedRooms, roomId];
    setJoinedRooms(newRooms);
  };

  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      localStorage.setItem('vibinNickname', nickname);
      socket?.emit("set_username", nickname);
      setShowNicknameModal(false);
    }
  };

  const handleNicknameUpdate = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      localStorage.setItem('vibinNickname', nickname);
      socket?.emit("set_username", nickname);
      setEditingNickname(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-pink-600 to-indigo-800">
        <div className="text-white text-xl">Loading your vibes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden" style={{
      background: `linear-gradient(
        ${135 + position.x * 15}deg,
        rgba(126, 34, 206, 0.95) 0%,
        rgba(219, 39, 119, 0.95) 50%,
        rgba(79, 70, 229, 0.95) 100%
      )`,
      transition: 'background 0.3s ease-out'
    }}>
      {/* Nickname Modals */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 to-pink-800 p-6 rounded-2xl max-w-md w-full mx-4 border border-white/20 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Choose Your Nickname</h2>
            <form onSubmit={handleNicknameSubmit}>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                placeholder="Enter your nickname"
                maxLength="20"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const authNickname = user.nickname || user.name || user.email.split('@')[0];
                    setNickname(authNickname);
                    localStorage.setItem('vibinNickname', authNickname);
                    socket?.emit("set_username", authNickname);
                    setShowNicknameModal(false);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                  Use My Name
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
                >
                  Set Nickname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingNickname && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 to-pink-800 p-6 rounded-2xl max-w-md w-full mx-4 border border-white/20 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Edit Your Nickname</h2>
            <form onSubmit={handleNicknameUpdate}>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                placeholder="Enter your nickname"
                maxLength="20"
                required
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingNickname(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: `${Math.random() * 150 + 30}px`,
              height: `${Math.random() * 150 + 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translate(${position.x * 15}px, ${position.y * 15}px)`,
              animation: `float ${Math.random() * 8 + 8}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
            Vibin' Chatrooms 🎤
          </h1>
          {nickname && (
            <button 
              onClick={() => setEditingNickname(true)}
              className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
            >
              <span className="text-white">Hi, {nickname}</span>
            </button>
          )}
        </div>
        
        {/* Joined Rooms Section */}
        <div className="backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="bg-white/20 p-1 rounded-lg">🌟</span>
            Your Active Vibes
          </h2>
          
          {joinedRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRooms.filter(room => joinedRooms.includes(room.id)).map(room => (
                <div key={room.id} className={`bg-gradient-to-r ${room.color} p-0.5 rounded-xl hover:shadow-lg transition-all relative overflow-hidden`}>
                  <div className="absolute inset-0 w-full h-full opacity-20">
                    <img src={room.gif} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-gray-900/80 rounded-xl p-4 h-full relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-2xl">{room.emoji}</span>
                        <h3 className="text-xl font-semibold text-white mt-2">{room.name}</h3>
                      </div>
                      <button
                        onClick={() => navigate(`/rooms/${room.id}`)}
                        className="bg-white/90 hover:bg-white text-gray-900 px-4 py-1 rounded-lg text-sm font-medium transition-all"
                      >
                        Enter
                      </button>
                    </div>
                    <button
                      onClick={() => toggleRoom(room.id)}
                      className="mt-3 text-xs text-white/70 hover:text-white transition-colors"
                    >
                      Leave room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70 italic">You haven't joined any rooms yet</p>
          )}
        </div>

        {/* Explore Rooms Section */}
        <div className="backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="bg-white/20 p-1 rounded-lg">✨</span>
            Explore More Vibes
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRooms.filter(room => !joinedRooms.includes(room.id)).map(room => (
              <div key={room.id} className={`bg-gradient-to-r ${room.color} p-0.5 rounded-xl hover:shadow-lg transition-all relative overflow-hidden`}>
                <div className="absolute inset-0 w-full h-full opacity-20">
                  <img src={room.gif} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-gray-900/80 rounded-xl p-4 h-full relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl">{room.emoji}</span>
                      <h3 className="text-xl font-semibold text-white mt-2">{room.name}</h3>
                      <p className="text-white/60 text-sm mt-1">
                        {Math.floor(Math.random() * 500 + 50)} vibing now
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRoom(room.id)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-1 rounded-lg text-sm font-medium transition-all"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}