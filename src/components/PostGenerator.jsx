import React, { useState } from 'react';
import { Sparkles, Copy, CheckCircle, Image as ImageIcon, Loader2, Wifi, AlertCircle, Send, Settings, Wand2, Trash2 } from 'lucide-react';
import { generatePosts, generateImagePrompt, checkGroqConnection } from '../services/aiService';

const PostGenerator = () => {
  const [topic, setTopic] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [imagePrompt, setImagePrompt] = useState(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq-api-key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); 
  const [connectionMessage, setConnectionMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState({});

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setPosts([]);
    setSelectedPostId(null);
    setImagePrompt(null);
    try {
      const generatedPosts = await generatePosts(topic, apiKey);
      setPosts(generatedPosts);
    } catch (error) {
      console.error("Error generating posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    if (!apiKey.trim()) return;
    setIsCheckingConnection(true);
    setConnectionStatus(null);
    try {
      await checkGroqConnection(apiKey);
      setConnectionStatus('success');
      setConnectionMessage('Groq API Live!');
    } catch (error) {
      setConnectionStatus('fail');
      setConnectionMessage('Invalid API Key');
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('groq-api-key', apiKey);
    setIsApiKeySaved(true);
    setTimeout(() => setIsApiKeySaved(false), 2000);
  };

  const handleClear = () => {
    setTopic('');
    setPosts([]);
    setSelectedPostId(null);
    setImagePrompt(null);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [id]: true });
    setTimeout(() => setCopyStatus({ ...copyStatus, [id]: false }), 2000);
  };

  return (
    <div className="section-container" style={{ padding: '1.5rem 2.5rem', background: 'rgba(15, 23, 42, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Sparkles size={24} style={{ color: '#8b5cf6' }} />
             <h2 style={{ margin: 0, color: 'white', fontSize: '1.6rem', fontWeight: '800' }}>LinkedIn Post Generator</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {posts.length > 0 && (
            <button 
              className="primary-button primary-button-red" 
              onClick={handleClear}
              style={{ fontSize: '0.85rem' }}
            >
              <Trash2 size={18} /> Clear Content
            </button>
          )}
          <button 
            className="primary-button" 
            onClick={() => setShowApiKey(!showApiKey)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}
          >
            <Settings size={18} /> {showApiKey ? "Hide Settings" : "API Configuration"}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Input & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {showApiKey && (
             <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '10px', display: 'block' }}>GROQ API KEY</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                   <input 
                     type="password" 
                     placeholder="gsk-..." 
                     value={apiKey} 
                     onChange={(e) => setApiKey(e.target.value)}
                     style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', flex: 1 }}
                   />
                   <button onClick={handleCheckConnection} className="primary-button primary-button-blue" style={{ padding: '0.5rem 1rem' }}>
                     {isCheckingConnection ? <Loader2 className="animate-spin" size={16} /> : <Wifi size={16} />}
                   </button>
                </div>
                <button onClick={handleSaveApiKey} className="primary-button primary-button-green" style={{ width: '100%' }}>
                  {isApiKeySaved ? "Key Saved!" : "Save API Key"}
                </button>
                {connectionStatus && (
                  <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: connectionStatus === 'success' ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                    {connectionMessage}
                  </p>
                )}
             </div>
          )}

          <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.08)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Wand2 size={20} style={{ color: '#8b5cf6' }} />
               Topic Wizard
            </h3>
            <textarea 
              placeholder="What do you want to write about? (e.g., The future of AI in Quality Engineering)..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', padding: '1rem', marginBottom: '1.5rem', resize: 'none', fontSize: '1rem' }}
            />
            <button 
              className="primary-button primary-button-blue" 
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim() || !apiKey.trim()}
              style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} style={{ marginRight: '10px' }} /> Generate Posts</>}
            </button>
            <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
              We will generate 5 high-quality professional posts for you.
            </p>
          </div>
        </div>

        {/* Right Side: Generated Content Grid */}
        <div style={{ overflowY: 'auto', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="loading-skeleton" style={{ height: '200px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
              <div className="loading-skeleton" style={{ height: '200px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
              <div className="loading-skeleton" style={{ height: '200px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
            </div>
          )}

          {!isLoading && posts.length === 0 && (
             <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', gap: '1rem' }}>
                <ImageIcon size={64} style={{ opacity: 0.2 }} />
                <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>Your generated content will appear here</p>
             </div>
          )}

          {!isLoading && posts.map((post, idx) => (
             <div 
               key={post.id} 
               style={{ 
                 background: 'rgba(255, 255, 255, 0.95)', 
                 borderRadius: '24px', 
                 padding: '2rem', 
                 boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                 transition: 'transform 0.3s ease'
               }}
               className="post-result-card"
             >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>
                    POST #{idx + 1}
                  </div>
                  <button 
                    onClick={() => handleCopy(post.content, post.id)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.9rem' }}
                  >
                    {copyStatus[post.id] ? <CheckCircle size={18} style={{ color: '#10b981' }} /> : <Copy size={18} />}
                    {copyStatus[post.id] ? "Saved!" : "Copy Post"}
                  </button>
               </div>
               <p style={{ color: '#1e293b', fontSize: '1.05rem', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
                 {post.content}
               </p>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostGenerator;
