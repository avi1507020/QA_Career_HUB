import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Award } from 'lucide-react';

const Header = () => {
  return (
    <header className="header-banner" style={{ 
      background: 'rgba(15, 23, 42, 0.4)', 
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" style={{ 
          color: '#ffffff', 
          padding: '0.6rem', 
          background: 'rgba(59, 130, 246, 0.25)', 
          borderRadius: '16px', 
          border: '1px solid rgba(59, 130, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 10px rgba(59, 130, 246, 0.2)'
        }}>
          <HomeIcon size={22} />
        </Link>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.8px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            QA Career Hub
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: '600' }}>
            Elevate Your Testing Career
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', borderRadius: '14px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}>
          <Award size={18} />
          PREMIUM
        </div>
      </div>
    </header>
  );
};

export default Header;
