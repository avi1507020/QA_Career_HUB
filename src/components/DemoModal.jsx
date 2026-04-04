import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { DEMO_EMAIL, DEMO_PASSWORD, loginAsDemo } from '../utils/useDemoAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const DemoModal = ({ onClose, setUser }) => {
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showGroqSteps, setShowGroqSteps] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [groqError, setGroqError] = useState('');
  const [groqSuccess, setGroqSuccess] = useState('');
  
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1500);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 1500);
    }
  };

  const handleConnectGroq = async () => {
    if (!groqKeyInput.trim()) {
      setGroqError('Please paste your GROQ API key first');
      setGroqSuccess('');
      return;
    }
    setGroqError('');
    
    // Save locally
    localStorage.setItem('groq-api-key', groqKeyInput.trim());
    
    // Attempt exact save as JobBuddy/others does if real user
    // But since it's demo modal, the user is likely NOT logged in yet.
    // If they are logged in, we shouldn't even show Demo Modal.
    // So local storage is enough for Demo user since we block firestore anyway.
    
    setGroqSuccess("✓ GROQ key saved! You're all set.");
  };

  const handleLaunch = () => {
    loginAsDemo(DEMO_EMAIL, DEMO_PASSWORD, setUser);
    onClose();
    navigate('/');
    // Show toast for launch
    const toast = document.createElement("div");
    toast.innerHTML = "🚀 Demo mode active! Explore freely.";
    Object.assign(toast.style, {
      background: "#1a1535",
      border: "1px solid #4ade80",
      borderRadius: "10px",
      padding: "10px 16px",
      fontSize: "13px",
      color: "white",
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "9999",
      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      fontFamily: "Inter, sans-serif"
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = "opacity 0.3s ease-out";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, fontFamily: 'Inter, sans-serif',
      padding: '20px', boxSizing: 'border-box'
    }} onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()} tabIndex={-1}>
      <div style={{
        background: '#13112a',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        animation: 'modalFadeScale 0.25s ease-out forwards',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.1)'
      }} onClick={e => e.stopPropagation()} className="demo-modal-box">
        
        {/* HEADER */}
        <div style={{
          flexShrink: 0,
          background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
          padding: '24px 44px 16px 44px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
          position: 'relative',
          borderRadius: '20px 20px 0 0'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Try the Full App — Demo Mode 🚀
          </h2>
          <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.6)', marginTop: '6px', lineHeight: '1.4', marginBottom: 0 }}>
            No sign up needed. Explore everything instantly. Data is not saved.
          </p>
          <button onClick={onClose} className="demo-close-btn" style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '32px', height: '32px', minWidth: '32px', minHeight: '32px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', color: 'white',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
            transition: 'all 0.2s ease'
          }}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          
          {/* CARD 1: CREDENTIALS */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '16px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
              🔑 DEMO CREDENTIALS
            </div>
            
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Email</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#a78bfa' }}>{DEMO_EMAIL}</span>
                <button onClick={() => handleCopy(DEMO_EMAIL, 'email')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', minWidth: '44px', minHeight: '44px', padding: 0 }}>
                  {copiedEmail ? '✓' : '📋'}
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '10px 0' }}></div>

            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Password</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#a78bfa' }}>{DEMO_PASSWORD}</span>
                <button onClick={() => handleCopy(DEMO_PASSWORD, 'password')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', minWidth: '44px', minHeight: '44px', padding: 0 }}>
                  {copiedPassword ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: FEATURES */}
          <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', marginBottom: '10px' }}>✅ Full Access to All Features</div>
            <div className="demo-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                'LinkedIn Post Generator', 'QA Mock Interview', 'Learn Playwright', 'QA Coding Practice',
                'Learn SQL for QA', 'Job Buddy', 'Learn API Testing', 'MBA Finance Jobs',
                'Learn Performance & K6', 'Learn Design Patterns', 'Modern Job Tracker', 'GROQ AI (your key)'
              ].map(f => (
                <div key={f} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }}></div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* CARD 3: DATA WARNING */}
          <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '12px 14px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
              ⚠️ Demo mode only — no data is saved to the database. Refreshing the page resets everything. Create a free account to save your progress permanently.
            </p>
          </div>

          {/* CARD 4: GROQ */}
          <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>⚡ Connect GROQ API for Best Experience</div>
              <div style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)', color: '#a78bfa', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: '700' }}>Recommended</div>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.6', margin: '10px 0 14px' }}>
              Most features use AI powered by GROQ. Connect your free GROQ API key for the best demo experience.
            </p>

            <button onClick={() => setShowGroqSteps(!showGroqSteps)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: showGroqSteps ? '8px 8px 0 0' : '8px', padding: '10px 14px', cursor: 'pointer', color: 'white', fontSize: '13px', fontWeight: '600' }}>
              ❓ How to get your GROQ API key
              <span style={{ transform: showGroqSteps ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
            </button>
            <div style={{ maxHeight: showGroqSteps ? '400px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 8px 8px', ...showGroqSteps ? { padding: '14px' } : {} }}>
              {[
                'Go to console.groq.com and create a free account',
                'After logging in click "API Keys" in the left sidebar',
                'Click the "Create API Key" button',
                'Give your key a name (e.g. QA Career Hub)',
                'Copy and save the key immediately it will not be shown again',
                'Paste the key into the GROQ API panel after launching the demo (top navbar → GROQ API button)'
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)', color: '#a78bfa', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{step}</div>
                </div>
              ))}
              <button onClick={() => window.open('https://console.groq.com','_blank')} className="demo-groq-btn" style={{ width: '100%', marginTop: '10px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '8px', color: '#a78bfa', fontSize: '12px', fontWeight: '600', padding: '9px', cursor: 'pointer', transition: 'all 0.2s' }}>
                Open Groq Console ↗
              </button>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Or paste your key here to connect now:</div>
              <div className="demo-groq-input-row" style={{ display: 'flex', alignItems: 'center' }}>
                <input type="password" placeholder="gsk_••••••••••••••••••" value={groqKeyInput} onChange={(e) => setGroqKeyInput(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '9px 14px', color: 'white', fontSize: '12px', fontFamily: 'monospace', height: '40px', outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={handleConnectGroq} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '700', padding: '0 16px', height: '40px', cursor: 'pointer', marginLeft: '8px', whiteSpace: 'nowrap' }}>Connect ▶</button>
              </div>
              {groqError && <div style={{ color: '#f87171', fontSize: '11px', marginTop: '6px' }}>{groqError}</div>}
              {groqSuccess && <div style={{ color: '#4ade80', fontSize: '11px', marginTop: '6px' }}>{groqSuccess}</div>}
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '8px' }}>
                Skip for now — connect later from the navbar after launching the demo
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ flexShrink: 0, padding: '16px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="demo-launch-btn" onClick={handleLaunch} style={{ width: '100%', height: '50px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
            🚀 Launch Demo Now
          </button>
          <button onClick={() => { onClose(); navigate('/login'); }} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '12px', cursor: 'pointer', padding: '4px' }}>
            Already have an account? Sign In
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalFadeScale {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .demo-close-btn:hover { background: rgba(255,255,255,0.2) !important; transform: scale(1.05); }
        .demo-close-btn:active { transform: scale(0.95); }
        .demo-modal-box::-webkit-scrollbar { width: 4px; }
        .demo-modal-box::-webkit-scrollbar-track { background: transparent; }
        .demo-modal-box::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.5); border-radius: 4px; }
        .demo-groq-btn:hover { background: rgba(124,58,237,0.35) !important; color: white !important; }
        .demo-launch-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .demo-launch-btn:active { transform: scale(0.98); }
        @media (max-width: 768px) {
          .demo-modal-box {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 92vh !important;
            align-self: flex-end;
            margin-top: auto;
          }
          .demo-features-grid { grid-template-columns: 1fr !important; }
          .demo-groq-input-row { flex-direction: column; gap: 8px; }
          .demo-groq-input-row input, .demo-groq-input-row button { width: 100%; margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default DemoModal;
