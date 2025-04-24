// src/components/ChatBox.jsx
import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";

const ChatBox = () => {
  const { socket, messages } = useSocket();
  const [newMessage, setNewMessage] = useState("");

  // Handle input change
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      // Emit the message to the backend
      socket.emit("send_message", newMessage);
      setNewMessage(""); // Clear the input field after sending
    }
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <span>{message.sender}: </span>
            {message.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={handleMessageChange}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
