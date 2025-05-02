import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { EmojiButton } from "../components/EmojiPicker";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const roomThemes = {
  music: {
    emoji: "🎵",
    name: "Music Lovers",
    dark: {
      gradient: "from-purple-600 to-pink-600",
      bg: "bg-gradient-to-br from-purple-900/90 to-pink-900/90",
      text: "text-white",
      messageGradient: "from-purple-500 to-pink-500",
      border: "border-purple-400/20"
    },
    light: {
      gradient: "from-purple-300 to-pink-300",
      bg: "bg-gradient-to-br from-purple-100/90 to-pink-100/90",
      text: "text-purple-900",
      messageGradient: "from-purple-200 to-pink-200",
      border: "border-purple-300/50"
    }
  },
  movies: {
    emoji: "🎬",
    name: "Movie Buffs",
    dark: {
      gradient: "from-red-600 to-amber-600",
      bg: "bg-gradient-to-br from-red-900/90 to-amber-900/90",
      text: "text-white",
      messageGradient: "from-red-500 to-amber-500",
      border: "border-red-400/20"
    },
    light: {
      gradient: "from-red-300 to-amber-300",
      bg: "bg-gradient-to-br from-red-100/90 to-amber-100/90",
      text: "text-red-900",
      messageGradient: "from-red-200 to-amber-200",
      border: "border-red-300/50"
    }
  },
  tvshows: {
    emoji: "📺",
    name: "TV Show Fanatics",
    dark: {
      gradient: "from-blue-600 to-cyan-600",
      bg: "bg-gradient-to-br from-blue-900/90 to-cyan-900/90",
      text: "text-white",
      messageGradient: "from-blue-500 to-cyan-500",
      border: "border-blue-400/20"
    },
    light: {
      gradient: "from-blue-300 to-cyan-300",
      bg: "bg-gradient-to-br from-blue-100/90 to-cyan-100/90",
      text: "text-blue-900",
      messageGradient: "from-blue-200 to-cyan-200",
      border: "border-blue-300/50"
    }
  },
  books: {
    emoji: "📚",
    name: "Book Worms",
    dark: {
      gradient: "from-amber-600 to-orange-600",
      bg: "bg-gradient-to-br from-green-900/90 to-red-900/90",
      text: "text-white",
      messageGradient: "from-amber-500 to-orange-500",
      border: "border-amber-400/20"
    },
    light: {
      gradient: "from-amber-300 to-orange-300",
      bg: "bg-gradient-to-br from-green-100/90 to-red-100/90",
      text: "text-amber-900",
      messageGradient: "from-amber-200 to-orange-200",
      border: "border-amber-300/50"
    }
  },
  games: {
    emoji: "🎮",
    name: "Gamers",
    dark: {
      gradient: "from-green-600 to-emerald-600",
      bg: "bg-gradient-to-br from-green-900/90 to-emerald-900/90",
      text: "text-white",
      messageGradient: "from-green-500 to-emerald-500",
      border: "border-green-400/20"
    },
    light: {
      gradient: "from-green-300 to-emerald-300",
      bg: "bg-gradient-to-br from-green-100/90 to-emerald-100/90",
      text: "text-green-900",
      messageGradient: "from-green-200 to-emerald-200",
      border: "border-green-300/50"
    }
  },
  beauty: {
    emoji: "💄",
    name: "Beauty Enthusiasts",
    dark: {
      gradient: "from-rose-600 to-fuchsia-600",
      bg: "bg-gradient-to-br from-rose-900/90 to-fuchsia-900/90",
      text: "text-white",
      messageGradient: "from-rose-500 to-fuchsia-500",
      border: "border-rose-400/20"
    },
    light: {
      gradient: "from-rose-300 to-fuchsia-300",
      bg: "bg-gradient-to-br from-rose-100/90 to-fuchsia-100/90",
      text: "text-rose-900",
      messageGradient: "from-rose-200 to-fuchsia-200",
      border: "border-rose-300/50"
    }
  }
};

const Message = ({ message, isCurrentUser, themeMode, currentTheme }) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-yellow-500'
  ];
  
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const color = colors[Math.abs(hashCode(message.sender)) % colors.length];
  const initials = message.username?.slice(0, 2).toUpperCase() || 'US';
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} gap-2 mb-4`}>
      {!isCurrentUser && (
        <div className="flex-shrink-0 self-end">
          <div className={`${color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
            {initials}
          </div>
        </div>
      )}
      
      <div
        className={`max-w-xs md:max-w-md rounded-2xl p-4 ${
          isCurrentUser
            ? `bg-gradient-to-r ${currentTheme.messageGradient} text-white shadow-md`
            : themeMode === 'dark'
              ? "bg-gray-800/90 text-white"
              : "bg-gray-100 text-gray-800"
        }`}
      >
        {!isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {message.username || `User-${message.sender.slice(0, 4)}`}
            </span>
          </div>
        )}
        <div className="break-words text-sm md:text-base">{message.text}</div>
        <div
          className={`text-xs mt-2 ${
            isCurrentUser
              ? "text-white/70 text-right"
              : themeMode === 'dark'
                ? "text-gray-400"
                : "text-gray-500"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

const DateDivider = ({ date, themeMode }) => {
  return (
    <div className="text-center my-4">
      <span className={`px-3 py-1 rounded-full text-xs ${
        themeMode === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'
      }`}>
        {date}
      </span>
    </div>
  );
};

export default function ChatRoom() {
  const { roomName } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersOnline, setUsersOnline] = useState([]);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(localStorage.getItem('vibinNickname') || '');
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem('vibinTheme') || 'dark'
  );
  const messagesEndRef = useRef(null);

  const theme = roomThemes[roomName?.toLowerCase()];
  const currentTheme = theme?.[themeMode];
  
  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Invalid room: {roomName}. Please select a valid room.
      </div>
    );
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedNickname = localStorage.getItem('vibinNickname');
    if (savedNickname) {
      setNickname(savedNickname);
      socket.emit("set_username", savedNickname);
    }

    socket.emit("join_room", roomName.toLowerCase());

    socket.on("previous_messages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("receive_message", (msg) => {
      if (msg.room === roomName.toLowerCase()) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("users_in_room", (users) => {
      setUsersOnline(users);
    });

    return () => {
      socket.off("previous_messages");
      socket.off("receive_message");
      socket.off("users_in_room");
      socket.emit("leave_room", roomName.toLowerCase());
    };
  }, [roomName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (input.trim()) {
      const msg = {
        room: roomName.toLowerCase(),
        text: input,
        sender: socket.id,
        timestamp: new Date().toISOString(),
        username: nickname || `User-${socket.id.slice(0, 4)}`
      };
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

  const toggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    localStorage.setItem('vibinTheme', newTheme);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className={`h-full flex flex-col items-center justify-center ${
          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="text-5xl mb-4">{theme.emoji}</div>
          <h3 className="text-xl font-medium">Welcome to {theme.name}!</h3>
          <p className="text-sm mt-1">Be the first to start the conversation</p>
        </div>
      );
    }

    let lastDate = null;
    return messages.map((msg, idx) => {
      const currentDate = formatDate(msg.timestamp);
      const showDate = currentDate !== lastDate;
      lastDate = currentDate;

      return (
        <div key={idx}>
          {showDate && <DateDivider date={currentDate} themeMode={themeMode} />}
          <Message
            message={msg}
            isCurrentUser={msg.sender === socket.id}
            themeMode={themeMode}
            currentTheme={currentTheme}
          />
        </div>
      );
    });
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${currentTheme.bg}`}>
      {editingNickname && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className={`bg-gradient-to-br ${currentTheme.messageGradient} p-6 rounded-2xl max-w-md w-full mx-4 border border-white/20 backdrop-blur-sm`}>
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

      <div className={`w-full max-w-4xl ${currentTheme.gradient} rounded-t-2xl p-4 shadow-lg relative`}>
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
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition"
            >
              {themeMode === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
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
      </div>

      <div className={`w-full max-w-4xl ${themeMode === 'dark' ? 'bg-gray-900/70' : 'bg-white/90'} border ${currentTheme.border} rounded-b-2xl shadow-xl flex flex-col h-[70vh] backdrop-blur-sm`}>
        <div className="flex-1 overflow-y-auto p-4">
          {renderMessages()}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700/50">
          <div className="flex gap-2">
            <EmojiButton onSelect={(emoji) => setInput(prev => prev + emoji)} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`flex-grow ${themeMode === 'dark' ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'} border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              placeholder={`Message ${theme.name.toLowerCase()}...`}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`px-4 py-3 rounded-xl font-medium transition-all bg-gradient-to-r ${currentTheme.messageGradient} ${!input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'} text-white`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${themeMode === 'dark' ? 'bg-white opacity-5' : 'bg-gray-800 opacity-10'}`}
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