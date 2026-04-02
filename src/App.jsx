import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Save } from 'lucide-react';
import Header from './components/Header';
import PostGenerator from './components/PostGenerator';
import KanbanBoard from './components/KanbanBoard';
import Home from './components/Home';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Portfolio from './components/Portfolio';
import UserProfilePanel from './components/UserProfilePanel';
import LearnPlaywright from './components/LearnPlaywright';
import './App.css';

import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Sync with real Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Migrate Guest Groq API Key if exists
        const guestKey = localStorage.getItem('groq_api_key_guest');
        if (guestKey) {
          const migrateKey = async () => {
            try {
              const docRef = doc(db, 'users', firebaseUser.uid);
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                const existingData = docSnap.data();
                await setDoc(docRef, {
                  ...existingData,
                  profile: {
                    ...(existingData.profile || {}),
                    groqApiKey: guestKey
                  }
                }, { merge: true });
              } else {
                await setDoc(docRef, {
                  profile: { groqApiKey: guestKey }
                });
              }
              
              localStorage.setItem('groq-api-key', guestKey);
              localStorage.removeItem('groq_api_key_guest');
              console.log("GROQ API key migrated from guest to profile.");
            } catch (err) {
              console.error("Error migrating Groq API key:", err);
            }
          };
          migrateKey();
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    // Firebase handles storage automatically, we just close the modal
    setShowAuthModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutConfirm(false);
      navigate('/');
    } catch (err) {
      console.error("Error signing out: ", err);
    }
  };

  return (
    <>
      <Header 
        user={user} 
        onLogout={handleLogoutClick} 
        onOpenAuth={() => setShowAuthModal(true)} 
        onOpenProfile={() => setShowUserProfile(true)}
      />
      
      <main className="main-content-full">
        <Routes>
          <Route path="/" element={<Home onOpenPortfolio={() => { navigate('/avishek'); setShowPortfolio(true); }} />} />
          <Route path="/linkedin-generator" element={<PostGenerator user={user} />} />
          <Route path="/job-tracker" element={<KanbanBoard user={user} onOpenAuth={() => setShowAuthModal(true)} />} />
          <Route path="/learn-playwright" element={<LearnPlaywright user={user} />} />
          <Route path="/avishek" element={<Home onOpenPortfolio={() => setShowPortfolio(true)} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />

      {(showPortfolio || location.pathname === '/avishek') && (
        <Portfolio onBack={() => { setShowPortfolio(false); navigate('/'); }} />
      )}

      {showAuthModal && (
        <Auth 
          onLogin={handleLogin} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      {user && (
        <UserProfilePanel 
          user={user}
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
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
