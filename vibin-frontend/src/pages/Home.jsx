import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext"; // Assuming SocketContext is correctly set up
import MessageBox from "../components/MessageBox"; // Assuming MessageBox is correctly set up

const Home = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // This useEffect will run when the component mounts and listens for messages
  useEffect(() => {
    if (!socket) return;

    console.log("Socket connected:", socket);

    // When previous messages are received from the server, store them in state
    socket.on("previous_messages", (prevMessages) => {
      console.log("Previous messages:", prevMessages);
      setMessages(prevMessages); // Set the previous messages in state
    });

    // When a new message is received, update the state
    socket.on("receive_message", (message) => {
      console.log("Received message:", message);  // Log the received message
      setMessages((prev) => [...prev, message]); // Add the new message to the message list
    });

    // Cleanup listeners when component unmounts
    return () => {
      socket.off("previous_messages");
      socket.off("receive_message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      console.log("Sending message:", input);
      socket.emit("send_message", input);  // Send the message to the server
      setInput(""); // Clear the input field
    }
  };

  return (
    <div className="flex flex-col h-screen items-center p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Vibin' Chat</h1>

      {/* Message display box */}
      <div className="flex flex-col w-full max-w-md bg-white rounded shadow p-4 h-2/3 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <MessageBox key={index} text={msg.text} sender={msg.sender} />
        ))}
      </div>

      {/* Input box to type messages */}
      <div className="flex w-full max-w-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}  // Update the input state
          className="flex-grow border p-2 rounded-l"
          placeholder="Type a message"
        />
        <button
          onClick={sendMessage}  // Call sendMessage on button click
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Home;
