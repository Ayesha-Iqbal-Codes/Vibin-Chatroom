// src/components/Message.jsx
import { useEffect, useState } from "react";

const Message = ({ message, isCurrentUser, themeMode, currentTheme }) => {
  const [profilePic, setProfilePic] = useState("");
  const { date, time } = formatTimestamp(message.timestamp);

  useEffect(() => {
    // Generate a consistent profile picture based on user ID
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-yellow-500'
    ];
    const color = colors[Math.abs(hashCode(message.sender)) % colors.length];
    const initials = message.username?.slice(0, 2).toUpperCase() || 'US';
    setProfilePic(
      <div className={`${color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
        {initials}
      </div>
    );
  }, [message.sender, message.username]);

  return (
    <div className="mb-4">
      <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} gap-2`}>
        {!isCurrentUser && (
          <div className="flex-shrink-0 self-end mb-1">
            {profilePic}
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
            {time}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate hash code
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Helper function to format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  
  const time = date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return { date: dateStr, time };
}

export default Message;