import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, CheckCircle } from 'lucide-react';

const Home = ({ onOpenPortfolio }) => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-text">
          <style>
            {`
              @keyframes pulseGlow {
                0% { text-shadow: 0 0 10px rgba(34, 211, 238, 0.3); }
                50% { text-shadow: 0 0 20px rgba(34, 211, 238, 0.7); }
                100% { text-shadow: 0 0 10px rgba(34, 211, 238, 0.3); }
              }
              
              .builder-link-wrapper {
                display: inline-flex;
                align-items: baseline;
                white-space: nowrap;
              }

              .builder-link {
                cursor: pointer;
                color: #22D3EE;
                font-weight: 800;
                font-size: 1.04em;
                position: relative;
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.25s, text-shadow 0.25s;
                display: inline-block;
                text-decoration: none;
                animation: pulseGlow 3s infinite ease-in-out;
                padding: 0 2px;
              }

              .builder-link:hover, .builder-link:focus {
                outline: none;
                color: #67E8F9;
                text-shadow: 0 0 25px rgba(34, 211, 238, 1), 0 0 12px rgba(255, 255, 255, 0.6);
                transform: scale(1.03) translateY(-1px);
                animation: none;
              }
              
              /* Added custom focus ring for accessibility without ruining the aesthetic */
              .builder-link:focus-visible {
                border-radius: 4px;
                box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.5);
              }
            `}
          </style>
          <h1>
            Elevate Your QA Career — <br/> Built by{' '}
            <span className="builder-link-wrapper">
              <span
                className="builder-link"
                role="button"
                tabIndex={0}
                aria-label="Meet the Builder"
                title="Click to know the builder"
                onClick={onOpenPortfolio}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenPortfolio();
                  }
                }}
              >
                Avishek
              </span>
              <span style={{ marginLeft: '12px', display: 'inline-block', transition: 'transform 0.3s ease' }} className="hero-emoji">🚀</span>
            </span>
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.95)', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            maxWidth: '650px',
            lineHeight: '1.5',
            marginBottom: '2rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            The ultimate all-in-one QA platform built by Avishek, designed to accelerate your testing career. <br/><br/>
            Manage job applications, generate LinkedIn content, practice QA coding, learn Playwright, API automation, SQL, design patterns, and more — all in one place powered by AI.
          </p>
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

        <div className="feature-card">
          <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <span style={{ fontSize: '28px' }}>🎙️</span>
          </div>
          <h3>QA Mock Interview</h3>
          <p>
            AI-powered timed mock interviews. Pick your topics, answer questions one by one, get scored with real feedback like a live interviewer. Track weak areas across sessions.
          </p>
          <Link to="/mock-interview" className="primary-button" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
             Start Interview
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
