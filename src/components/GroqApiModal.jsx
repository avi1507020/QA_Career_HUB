import React, { useState, useEffect } from 'react';
import { Wifi, Loader2, HelpCircle, ExternalLink, X, Settings, CheckCircle } from 'lucide-react';
import { checkGroqConnection } from '../services/aiService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { isDemoUser } from '../utils/isDemoUser';

const GroqApiModal = ({ user, onClose }) => {
  const [apiKey, setApiKey] = useState(() => {
    return user 
      ? (localStorage.getItem('groq-api-key') || '')
      : (localStorage.getItem('groq_api_key_guest') || '');
  });
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); 
  const [connectionMessage, setConnectionMessage] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchGroqKey = async () => {
      if (user) {
        if (isDemoUser(user)) return;
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().profile?.groqApiKey) {
            const remoteKey = docSnap.data().profile.groqApiKey;
            setApiKey(remoteKey);
            localStorage.setItem('groq-api-key', remoteKey);
          }
        } catch (e) {
          console.error("Error fetching Groq API Key:", e);
        }
      }
    };
    fetchGroqKey();
  }, [user]);

  const handleCheckConnection = async () => {
    if (!apiKey.trim()) return;
    setIsCheckingConnection(true);
    setConnectionStatus(null);
    try {
      await checkGroqConnection(apiKey);
      setConnectionStatus('success');
      setConnectionMessage('Groq API Live!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      setConnectionStatus('fail');
      setConnectionMessage('Invalid API Key');
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (user) {
      localStorage.setItem('groq-api-key', apiKey);
      if (isDemoUser(user)) {
        setIsApiKeySaved(true);
        setTimeout(() => setIsApiKeySaved(false), 2000);
        return;
      }
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          await setDoc(docRef, {
            ...existingData,
            profile: {
              ...(existingData.profile || {}),
              groqApiKey: apiKey
            }
          }, { merge: true });
        } else {
          await setDoc(docRef, {
            profile: { groqApiKey: apiKey }
          });
        }
      } catch (e) {
        console.error("Error saving API key to profile:", e);
      }
    } else {
      localStorage.setItem('groq_api_key_guest', apiKey);
    }

    setIsApiKeySaved(true);
    setTimeout(() => setIsApiKeySaved(false), 2000);
  };

  const hasKey = Boolean(apiKey.trim());

  return (
    <>
      <div className="groq-modal-overlay open" onClick={onClose}>
        <div className="groq-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
              <Settings size={24} style={{ color: '#8b5cf6' }} /> GROQ API Connection
            </h2>
            <button onClick={onClose} className="groq-close-btn" title="Close">
              <X size={24} />
            </button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Global key — used by all agents on this platform
          </p>

          <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '10px', display: 'block' }}>GROQ API KEY</label>
            
            <div className="groq-input-stack" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="password" 
                placeholder="gsk-..." 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.8rem 1rem', color: 'white', flex: 2, outline: 'none' }}
              />
              <button 
                onClick={handleCheckConnection} 
                className="primary-button primary-button-blue" 
                style={{ padding: '0 1.2rem', borderRadius: '12px', height: '48px', minWidth: '100px' }}
              >
                {isCheckingConnection ? <Loader2 className="animate-spin" size={18} /> : <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Wifi size={18} /> Test</span>}
              </button>
            </div>
            
            <button onClick={handleSaveApiKey} className="primary-button primary-button-green" style={{ width: '100%', borderRadius: '12px', padding: '0.8rem', height: '48px', marginBottom: '12px' }}>
              {isApiKeySaved ? "Key Saved!" : "Save API Key"}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', background: hasKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: hasKey ? '#10b981' : '#ef4444', border: `1px solid ${hasKey ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, fontWeight: '700' }}>
                {hasKey ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>
            
            {connectionStatus === 'fail' && (
              <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: '#ef4444', fontWeight: '600', textAlign: 'center' }}>
                {connectionMessage}
              </p>
            )}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
            <button 
              onClick={() => setIsHelpOpen(!isHelpOpen)} 
              style={{ width: '100%', padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: '600' }}><HelpCircle size={18} style={{ color: '#8b5cf6' }} /> How to get your GROQ API key</span>
              <span style={{ transform: isHelpOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
            </button>
            
            {isHelpOpen && (
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <div className="help-steps" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {[
                    "Go to console.groq.com and create a free account",
                    "After logging in, click on \"API Keys\" in the left sidebar",
                    "Click the \"Create API Key\" button",
                    "Give your key a name (e.g., LinkedIn Post Generator)",
                    "Copy and save the key immediately — it won't be shown again",
                    "Paste the key back into this input field"
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', color: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0', lineHeight: '1.4' }}>{step}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <a 
                    href="https://console.groq.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="rocket-button" 
                    style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', width: '100%' }}
                  >
                    <ExternalLink size={16} /> Open Groq Console
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`groq-toast ${showToast ? 'visible' : ''}`}>
        <CheckCircle size={20} /> Groq API Live!
      </div>
    </>
  );
};

export default GroqApiModal;
