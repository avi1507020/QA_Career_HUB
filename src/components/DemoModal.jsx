import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { DEMO_EMAIL, DEMO_PASSWORD, loginAsDemo } from '../utils/useDemoAuth';

const DemoModal = ({ onClose, setUser }) => {
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showGroqSteps, setShowGroqSteps] = useState(false);

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

  const handleLaunch = () => {
    loginAsDemo(DEMO_EMAIL, DEMO_PASSWORD, setUser);
    onClose();
    navigate('/');
    const toast = document.createElement('div');
    toast.innerHTML = '🚀 Demo mode active! Explore freely.';
    Object.assign(toast.style, {
      background: '#1a1535',
      border: '1px solid #4ade80',
      borderRadius: '10px',
      padding: '10px 16px',
      fontSize: '13px',
      color: 'white',
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '9999',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      fontFamily: 'Inter, sans-serif',
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease-out';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          fontFamily: 'Inter, sans-serif',
        }}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        tabIndex={-1}
      >
        {/* MODAL BOX */}
        <div
          style={{
            background: '#13112a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.12)',
            animation: 'demoModalIn 0.22s ease-out forwards',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
          className="demo-modal-box"
        >
          {/* STICKY HEADER */}
          <div
            style={{
              flexShrink: 0,
              background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
              padding: '20px 52px 16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
              borderRadius: '20px 20px 0 0',
              position: 'relative',
            }}
          >
            <h2
              style={{
                fontSize: '17px',
                fontWeight: '800',
                color: 'white',
                margin: 0,
                lineHeight: '1.35',
              }}
            >
              Try the Full App — Demo Mode 🚀
            </h2>
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.55)',
                marginTop: '5px',
                marginBottom: 0,
                lineHeight: '1.4',
              }}
            >
              No sign up needed. Explore everything instantly. Data is not saved.
            </p>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="demo-close-btn"
              title="Close"
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                right: '14px',
                width: '32px',
                height: '32px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div
            className="demo-modal-body"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* CARD 1: CREDENTIALS */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                🔑 Demo Credentials
              </div>

              {/* Email */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>Email</div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '7px',
                    padding: '7px 10px',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#a78bfa', wordBreak: 'break-all' }}>
                    {DEMO_EMAIL}
                  </span>
                  <button
                    onClick={() => handleCopy(DEMO_EMAIL, 'email')}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', minWidth: '44px', minHeight: '36px', padding: 0,
                      flexShrink: 0, fontSize: '14px',
                    }}
                  >
                    {copiedEmail ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />

              {/* Password */}
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>Password</div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '7px',
                    padding: '7px 10px',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#a78bfa' }}>
                    {DEMO_PASSWORD}
                  </span>
                  <button
                    onClick={() => handleCopy(DEMO_PASSWORD, 'password')}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', minWidth: '44px', minHeight: '36px', padding: 0,
                      flexShrink: 0, fontSize: '14px',
                    }}
                  >
                    {copiedPassword ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: FEATURES */}
            <div
              style={{
                background: 'rgba(74,222,128,0.05)',
                border: '1px solid rgba(74,222,128,0.15)',
                borderRadius: '12px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', marginBottom: '8px' }}>
                ✅ Full Access to All Features
              </div>
              <div
                className="demo-features-grid"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}
              >
                {[
                  'LinkedIn Post Generator', 'QA Mock Interview',
                  'Learn Playwright', 'QA Coding Practice',
                  'Learn SQL for QA', 'Job Buddy',
                  'Learn API Testing', 'MBA Finance Jobs',
                  'Learn Performance & K6', 'Learn Design Patterns',
                  'Modern Job Tracker', 'GROQ AI (pre-configured)',
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      fontSize: '11px', color: 'rgba(255,255,255,0.65)',
                      display: 'flex', alignItems: 'center', gap: '5px', lineHeight: '1.5',
                    }}
                  >
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: DATA WARNING */}
            <div
              style={{
                background: 'rgba(251,191,36,0.07)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                ⚠️ Demo mode only — no data is saved. Refreshing resets everything. Create a free account to save your progress.
              </p>
            </div>

            {/* CARD 4: GROQ STATUS (pre-configured, read-only) */}
            <div
              style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>⚡ GROQ API — Pre-configured</div>
                <div
                  style={{
                    background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
                    color: '#4ade80', borderRadius: '20px', padding: '3px 10px',
                    fontSize: '10px', fontWeight: '700',
                  }}
                >
                  ✓ Ready
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <div className="demo-groq-pulse" />
                <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: '600' }}>
                  Connected — AI features active
                </span>
              </div>

              <p style={{ margin: '8px 0 10px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
                A shared GROQ key is pre-configured for demo users. All AI-powered features work instantly — no setup needed.
              </p>

              {/* Collapsed accordion */}
              <button
                onClick={() => setShowGroqSteps(!showGroqSteps)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', fontSize: '11px', padding: '4px 0', textAlign: 'left',
                }}
              >
                ❓ How to get your own GROQ key (for your real account)
                <span style={{ transform: showGroqSteps ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0, marginLeft: '8px' }}>▼</span>
              </button>

              {showGroqSteps && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Go to console.groq.com and create a free account',
                    'After logging in, click "API Keys" in the left sidebar',
                    'Click the "Create API Key" button',
                    'Give your key a name (e.g. QA Career Hub)',
                    'Copy and save the key — it will not be shown again',
                    'Add your key after creating a real account via the GROQ API button in the navbar',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)',
                          color: '#a78bfa', fontSize: '10px', fontWeight: '700',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>{step}</div>
                    </div>
                  ))}
                  <button
                    onClick={() => window.open('https://console.groq.com', '_blank')}
                    style={{
                      marginTop: '4px', background: 'rgba(124,58,237,0.2)',
                      border: '1px solid rgba(124,58,237,0.4)', borderRadius: '8px',
                      color: '#a78bfa', fontSize: '11px', fontWeight: '600',
                      padding: '8px', cursor: 'pointer', width: '100%',
                    }}
                  >
                    Open Groq Console ↗
                  </button>
                  <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                    You can add your own key after creating a real account.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STICKY FOOTER */}
          <div
            style={{
              flexShrink: 0,
              padding: '14px 20px 18px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: '#13112a',
              borderRadius: '0 0 20px 20px',
            }}
          >
            <button
              className="demo-launch-btn"
              onClick={handleLaunch}
              style={{
                width: '100%', height: '48px',
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', letterSpacing: '0.01em', transition: 'all 0.2s',
              }}
            >
              🚀 Launch Demo Now
            </button>
            <button
              onClick={() => { onClose(); navigate('/login'); }}
              style={{
                width: '100%', background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.35)', fontSize: '12px',
                cursor: 'pointer', padding: '4px',
              }}
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes demoModalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .demo-close-btn:hover { background: rgba(255,255,255,0.2) !important; }
        .demo-close-btn:active { transform: translateY(-50%) scale(0.95) !important; }
        .demo-modal-body::-webkit-scrollbar { width: 4px; }
        .demo-modal-body::-webkit-scrollbar-track { background: transparent; }
        .demo-modal-body::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.5); border-radius: 4px; }
        .demo-launch-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .demo-launch-btn:active { transform: scale(0.98); }
        .demo-groq-pulse {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 6px #4ade80;
          flex-shrink: 0; animation: groqPulse 2s infinite;
        }
        @keyframes groqPulse {
          0%, 100% { box-shadow: 0 0 4px #4ade80; }
          50%       { box-shadow: 0 0 14px #4ade80; }
        }
        @media (max-width: 768px) {
          .demo-modal-box {
            border-radius: 20px 20px 0 0 !important;
            max-height: 92vh !important;
            max-width: 100vw !important;
          }
          .demo-features-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 380px) {
          .demo-modal-box h2 { font-size: 15px !important; }
        }
      `}</style>
    </>
  );
};

export default DemoModal;
