import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, CheckCircle, Image as ImageIcon, Loader2, Wifi, AlertCircle, Send, Settings, Wand2, Trash2, HelpCircle, ExternalLink, X, UserCircle } from 'lucide-react';
import { generatePosts, generateImagePrompt, checkGroqConnection } from '../services/aiService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const PostGenerator = ({ user }) => {
  const [topic, setTopic] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [imagePrompt, setImagePrompt] = useState(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq-api-key') || '');
  const [copyStatus, setCopyStatus] = useState({});

  useEffect(() => {
    const fetchGroqKey = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().profile?.groqApiKey) {
            setApiKey(docSnap.data().profile.groqApiKey);
            localStorage.setItem('groq-api-key', docSnap.data().profile.groqApiKey);
          }
        } catch (e) {
          console.error("Error fetching Groq API Key:", e);
        }
      }
    };
    fetchGroqKey();
  }, [user]);

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

  const handleGenerateImagePrompt = async (postContent, id) => {
    setSelectedPostId(id);
    setIsGeneratingPrompt(true);
    try {
      const prompt = await generateImagePrompt(postContent, apiKey);
      setImagePrompt(prompt);
    } catch (error) {
      console.error("Error generating image prompt:", error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  return (
    <div className="section-container" style={{ padding: '1.5rem 2.5rem', background: 'rgba(15, 23, 42, 0.2)' }}>
      <div className="section-header-glass">
        <div className="header-title-group">
             <Sparkles size={24} style={{ color: '#8b5cf6' }} />
             <h2 className="header-title">LinkedIn Post Generator</h2>
        </div>
        <div className="header-actions-group">
          {posts.length > 0 && (
            <button 
              className="primary-button primary-button-red btn-sm" 
              onClick={handleClear}
            >
              <Trash2 size={16} /> <span className="hide-mobile">Clear Content</span>
            </button>
          )}
        </div>
      </div>

      <div className="generator-layout">
        {/* Left Side: Input & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
        <div className="post-feed">
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

          {!isLoading && posts.map((post, idx) => {
             const wordCount = post.content.split(/\s+/).filter(Boolean).length;
             const charCount = post.content.length;
             
             return (
               <div 
                 key={post.id} 
                 style={{ 
                   background: 'rgba(30, 41, 59, 0.7)', 
                   backdropFilter: 'blur(16px)',
                   WebkitBackdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255, 255, 255, 0.1)',
                   borderRadius: '24px', 
                   padding: '0', 
                   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                   transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                   overflow: 'hidden',
                   position: 'relative',
                   display: 'flex',
                   flexDirection: 'column',
                   flexShrink: 0,
                 }}
                 className="post-result-card-v2"
                 onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 45px rgba(139, 92, 246, 0.2)';
                    e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.4)';
                 }}
                 onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                 }}
               >
                 {/* Styled Header */}
                 <div style={{ background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', padding: '1.2rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
                        <UserCircle size={28} />
                      </div>
                      <div>
                        <div style={{ color: '#f8fafc', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          LinkedIn Post <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>#{idx + 1}</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          Generated via QA Career Hub
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Post Content */}
                 <div style={{ padding: '2rem 2rem 1.5rem', flex: 1 }}>
                   <div className="post-content-scroll" style={{ height: '250px', overflowY: 'auto', scrollBehavior: 'smooth', paddingRight: '12px' }}>
                     <p style={{ color: '#f1f5f9', fontSize: '1.05rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', margin: 0, fontWeight: '400', fontFamily: '"Inter", "Outfit", sans-serif', letterSpacing: '0.2px' }}>
                       {post.content}
                     </p>
                   </div>
                 </div>

                 {/* Divider and Footer */}
                 <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', display: 'flex', gap: '15px' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{wordCount} words</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>•</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{charCount} chars</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleGenerateImagePrompt(post.content, post.id)}
                        disabled={isGeneratingPrompt && selectedPostId === post.id}
                        style={{ 
                          background: 'rgba(139, 92, 246, 0.1)', 
                          border: '1px solid rgba(139, 92, 246, 0.3)', 
                          borderRadius: '12px',
                          padding: '0.6rem 1.2rem',
                          cursor: (isGeneratingPrompt && selectedPostId === post.id) ? 'not-allowed' : 'pointer', 
                          color: '#c4b5fd', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontWeight: '600', 
                          fontSize: '0.9rem', 
                          opacity: (isGeneratingPrompt && selectedPostId === post.id) ? 0.7 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!(isGeneratingPrompt && selectedPostId === post.id)) {
                             e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                             e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(isGeneratingPrompt && selectedPostId === post.id)) {
                             e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                             e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {isGeneratingPrompt && selectedPostId === post.id ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                        Image Prompt
                      </button>
                      
                      <button 
                        onClick={() => handleCopy(post.content, post.id)}
                        style={{ 
                          background: copyStatus[post.id] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.1)', 
                          border: copyStatus[post.id] ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)', 
                          borderRadius: '12px',
                          padding: '0.6rem 1.2rem',
                          cursor: 'pointer', 
                          color: copyStatus[post.id] ? '#34d399' : '#93c5fd', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontWeight: '600', 
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = copyStatus[post.id] ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = copyStatus[post.id] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {copyStatus[post.id] ? <CheckCircle size={16} /> : <Copy size={16} />}
                        {copyStatus[post.id] ? "Copied!" : "Copy Post"}
                      </button>
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Image Prompt Modal */}
      {imagePrompt && (
        <div className="confirmation-overlay open" style={{ zIndex: 6000 }} onClick={() => setImagePrompt(null)}>
          <div className="confirmation-popup" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', textAlign: 'left', background: '#0f172a', border: '1px solid rgba(139, 92, 246, 0.3)', color: 'white', padding: '2.5rem' }} onClick={(e) => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ImageIcon size={24} style={{ color: '#8b5cf6' }} /> Image Prompt
                </h2>
                <button onClick={() => setImagePrompt(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                   <X size={20} />
                </button>
             </div>
             
             <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', flexShrink: 0 }}>
               Copy this prompt and paste it into ChatGPT, Gemini, or any image generation tool to generate an image for your post.
             </p>

             <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', overflowY: 'auto' }}>
                <p style={{ color: '#e2e8f0', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                  {imagePrompt}
                </p>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                <button 
                  onClick={() => handleCopy(imagePrompt, 'prompt')}
                  className="primary-button primary-button-blue"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {copyStatus['prompt'] ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copyStatus['prompt'] ? "Copied!" : "Copy Prompt"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostGenerator;
