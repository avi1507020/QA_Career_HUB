import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, LogOut, UserPlus, Menu, X, Zap } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import GroqApiModal from './GroqApiModal';
import { isDemoMode } from '../utils/useDemoAuth';
import { isDemoUser } from '../utils/isDemoUser';

const Header = ({ user, onLogout, onOpenAuth, onOpenProfile, onOpenDemo }) => {
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGroqModalOpen, setIsGroqModalOpen] = useState(false);
  
  const hasGroqKey = Boolean(
    profileData?.groqApiKey || 
    localStorage.getItem('groq-api-key') || 
    localStorage.getItem('groq_api_key_guest')
  );

  useEffect(() => {
    if (!user || isDemoUser(user)) {
      setProfileData(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().profile || docSnap.data();
        setProfileData(data);
      }
    });
    return () => unsub();
  }, [user]);

  const handleMobileAction = (action) => {
    setIsMobileMenuOpen(false);
    action();
  };
  
  return (
    <header className="main-header glass-card">
      <div className="header-logo">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-icon">
            <Home size={22} color="white" />
          </div>
          <div>
            <h1>QA Career Hub</h1>
            <p>Elevate Your Testing Career</p>
          </div>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="desktop-menu">
        {user ? (
          <>
            <button 
              onClick={() => setIsGroqModalOpen(true)}
              className="primary-button groq-btn-mobile-wrapper"
              style={{ padding: '0.5rem 1rem', background: hasGroqKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${hasGroqKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700' }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasGroqKey ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${hasGroqKey ? '#10b981' : '#ef4444'}` }}></div>
              <span className="groq-btn-text-full">{hasGroqKey ? 'GROQ Connected' : 'GROQ API'}</span>
              <span className="groq-btn-text-tablet">GROQ</span>
              <Zap className="groq-btn-icon-mobile" size={16} fill={hasGroqKey ? "#10b981" : "transparent"} color={hasGroqKey ? "#10b981" : "white"} />
            </button>

            <div 
              onClick={isDemoUser(user) ? null : onOpenProfile}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                background: 'rgba(255,255,255,0.05)', 
                padding: '0.5rem 1rem', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: isDemoUser(user) ? 'default' : 'pointer',
                transition: 'all 0.2s'
              }}
              className="user-chip"
            >
               {isDemoUser(user) ? (
                 <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700' }}>
                   D
                 </div>
               ) : (
                 <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                    {profileData?.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={18} />
                    )}
                 </div>
               )}
               <div>
                  <p style={{ margin: 0, fontSize: isDemoUser(user) ? '11px' : '0.85rem', fontWeight: isDemoUser(user) ? '600' : '800', color: 'white' }}>
                    {isDemoUser(user) ? 'Demo User' : (profileData?.firstName ? `${profileData.firstName} ${profileData.lastName || ''}`.trim() : (user.displayName || user.email.split('@')[0]))}
                  </p>
                  <p style={{ margin: 0, fontSize: isDemoUser(user) ? '9px' : '0.7rem', color: isDemoUser(user) ? '#a78bfa' : 'rgba(255,255,255,0.6)' }}>
                    {isDemoUser(user) ? 'Demo Mode 🚀' : (profileData?.role || 'Active Explorer')}
                  </p>
               </div>
            </div>

            <button 
              onClick={onLogout}
              className="primary-button primary-button-red btn-sm desktop-logout"
              style={{ fontSize: '0.8rem', fontWeight: '800' }}
            >
              <LogOut size={16} />
              {isDemoUser(user) ? 'Exit Demo' : 'Logout'}
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={onOpenDemo}
              className="demo-nav-btn"
            >
              <span className="demo-nav-text">🚀 Demo My App</span>
              <span className="demo-nav-icon" style={{ display: 'none' }}>🚀</span>
            </button>

            <button 
              onClick={onOpenAuth}
              className="primary-button primary-button-blue"
              style={{ padding: '0.8rem 1.8rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
            >
              <UserPlus size={18} fill="white" /> Login / Sign Up
            </button>

            <button 
              onClick={() => setIsGroqModalOpen(true)}
              className="primary-button groq-btn-mobile-wrapper"
              style={{ padding: '0.5rem 1rem', background: hasGroqKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${hasGroqKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700' }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasGroqKey ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${hasGroqKey ? '#10b981' : '#ef4444'}` }}></div>
              <span className="groq-btn-text-full">{hasGroqKey ? 'GROQ Connected' : 'GROQ API'}</span>
              <span className="groq-btn-text-tablet">GROQ</span>
              <Zap className="groq-btn-icon-mobile" size={16} fill={hasGroqKey ? "#10b981" : "transparent"} color={hasGroqKey ? "#10b981" : "white"} />
            </button>
          </>
        )}
      </div>

      {/* Mobile Hamburger Toggle */}
      <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={28} color="white" /> : <Menu size={28} color="white" />}
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          {user ? (
            <>
              <button 
                onClick={() => handleMobileAction(() => setIsGroqModalOpen(true))}
                className="primary-button"
                style={{ width: '100%', padding: '1rem', background: hasGroqKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${hasGroqKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '700' }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: hasGroqKey ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${hasGroqKey ? '#10b981' : '#ef4444'}` }}></div>
                <Zap size={18} fill={hasGroqKey ? "#10b981" : "transparent"} color={hasGroqKey ? "#10b981" : "white"} />
                {hasGroqKey ? 'GROQ Connected' : 'GROQ API Connection'}
              </button>

              <div 
                onClick={() => handleMobileAction(onOpenProfile)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                 <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden' }}>
                    {profileData?.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={20} />
                    )}
                 </div>
                 <div>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'white' }}>
                      {profileData?.firstName ? `${profileData.firstName} ${profileData.lastName || ''}`.trim() : (user.displayName || user.email.split('@')[0])}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                      {profileData?.role || 'Active Explorer'}
                    </p>
                 </div>
              </div>

              <button 
                onClick={() => handleMobileAction(onLogout)}
                className="primary-button primary-button-red btn-sm"
                style={{ width: '100%', fontSize: '0.9rem', fontWeight: '800', height: '48px' }}
              >
                <LogOut size={18} />
                {isDemoUser(user) ? 'Exit Demo' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => handleMobileAction(onOpenDemo)}
                className="demo-nav-btn"
                style={{ marginBottom: '1rem', width: '100%' }}
              >
                <span className="demo-nav-text">🚀 Demo My App</span>
              </button>

              <button 
                onClick={() => handleMobileAction(onOpenAuth)}
                className="primary-button primary-button-blue"
                style={{ padding: '0.8rem 1.8rem', fontSize: '1rem', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', width: '100%', height: '52px' }}
              >
                <UserPlus size={20} fill="white" /> Login / Sign Up
              </button>

              <button 
                onClick={() => handleMobileAction(() => setIsGroqModalOpen(true))}
                className="primary-button"
                style={{ width: '100%', padding: '1rem', background: hasGroqKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${hasGroqKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '700', marginTop: '1rem' }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: hasGroqKey ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${hasGroqKey ? '#10b981' : '#ef4444'}` }}></div>
                <Zap size={18} fill={hasGroqKey ? "#10b981" : "transparent"} color={hasGroqKey ? "#10b981" : "white"} />
                {hasGroqKey ? 'GROQ Connected' : 'GROQ API Connection'}
              </button>
            </>
          )}
        </div>
      )}

      {isGroqModalOpen && (
        <GroqApiModal user={user} onClose={() => setIsGroqModalOpen(false)} />
      )}
      <style>{`
        .demo-nav-btn {
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 10px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 18px;
          height: 38px;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
          white-space: nowrap;
          min-height: 44px;
          margin-right: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .demo-nav-btn:hover {
          background: linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.3));
          border-color: rgba(124,58,237,0.6);
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .desktop-menu .demo-nav-btn { margin-right: 4px; padding: 0; width: 44px; }
          .desktop-menu .demo-nav-text { display: none; }
          .desktop-menu .demo-nav-icon { display: block !important; margin: 0 auto; font-size: 18px; }
        }
      `}</style>
    </header>
  );
};

export default Header;
