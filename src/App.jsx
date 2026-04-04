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
import LearnSQL from './components/LearnSQL';
import LearnDesignPatterns from './components/LearnDesignPatterns';
import CodingPractice from './components/CodingPractice';
import LearnAPITesting from './components/LearnAPITesting';
import JobBuddy from './components/JobBuddy';
import MockInterview from './components/MockInterview';
import DemoModal from './components/DemoModal';
import { isDemoMode, restoreDemoSession, logoutDemo } from './utils/useDemoAuth';
import { isDemoUser } from './utils/isDemoUser';
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
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Sync with real Firebase Auth state
  useEffect(() => {
    if (!user && isDemoMode()) {
      restoreDemoSession(setUser);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (isDemoMode()) return; // Don't override demo session

      if (firebaseUser) {
        setUser(firebaseUser);
        
        if (isDemoUser(firebaseUser)) return;

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
    if (userData && userData.isDemo) {
      setUser(userData);
    }
    // Firebase handles storage automatically, we just close the modal
    setShowAuthModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      if (isDemoUser(user)) {
        logoutDemo(setUser, navigate);
        setShowLogoutConfirm(false);
        return;
      }
      localStorage.removeItem('groq-api-key');
      localStorage.removeItem('groq_api_key_guest');
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
        onOpenDemo={() => setShowDemoModal(true)}
      />
      
      <main className="main-content-full">
        {isDemoMode() && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(124,58,237,0.2),rgba(79,70,229,0.1))',
            borderBottom: '1px solid rgba(124,58,237,0.25)',
            padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '8px'
          }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              🚀 Demo Mode — Data is not saved. Explore all features freely!
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => { logoutDemo(setUser, navigate); setShowAuthModal(true); }}
                style={{ fontSize: '12px', background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)', color: '#a78bfa', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', minHeight: '36px' }}
              >
                Create Real Account
              </button>
              <button 
                onClick={() => logoutDemo(setUser, navigate)}
                style={{ fontSize: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', minHeight: '36px' }}
              >
                Exit Demo
              </button>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home onOpenPortfolio={() => { navigate('/avishek'); setShowPortfolio(true); }} onOpenDemo={() => setShowDemoModal(true)} user={user} />} />
          <Route path="/linkedin-generator" element={<PostGenerator user={user} />} />
          <Route path="/job-tracker" element={<KanbanBoard user={user} onOpenAuth={() => setShowAuthModal(true)} />} />
          <Route path="/learn-playwright" element={<LearnPlaywright user={user} />} />
          <Route path="/learn-sql" element={<LearnSQL user={user} />} />
          <Route path="/learn-design-patterns" element={<LearnDesignPatterns user={user} />} />
          <Route path="/coding-practice" element={<CodingPractice user={user} />} />
          <Route path="/learn-api-testing" element={<LearnAPITesting user={user} />} />
          <Route path="/job-buddy" element={<JobBuddy user={user} />} />
          <Route path="/mock-interview" element={<MockInterview user={user} />} />
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
          onOpenDemo={() => { setShowAuthModal(false); setShowDemoModal(true); }}
        />
      )}

      {showDemoModal && (
        <DemoModal onClose={() => setShowDemoModal(false)} setUser={setUser} />
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
