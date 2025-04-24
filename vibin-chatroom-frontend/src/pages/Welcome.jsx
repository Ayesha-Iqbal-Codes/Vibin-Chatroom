import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useRef } from "react";
import backgroundMusic from "../assets/Happy.mp3"; // Update path to your audio file

export default function Welcome() {
  const navigate = useNavigate();
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  
  useEffect(() => {
    audioRef.current = new Audio(backgroundMusic);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    const handleFirstInteraction = () => {
      if (!isMuted) {
        audioRef.current.play().catch(e => console.log("Auto-play prevented:", e));
      }
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    return () => {
      audioRef.current.pause();
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  // Toggle mute state
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = isMuted;
    if (!isMuted) {
      audioRef.current.play().catch(e => console.log("Playback prevented:", e));
    }
  }, [isMuted]);

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

  const handleNavigation = () => {
    navigate("/rooms");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-pink-600 to-indigo-800 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <div className="animate-pulse text-xl">Setting the vibe...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(
          ${135 + position.x * 15}deg,
          rgba(126, 34, 206, 0.95) 0%,
          rgba(219, 39, 119, 0.95) 50%,
          rgba(79, 70, 229, 0.95) 100%
        )`,
        transition: 'background 0.3s ease-out'
      }}
    >
      {/* Floating bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translate(${position.x * 20}px, ${position.y * 20}px)`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Music toggle button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-sm transition-all"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 12a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        )}
      </button>

      {/* Main content - Reduced padding and adjusted spacing */}
      <div className="relative z-10 backdrop-blur-sm bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full mx-4 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
          Vibin' Chatrooms 🎤
        </h1>
        <p className="text-lg mb-6 text-white/90">
          Join topic-based chatrooms and vibe with others!
        </p>

        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <img 
                src={user.picture} 
                alt="Profile" 
                className="w-20 h-20 rounded-full mb-3 border-4 border-white/30 hover:border-pink-300 transition-all duration-300 hover:scale-105"
              />
              <h2 className="text-xl font-medium text-white">
                Hello, {user.name.split(' ')[0]} 👋
              </h2>
            </div>
            
            <button
              onClick={handleNavigation}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="w-full bg-white/90 hover:bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 relative overflow-hidden"
            >
              <span className={`relative z-10 ${isHovering ? 'text-purple-800' : ''}`}>
                Enter Chatrooms
              </span>
              {isHovering && (
                <span className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 opacity-30 animate-pulse"></span>
              )}
            </button>
            
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="w-full bg-transparent hover:bg-white/10 text-white border border-white/30 px-6 py-2 rounded-xl font-medium transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="w-full bg-white/90 hover:bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 relative overflow-hidden"
          >
            <span className={`relative z-10 ${isHovering ? 'text-purple-800' : ''}`}>
              Login to Continue
            </span>
            {isHovering && (
              <span className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 opacity-30 animate-pulse"></span>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-white/60 text-sm">
        Let's vibe together 🎶
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
}