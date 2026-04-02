import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, CheckCircle } from 'lucide-react';

const Home = ({ onOpenPortfolio }) => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-text">
          <h1>
            Elevate Your QA Career — <br/> Built by Avishek 🚀
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.85)', 
            fontSize: '1.25rem', 
            fontWeight: '500', 
            maxWidth: '650px',
            lineHeight: '1.5',
            marginBottom: '2rem'
          }}>
            The professional all-in-one platform crafted by Avishek, QA Automation Engineer — who lives and breathes testing. Track your job applications, stay on top of every interview, and generate high-impact LinkedIn content with AI.
          </p>
          <div className="hero-buttons-row">
            <Link to="/job-tracker" className="primary-button primary-button-blue">
              Explore Board
            </Link>
            <Link to="/linkedin-generator" className="primary-button primary-button-ghost">
              Create Content
            </Link>
            <button 
              onClick={onOpenPortfolio}
              className="primary-button primary-button-ghost"
            >
              👨‍💻 Meet the Builder
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <img 
            src="/dashboard-hero.png" 
            alt="QA Engineer Illustration" 
          />
        </div>
      </div>

      <div className="cards-grid">
        <div className="feature-card">
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.3)', width: 'fit-content' }}>
            <Sparkles size={28} />
          </div>
          <h3>LinkedIn Content Engine</h3>
          <p>
            Generate 5 human-like LinkedIn posts and viral image prompts tailored for the QA domain.
          </p>
          <Link to="/linkedin-generator" className="primary-button" style={{ background: '#8b5cf6', color: 'white', marginTop: 'auto' }}>
            Start Creating
          </Link>
        </div>

        <div className="feature-card">
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', width: 'fit-content' }}>
            <Briefcase size={28} />
          </div>
          <h3>Modern Job Tracker</h3>
          <p>
            Track every interview stage with our dark-glass Kanban board designed for maximum focus.
          </p>
          <Link to="/job-tracker" className="primary-button" style={{ background: '#3b82f6', color: 'white', marginTop: 'auto' }}>
             Open Board
          </Link>
        </div>

        <div className="feature-card">
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.3)', width: 'fit-content' }}>
            <span style={{ fontSize: '28px' }}>🎭</span>
          </div>
          <h3>Learn Playwright</h3>
          <p>
            Master Playwright from basics to advanced. Interactive lessons, real examples, and interview-ready answers for every topic.
          </p>
          <Link to="/learn-playwright" className="primary-button" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', marginTop: 'auto' }}>
             Start Learning
          </Link>
        </div>
      </div>

      <div className="highlights-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} style={{ color: '#10b981' }} />
          <span>Growth Oriented</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} style={{ color: '#10b981' }} />
          <span>AI Integrated</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} style={{ color: '#10b981' }} />
          <span>Professional UX</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
