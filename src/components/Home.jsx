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
          <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Sparkles size={28} />
          </div>
          <h3>LinkedIn Content Engine</h3>
          <p>
            Generate 5 human-like LinkedIn posts and viral image prompts tailored for the QA domain.
          </p>
          <Link to="/linkedin-generator" className="primary-button" style={{ background: '#8b5cf6' }}>
            Start Creating
          </Link>
        </div>

        <div className="feature-card">
          <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <Briefcase size={28} />
          </div>
          <h3>Modern Job Tracker</h3>
          <p>
            Track every interview stage with our dark-glass Kanban board designed for maximum focus.
          </p>
          <Link to="/job-tracker" className="primary-button" style={{ background: '#3b82f6' }}>
             Open Board
          </Link>
        </div>

        <div className="feature-card">
          <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <span style={{ fontSize: '28px' }}>🎭</span>
          </div>
          <h3>Learn Playwright</h3>
          <p>
            Master Playwright from basics to advanced. Interactive lessons, real examples, and interview-ready answers for every topic.
          </p>
          <Link to="/learn-playwright" className="primary-button" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
             Start Learning
          </Link>
        </div>

        <div className="feature-card">
          <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <span style={{ fontSize: '28px' }}>🗄️</span>
          </div>
          <h3>Learn SQL for QA</h3>
          <p>
            Master SQL from basics to advanced database testing. Real queries, test data management, and interview-ready answers for QA engineers.
          </p>
          <Link to="/learn-sql" className="primary-button" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
             Start Learning
          </Link>
        </div>

        <div className="feature-card">
          <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <span style={{ fontSize: '28px' }}>🏗️</span>
          </div>
          <h3>Learn Design Patterns & Architecture</h3>
          <p>
            Master SOLID principles, GoF design patterns, architecture patterns, and clean code concepts. Real examples in multiple languages for QA engineers and developers.
          </p>
          <Link to="/learn-design-patterns" className="primary-button" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
             Start Learning
          </Link>
        </div>

        <div className="feature-card">
          <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <span style={{ fontSize: '28px' }}>💻</span>
          </div>
          <h3>QA Coding Practice</h3>
          <p>
            Practice real QA automation coding interview questions. Write code, get instant AI feedback, better suggestions, and level up your coding skills in your preferred language.
          </p>
          <Link to="/coding-practice" className="primary-button" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
             Start Practicing
          </Link>
        </div>

        <div className="feature-card">
          <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <span style={{ fontSize: '28px' }}>🔌</span>
          </div>
          <h3>Learn API Testing & Automation</h3>
          <p>
            Master REST API testing, automation frameworks like RestSharp, Rest Assured, and Playwright API. Real examples and interview-ready answers for QA engineers.
          </p>
          <Link to="/learn-api-testing" className="primary-button" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
             Start Learning
          </Link>
        </div>

        <div className="feature-card">
          <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <span style={{ fontSize: '28px' }}>🎯</span>
          </div>
          <h3>Job Buddy</h3>
          <p>
            Find QA jobs on Naukri and LinkedIn, learn how to apply the right way, get best practices for freshers and experienced engineers, and get AI-powered job search assistance.
          </p>
          <Link to="/job-buddy" className="primary-button" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
             Find Jobs
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
