import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Save } from 'lucide-react';
import Header from './components/Header';
import PostGenerator from './components/PostGenerator';
import KanbanBoard from './components/KanbanBoard';
import Home from './components/Home';
import Footer from './components/Footer';
import Auth from './components/Auth';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qa-career-hub-session');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('qa-career-hub-session', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setUser(null);
    localStorage.removeItem('qa-career-hub-session');
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <>
      <Header 
        user={user} 
        onLogout={handleLogoutClick} 
        onOpenAuth={() => setShowAuthModal(true)} 
      />
      
      <main className="main-content-full">
        <Routes>
          <Route path="/" element={<Home onOpenLinkedIn={null} />} />
          <Route path="/linkedin-generator" element={<PostGenerator />} />
          <Route path="/job-tracker" element={<KanbanBoard user={user} onOpenAuth={() => setShowAuthModal(true)} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />

      {showAuthModal && (
        <Auth 
          onLogin={handleLogin} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      {showLogoutConfirm && (
        <div className="confirmation-overlay open" onClick={() => setShowLogoutConfirm(false)}>
          <div className="confirmation-popup logout-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowLogoutConfirm(false)}>×</button>
            <div className="modal-icon-container">
              <LogOut size={40} color="#ef4444" />
            </div>
            <h2>Save your changes before logout?</h2>
            <p>Your career journey progress will be safely stored for your next visit.</p>
            <div className="modal-action-group">
              <button className="primary-button primary-button-red" onClick={confirmLogout} style={{ flex: 1, justifyContent: 'center' }}>
                <Save size={18} /> Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
