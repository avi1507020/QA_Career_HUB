import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, LogOut, UserPlus, Menu, X, Zap } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import GroqApiModal from './GroqApiModal';

const Header = ({ user, onLogout, onOpenAuth, onOpenProfile }) => {
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
    if (!user) return;
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
              onClick={onOpenProfile}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                background: 'rgba(255,255,255,0.05)', 
                padding: '0.5rem 1rem', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="user-chip"
            >
               <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                  {profileData?.avatarUrl ? (
                    <img src={profileData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={18} />
                  )}
               </div>
               <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>
                    {profileData?.firstName ? `${profileData.firstName} ${profileData.lastName || ''}`.trim() : (user.displayName || user.email.split('@')[0])}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                    {profileData?.role || 'Active Explorer'}
                  </p>
               </div>
            </div>

            <button 
              onClick={onLogout}
              className="primary-button primary-button-red btn-sm desktop-logout"
              style={{ fontSize: '0.8rem', fontWeight: '800' }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
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
                Logout
              </button>
            </>
          ) : (
            <>
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
    </header>
  );
};

export default Header;
