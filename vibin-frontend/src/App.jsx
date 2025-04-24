import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext"; // Import SocketProvider
import Home from "./pages/Home"; // Assuming Home.jsx is in the pages folder

const App = () => {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;
