// src/components/MessageInput.jsx
function MessageInput({ value, setValue, sendMessage }) {
    return (
      <div className="flex space-x-2 mt-4">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Type a message"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          Send
        </button>
      </div>
    );
  }
  
  export default MessageInput;
  