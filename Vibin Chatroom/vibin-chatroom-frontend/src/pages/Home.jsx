import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">🎙️ Welcome to Vibin'</h1>
      <p className="mb-6 text-gray-700">Choose your chatroom and start vibin’</p>
      <button
        onClick={() => navigate("/chatrooms")}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        Enter Chatrooms
      </button>
    </div>
  );
};

export default Home;
