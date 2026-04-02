import React, { useState, useEffect } from 'react';
import { 
  Menu, Play, BookOpen, Clock, Award, 
  ChevronRight, Save, Copy, CheckCircle, 
  Loader2, Zap, AlertCircle, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const LearnPlaywright = ({ user }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('TypeScript');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq-api-key') || '');
  const [copyStatus, setCopyStatus] = useState({});
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);

  // Fetch API key like PostGenerator does
  useEffect(() => {
    const fetchGroqKey = async () => {
      if (user) {
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

  useEffect(() => {
    setIsApiKeyReady(Boolean(apiKey.trim()));
  }, [apiKey]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [id]: true });
    setTimeout(() => setCopyStatus({ ...copyStatus, [id]: false }), 2000);
  };

  const handleSaveForInterview = () => {
    if (!explanation || !selectedTopic) return;
    
    const savedString = localStorage.getItem('playwright_saved_topics') || '[]';
    let saved = [];
    try {
      saved = JSON.parse(savedString);
    } catch (e) {
      saved = [];
    }
    
    const newSave = {
      id: Date.now(),
      topic: selectedTopic,
      language: selectedLanguage,
      content: explanation,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('playwright_saved_topics', JSON.stringify([...saved, newSave]));
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleExplain = async () => {
    if (!selectedTopic || !isApiKeyReady) return;
    
    setIsLoading(true);
    setExplanation('');
    setIsBottomSheetOpen(false);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content: "You are an expert Playwright test automation coach. Explain topics in detail with code examples. Use clean markdown. Always use latest Playwright API."
            },
            {
              role: "user",
              content: `Topic: ${selectedTopic}\nLanguage: ${selectedLanguage}\n\nExplain with:\n1. Plain English explanation\n2. Why interviewers ask this\n3. Examples (Basic, Real-world, Advanced)\n4. Common mistakes\n5. Interview Q&A\n6. Pro tips`
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setExplanation(data.choices[0].message.content);
    } catch (error) {
      console.error("Error:", error);
      setExplanation("### Error\nFailed to generate content. Please check your connection or API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const topicGroups = [
    { group: 'BASICS', topics: ['What is Playwright?', 'Installation & Setup', 'Project Structure', 'Writing Your First Test', 'Running Tests'] },
    { group: 'CORE CONCEPTS', topics: ['Locators & Selectors', 'Actions (click, fill, hover, drag)', 'Assertions (expect API)', 'Auto-waiting', 'Screenshots & Videos'] },
    { group: 'PAGE INTERACTIONS', topics: ['Handling Iframes', 'File Upload & Download', 'Dialogs & Alerts', 'Multiple Tabs & Windows', 'Network Interception'] },
    { group: 'ADVANCED', topics: ['Page Object Model (POM)', 'Fixtures & Hooks', 'API Testing', 'Authentication', 'CI/CD', 'Debugging', 'Mobile Emulation', 'Visual Testing'] },
    { group: 'INTERVIEW PREP', topics: ['Top 20 Interview Questions', 'Common Mistakes', 'Best Practices', 'Playwright vs Selenium vs Cypress'] }
  ];

  return (
    <div className="section-container playwright-page-container" style={{ padding: '1.5rem 2.5rem', background: 'rgba(15, 23, 42, 0.2)', overflow: 'visible' }}>
      
      <div className="section-header-glass">
        <div className="header-title-group">
          <span style={{ fontSize: '24px' }}>🎭</span>
          <h2 className="header-title">Learn Playwright</h2>
        </div>
        <div style={{ background: 'rgba(139,92,246,0.1)', padding: '0.4rem 1rem', borderRadius: '20px', color: '#c4b5fd', fontSize: '0.8rem', fontWeight: '700' }}>
          {selectedLanguage}
        </div>
      </div>

      {!isApiKeyReady && (
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.2rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          <AlertCircle size={18} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          Configure your GROQ API key in the navbar to start.
        </div>
      )}

      <div className="playwright-layout">
        {/* Left Panel */}
        <div className={`control-panel-container ${isBottomSheetOpen ? 'mobile-open' : ''}`}>
          <div className="glass-card control-panel">
            <div className="mobile-handle-container">
              <div className="mobile-drag-indicator"></div>
              <button onClick={() => setIsBottomSheetOpen(false)} className="mobile-close-btn"><X /></button>
            </div>

            <div className="panel-section">
              <label>LANGUAGE</label>
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                {['TypeScript', 'JavaScript', 'Python', 'Java', 'C#'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="panel-section">
              <label>TOPIC</label>
              <select 
                className="topic-select"
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">Select Topic...</option>
                {topicGroups.map(g => (
                  <optgroup key={g.group} label={g.group} style={{ background: '#1e293b', color: '#a78bfa', fontWeight: 'bold' }}>
                    {g.topics.map(t => <option key={t} value={t} style={{ background: '#0f172a', color: 'white' }}>{t}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <button className="primary-button primary-button-blue explain-btn" onClick={handleExplain} disabled={isLoading || !selectedTopic || !isApiKeyReady}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Explain Topic'}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="content-panel-container">
          <div className="glass-card content-panel">
            {!explanation && !isLoading && (
              <div className="centered-placeholder">
                <BookOpen size={48} style={{ opacity: 0.2 }} />
                <p>Pick a topic to begin</p>
              </div>
            )}
            {isLoading && (
              <div className="loading-state">
                <Loader2 size={40} className="animate-spin" />
                <p>Generating...</p>
              </div>
            )}
            {explanation && (
              <div className="explanation-display">
                <button className="save-interview-btn" onClick={handleSaveForInterview}>
                  {saveStatus ? <CheckCircle size={14} /> : <Save size={14} />} {saveStatus ? 'Saved' : 'Save for Interview'}
                </button>
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="code-block-wrapper">
                          <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : <code className={className} {...props}>{children}</code>;
                    }
                  }}
                >
                  {explanation}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="mobile-fab" onClick={() => setIsBottomSheetOpen(true)}>
        <Menu /> <span>Topic</span>
      </button>

      <style>{`
        .playwright-page-container {
          min-height: 100%;
          overflow-y: visible !important;
        }

        .playwright-layout { display: flex; gap: 24px; margin-top: 1.5rem; align-items: flex-start; }
        
        .control-panel-container { 
          width: 320px; 
          position: sticky; 
          top: 20px; 
          z-index: 100;
        }

        .control-panel { 
          padding: 2rem; 
          background: rgba(30,41,59,0.4); 
          border-radius: 24px; 
          border: 1px solid rgba(255,255,255,0.1); 
          backdrop-filter: blur(10px);
        }

        .panel-section { margin-bottom: 1.5rem; }
        .panel-section label { display: block; color: #94a3b8; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px; }
        
        .control-panel select { 
          width: 100%; 
          background: rgba(15, 23, 42, 0.8); 
          border: 1px solid rgba(139,92,246,0.3); 
          border-radius: 12px; 
          padding: 12px; 
          color: white; 
          font-size: 16px; 
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
        }
        
        .control-panel select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
        }

        .explain-btn { width: 100%; padding: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border: none; color: white; border-radius: 12px; cursor: pointer; font-weight: 700; }
        
        .content-panel-container { flex: 1; min-width: 0; }
        
        .content-panel { 
          min-height: 600px; 
          padding: 2.5rem; 
          background: rgba(30,41,59,0.1); 
          border-radius: 24px; 
          border: 1px solid rgba(255,255,255,0.05); 
          position: relative; 
          height: auto;
        }

        .centered-placeholder, .loading-state { height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #64748b; }
        .explanation-display { color: #e2e8f0; line-height: 1.6; }
        .explanation-display h1, .explanation-display h2, .explanation-display h3 { color: white; margin: 1.5rem 0 0.8rem; }
        .explanation-display p { margin-bottom: 1rem; font-size: 1.05rem; }
        .code-block-wrapper { margin: 1.5rem 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .save-interview-btn { position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #34d399; padding: 0.6rem 1.2rem; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .save-interview-btn:hover { background: rgba(16,185,129,0.2); transform: translateY(-2px); }
        
        .mobile-fab { display: none; position: fixed; bottom: 2rem; right: 2rem; background: #8b5cf6; border: none; border-radius: 50px; padding: 12px 24px; color: white; font-weight: 700; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(139,92,246,0.3); z-index: 500; cursor: pointer; }
        .mobile-handle-container { display: none; }
        
        @media (max-width: 1024px) {
          .playwright-layout { flex-direction: column; }
          .control-panel-container { width: 100%; position: static; }
          .control-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .explain-btn { grid-column: span 2; }
          .panel-section { margin-bottom: 0; }
        }
        
        @media (max-width: 768px) {
          .mobile-fab { display: flex; }
          .control-panel-container { position: fixed; bottom: 0; left: 0; right: 0; z-index: 2000; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          .control-panel-container.mobile-open { transform: translateY(0); }
          .control-panel { border-radius: 20px 20px 0 0; display: block; border-top: 1px solid #8b5cf6; background: #0f172a; padding: 1.5rem 1.5rem 3rem; }
          .mobile-handle-container { display: flex; justify-content: center; position: relative; margin-bottom: 1.5rem; }
          .mobile-drag-indicator { width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; }
          .mobile-close-btn { position: absolute; right: 0; top: -5px; background: none; border: none; color: white; cursor: pointer; }
          .save-interview-btn { position: static; width: 100%; margin-bottom: 1.5rem; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default LearnPlaywright;
