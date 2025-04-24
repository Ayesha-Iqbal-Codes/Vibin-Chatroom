import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const roomThemes = {
  music: {
    emoji: "🎵",
    name: "Music Lovers",
    gradient: "from-purple-600 to-pink-600",
    bg: "bg-gradient-to-br from-purple-900/90 to-pink-900/90",
    text: "text-white",
    messageGradient: "from-purple-500 to-pink-500",
    border: "border-purple-400/20"
  },
  movies: {
    emoji: "🎬",
    name: "Movie Buffs",
    gradient: "from-red-600 to-amber-600",
    bg: "bg-gradient-to-br from-red-900/90 to-amber-900/90",
    text: "text-white",
    messageGradient: "from-red-500 to-amber-500",
    border: "border-red-400/20"
  },
  tvshows: {
    emoji: "📺",
    name: "TV Show Fanatics",
    gradient: "from-blue-600 to-cyan-600",
    bg: "bg-gradient-to-br from-blue-900/90 to-cyan-900/90",
    text: "text-white",
    messageGradient: "from-blue-500 to-cyan-500",
    border: "border-blue-400/20"
  },
  books: {
    emoji: "📚",
    name: "Book Worms",
    gradient: "from-amber-600 to-orange-600",
    bg: "bg-gradient-to-br from-green-900/90 to-red-900/90",
    text: "text-white",
    messageGradient: "from-amber-500 to-orange-500",
    border: "border-amber-400/20"
  },
  games: {
    emoji: "🎮",
    name: "Gamers",
    gradient: "from-green-600 to-emerald-600",
    bg: "bg-gradient-to-br from-green-900/90 to-emerald-900/90",
    text: "text-white",
    messageGradient: "from-green-500 to-emerald-500",
    border: "border-green-400/20"
  },
  beauty: {
    emoji: "💄",
    name: "Beauty Enthusiasts",
    gradient: "from-rose-600 to-fuchsia-600",
    bg: "bg-gradient-to-br from-rose-900/90 to-fuchsia-900/90",
    text: "text-white",
    messageGradient: "from-rose-500 to-fuchsia-500",
    border: "border-rose-400/20"
  }
};

export default function ChatRoom() {
  const { roomName } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersOnline, setUsersOnline] = useState([]);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(localStorage.getItem('vibinNickname') || '');
  const messagesEndRef = useRef(null);

  // Debugging room name
  console.log("Current room from URL:", roomName);
  
  // Strict theme selection with error handling
  const theme = roomThemes[roomName?.toLowerCase()];
  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Invalid room: {roomName}. Please select a valid room.
      </div>
    );
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log("Joining room:", roomName);
    
    // Set up nickname from localStorage
    const savedNickname = localStorage.getItem('vibinNickname');
    if (savedNickname) {
      setNickname(savedNickname);
      socket.emit("set_username", savedNickname);
    }

    // Join room and set up event listeners
    socket.emit("join_room", roomName.toLowerCase()); // Ensure consistent casing

    socket.on("previous_messages", (msgs) => {
      console.log("Received previous messages:", msgs.length);
      setMessages(msgs);
    });

    socket.on("receive_message", (msg) => {
      if (msg.room === roomName.toLowerCase()) { // Filter messages by room
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("users_in_room", (users) => {
      setUsersOnline(users);
    });

    socket.on("user_joined", (user) => {
      setUsersOnline(prev => [...prev, user]);
    });

    socket.on("user_left", (userId) => {
      setUsersOnline(prev => prev.filter(u => u.id !== userId));
    });

    return () => {
      console.log("Leaving room:", roomName);
      socket.off("previous_messages");
      socket.off("receive_message");
      socket.off("users_in_room");
      socket.off("user_joined");
      socket.off("user_left");
      socket.emit("leave_room", roomName.toLowerCase());
    };
  }, [roomName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (input.trim()) {
      const msg = {
        room: roomName.toLowerCase(), // Consistent room naming
        text: input,
        sender: socket.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        username: nickname || `User-${socket.id.slice(0, 4)}`
      };
      console.log("Sending message to room:", msg.room);
      socket.emit("send_message", msg);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNicknameUpdate = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      localStorage.setItem('vibinNickname', nickname);
      socket.emit("set_username", nickname);
      setEditingNickname(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${theme.bg}`}>
      {/* Nickname Edit Modal (unchanged) */}
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

      {/* Header with room info */}
      <div className={`w-full max-w-4xl ${theme.gradient} rounded-t-2xl p-4 shadow-lg relative`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{theme.emoji}</span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">{theme.name}</h1>
              <div className="flex items-center gap-1 text-xs text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{usersOnline.length} {usersOnline.length === 1 ? 'person' : 'people'} vibing</span>
              </div>
            </div>
          </div>
          
          {nickname && (
            <button 
              onClick={() => setEditingNickname(true)}
              className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-white text-sm hover:bg-black/30 transition"
            >
              <span>Hi, {nickname}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chat container */}
      <div className={`w-full max-w-4xl bg-gray-900/70 border ${theme.border} rounded-b-2xl shadow-xl flex flex-col h-[70vh] backdrop-blur-sm`}>
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="text-5xl mb-4">{theme.emoji}</div>
              <h3 className="text-xl font-medium">Welcome to {theme.name}!</h3>
              <p className="text-sm mt-1">Be the first to start the conversation</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === socket.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-2xl p-4 ${msg.sender === socket.id 
                    ? `bg-gradient-to-r ${theme.messageGradient} text-white shadow-md` 
                    : "bg-gray-800/90 text-white backdrop-blur-sm"}`}
                >
                  {msg.sender !== socket.id && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-300">
                        {msg.username || `User-${msg.sender.slice(0, 4)}`}
                      </span>
                    </div>
                  )}
                  <div className="break-words text-sm md:text-base">{msg.text}</div>
                  <div className={`text-xs mt-2 ${msg.sender === socket.id ? "text-white/70 text-right" : "text-gray-400"}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder={`Message ${theme.name.toLowerCase()}...`}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`px-4 py-3 rounded-xl font-medium transition-all bg-gradient-to-r ${theme.messageGradient} ${!input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'} text-white`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-5"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}