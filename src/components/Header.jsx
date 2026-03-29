import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Rocket, Layout, User, LogOut, UserPlus } from 'lucide-react';

const Header = ({ user, onLogout, onOpenAuth }) => {
  const location = useLocation();
  
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1.2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <User size={18} />
               </div>
               <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>{user.displayName || user.email.split('@')[0]}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Active Explorer</p>
               </div>
            </div>

            <button 
              onClick={onLogout}
              className="primary-button primary-button-red btn-sm"
              style={{ fontSize: '0.8rem', fontWeight: '800' }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="primary-button primary-button-blue"
            style={{ padding: '0.8rem 1.8rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
          >
            <UserPlus size={18} /> Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
