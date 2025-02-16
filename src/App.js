import React from 'react';
import './App.css';
import Leaderboard from './components/LeaderboardApp';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import LeaderboardComponent from './components/LeaderboardComponent';
import { AuthProvider } from './components/AuthContext'; // Import the AuthProvider

function App() {
  return (
    <AuthProvider> {/* Wrap the app with AuthProvider */}
      <Router>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path='/leaderboardcomponent' element={<LeaderboardComponent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;