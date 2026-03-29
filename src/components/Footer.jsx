import React from 'react';
import { Mail, Phone, User, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-banner" style={{ 
      background: 'rgba(15, 23, 42, 0.5)', 
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '0.6rem 2.5rem',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      color: 'white'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>QA Career Hub</h3>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: '600' }}>
          <User size={16} style={{ color: '#3b82f6' }} /> Developed by Avishek Senapati
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: '600' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={16} style={{ color: '#3b82f6' }} /> +91 8348701646
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={16} style={{ color: '#3b82f6' }} /> avi1507020@gmail.com
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={16} style={{ color: '#3b82f6' }} /> 2026 QA Career Hub
        </div>
      </div>
    </footer>
  );
};

export default Footer;
