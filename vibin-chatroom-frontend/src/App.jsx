import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import RoomSelection from "./pages/RoomSelection";
import ChatRoom from "./pages/ChatRoom";
import { useAuth0 } from "@auth0/auth0-react";

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return <p className="text-center p-4">Loading...</p>;
  return isAuthenticated ? children : <Welcome />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/rooms" element={<PrivateRoute><RoomSelection /></PrivateRoute>} />
        <Route path="/chat/:roomName" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
