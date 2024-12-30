import React from 'react';
import './App.css';
import Leaderboard from './components/LeaderboardApp';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import { AuthProvider } from './components/AuthContext'; // Import the AuthProvider

function App() {
  return (
    <AuthProvider> {/* Wrap the app with AuthProvider */}
      <Router>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
