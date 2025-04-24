import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const DualChat = () => {
  const [messages, setMessages] = useState({
    music_lovers: [],
    movie_lovers: [],
  });

  const [inputs, setInputs] = useState({
    music_lovers: "",
    movie_lovers: "",
  });

  useEffect(() => {
    socket.emit("join_room", "music_lovers");
    socket.emit("join_room", "movie_lovers");

    socket.on("receive_message", (message) => {
      setMessages((prev) => ({
        ...prev,
        [message.room]: [...prev[message.room], message],
      }));
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = (room) => {
    if (!inputs[room]) return;
    socket.emit("send_message", { room, text: inputs[room] });
    setInputs((prev) => ({ ...prev, [room]: "" }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 min-h-screen">
      {/* Music Lovers Chat */}
      <ChatBox
        title="🎵 Music Lovers"
        messages={messages.music_lovers}
        value={inputs.music_lovers}
        onChange={(val) => setInputs((prev) => ({ ...prev, music_lovers: val }))}
        onSend={() => sendMessage("music_lovers")}
        color="purple"
      />

      {/* Movie Lovers Chat */}
      <ChatBox
        title="🎬 Movie Lovers"
        messages={messages.movie_lovers}
        value={inputs.movie_lovers}
        onChange={(val) => setInputs((prev) => ({ ...prev, movie_lovers: val }))}
        onSend={() => sendMessage("movie_lovers")}
        color="blue"
      />
    </div>
  );
};

const ChatBox = ({ title, messages, value, onChange, onSend, color }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg flex flex-col p-4 w-full md:w-1/2">
      <h2 className={`text-${color}-700 font-bold text-xl mb-3`}>{title}</h2>
      <div className="flex-1 overflow-y-auto h-64 border border-gray-200 p-3 rounded mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`bg-${color}-100 p-2 rounded mb-2 shadow-sm text-sm`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-2 border rounded focus:outline-none"
          placeholder="Type your message..."
        />
        <button
          onClick={onSend}
          className={`bg-${color}-600 text-white px-4 py-2 rounded`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DualChat;
