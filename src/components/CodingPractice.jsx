import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, Play, BookOpen, Clock, Award, 
  ChevronRight, Save, Copy, CheckCircle, 
  Loader2, Zap, AlertCircle, X, ExternalLink,
  RotateCcw, SkipForward, Lightbulb, TrendingUp,
  History, Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const CodingPractice = ({ user }) => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  
  const [question, setQuestion] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  
  const [isQuestionMobileExpanded, setIsQuestionMobileExpanded] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [showLangResetDialog, setShowLangResetDialog] = useState(null); // stores targeted lang
  const [toast, setToast] = useState(null);
  
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => 
    sessionStorage.getItem('coding-desktop-banner-dismissed') === 'true'
  );
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq-api-key') || '');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('coding_practice_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [previousTopics, setPreviousTopics] = useState([]);

  const editorRef = useRef(null);

  // Boilerplate definitions
  const boilerplates = {
    'JavaScript': `// Write your solution here\n\nfunction solution() {\n  // your code here\n}\n\nsolution();`,
    'TypeScript': `// Write your solution here\n\nfunction solution(): void {\n  // your code here\n}\n\nsolution();`,
    'Java': `import java.util.*;\nimport java.util.stream.*;\nimport java.util.stream.Collectors;\nimport java.io.*;\n\npublic class Solution {\n  public static void main(String[] args) {\n    // your code here\n  }\n}`,
    'C#': `using System;\nusing System.Collections.Generic;\nusing System.Collections;\nusing System.Linq;\nusing System.Text;\nusing System.Text.RegularExpressions;\nusing System.IO;\nusing System.Threading.Tasks;\nusing NUnit.Framework;\n\nclass Solution {\n  static void Main(string[] args) {\n    // your code here\n  }\n}`,
    'Python': `# Write your solution here\nimport re\nimport json\nimport os\nfrom typing import List, Dict, Optional, Tuple\nfrom collections import defaultdict, Counter\n\ndef solution():\n    # your code here\n    pass\n\nsolution()`
  };

  // Setup initial code
  useEffect(() => {
    if (!userCode || userCode === boilerplates[selectedLanguage]) {
      setUserCode(boilerplates[selectedLanguage]);
    }
  }, [selectedLanguage]);

  // Read Groq Key
  useEffect(() => {
    const fetchKey = async () => {
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
          console.error("Error fetching Groq Key:", e);
        }
      }
    };
    fetchKey();
  }, [user]);

  // Load first question
  useEffect(() => {
    if (!question && apiKey) {
      loadQuestion();
    }
  }, [apiKey]);

  const showToast = (msg, type = 'blue') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadQuestion = async (skip = false, relatedTo = null) => {
    if (!apiKey) return;
    
    setIsLoadingQuestion(true);
    setFeedback(null);
    setIsHintVisible(false);
    setIsQuestionMobileExpanded(false);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: "You are a QA automation interview question generator. Generate coding questions specifically for QA automation engineers. Questions should test real skills needed in automation roles. Always respond with valid JSON only, no markdown, no extra text."
            },
            {
              role: "user",
              content: `Generate a QA automation coding interview question.\n\nLanguage: ${selectedLanguage}\nDifficulty: ${difficulty}\nTopic filter: ${selectedTopic}\nPreviously asked topics: ${JSON.stringify(previousTopics)}\nLast question topic: ${relatedTo || 'none'}\nSkip flag: ${skip}\n\nRules:\n- If last question topic exists, make the new question RELATED to it but slightly different or harder.\n- If Skip was clicked, pick a DIFFERENT topic.\n- Question must be solvable in 10-20 lines of code.\n- Must be relevant to QA automation engineering.\n- Include realistic QA context (test data, assertions, automation scenarios).\n\nRespond with this exact JSON structure:\n{\n  \"questionNumber\": number,\n  \"title\": string,\n  \"difficulty\": \"Easy\" | \"Medium\" | \"Hard\",\n  \"topic\": string,\n  \"tags\": string[],\n  \"description\": string,\n  \"requirements\": string[],\n  \"exampleInput\": string,\n  \"exampleOutput\": string,\n  \"hints\": string[],\n  \"relatedLearnPage\": \"sql\" | \"playwright\" | \"api\" | \"performance\" | \"design-patterns\" | null\n}`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error("Failed to load question");
      const data = await response.json();
      const newQuestion = JSON.parse(data.choices[0].message.content);
      
      setQuestion(newQuestion);
      setPreviousTopics(prev => [newQuestion.topic, ...prev].slice(0, 5));
      setQuestionCount(c => c + 1);
      
      // Reset editor only if it was boilerplate or intentionally skipped
      if (skip || userCode === boilerplates[selectedLanguage]) {
        setUserCode(boilerplates[selectedLanguage]);
      }
    } catch (e) {
      console.error("Error loading question:", e);
      showToast("Failed to load question. Try again.", "red");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleCheckCode = async () => {
    if (!userCode || userCode.trim() === boilerplates[selectedLanguage].trim()) {
      showToast("Please write your solution first", "amber");
      return;
    }
    
    setIsCheckingCode(true);
    setFeedback(null);

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
              content: "You are an expert QA automation code reviewer. Review code written by QA engineers for interview practice. Be constructive, specific, and helpful. Always respond with valid JSON only, no markdown, no extra text."
            },
            {
              role: "user",
              content: `Review this code submission for a QA coding interview practice session.\n\nQuestion: ${question.title}\nQuestion Description: ${question.description}\nLanguage: ${selectedLanguage}\nUser's Code:\n${userCode}\n\nEvaluate and respond with this exact JSON:\n{\n  \"score\": number (0-10),\n  \"criteria\": {\n    \"correctLogic\": boolean,\n    \"handlesEdgeCases\": boolean,\n    \"codeEfficiency\": boolean,\n    \"namingConventions\": boolean,\n    \"errorHandling\": boolean\n  },\n  \"whatYouDidWell\": string[],\n  \"needsImprovement\": string[],\n  \"lineByLineFeedback\": string[],\n  \"suggestedSolutionExplanation\": string,\n  \"suggestedSolutionCode\": string,\n  \"whyBetter\": string,\n  \"overallVerdict\": \"Excellent\" | \"Good effort\" | \"Needs work\"\n}`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error("Failed to check code");
      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      setFeedback(result);

      // Save to history
      const historyEntry = {
        id: Date.now(),
        title: question.title,
        score: result.score,
        topic: question.topic,
        timestamp: new Date().toISOString(),
        userCode: userCode,
        question: question
      };
      const newHistory = [historyEntry, ...history.slice(0, 9)];
      setHistory(newHistory);
      localStorage.setItem('coding_practice_history', JSON.stringify(newHistory));

    } catch (e) {
      console.error("Error checking code:", e);
      showToast("Error reviewing code. Try again.", "red");
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      setUserCode(val.substring(0, start) + "  " + val.substring(end));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleLanguageChange = (newLang) => {
    if (userCode !== boilerplates[selectedLanguage]) {
      setShowLangResetDialog(newLang);
    } else {
      setSelectedLanguage(newLang);
      setUserCode(boilerplates[newLang]);
    }
  };

  const topics = [
    "All Topics", "String Manipulation", "Arrays & Collections", "OOP Concepts", "Design Patterns",
    "Selenium/Playwright Automation", "API Testing Code", "Data Structures", "Algorithms for QA",
    "File Handling", "Exception Handling", "LINQ / Streams", "Regex", "Async / Await",
    "Database Queries in Code", "JSON Parsing", "Test Framework Code", "Mocking & Stubbing"
  ];

  const getScoreColor = (score) => {
    if (score >= 8) return '#10b981';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  };

  const reloadFromHistory = (entry) => {
    setQuestion(entry.question);
    setUserCode(entry.userCode);
    setFeedback(null);
    setSelectedLanguage(entry.question.language || selectedLanguage); // Note: assuming language might vary
  };

  return (
    <div className="coding-page-container section-container" style={{ padding: '0', background: 'transparent', overflow: 'visible' }}>
      
      {/* Desktop Notice Banner */}
      {!isBannerDismissed && (
        <div className="desktop-notice-banner">
          <div className="banner-left">
            <span>💻</span>
            <p>For the best coding experience, we recommend using a laptop or desktop.</p>
          </div>
          <button className="banner-close" onClick={() => { 
            setIsBannerDismissed(true); 
            sessionStorage.setItem('coding-desktop-banner-dismissed', 'true');
          }}>
            ✕
          </button>
        </div>
      )}

      <div style={{ padding: '1.5rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="section-header-glass">
        <div className="header-title-group">
          <span style={{ fontSize: '24px' }}>💻</span>
          <h2 className="header-title">QA Coding Practice</h2>
        </div>
        <div className="header-badges">
          <span className="count-badge">Q {questionCount} of ∞</span>
          {question && (
            <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
              {question.difficulty}
            </span>
          )}
          <span className="lang-badge">{selectedLanguage}</span>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="glass-card controls-bar">
        <div className="controls-left">
          <div className="control-item">
            <label>Language</label>
            <select value={selectedLanguage} onChange={(e) => handleLanguageChange(e.target.value)}>
              {['JavaScript', 'TypeScript', 'Java', 'C#', 'Python'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="control-item">
            <label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="control-item">
            <label>Topic</label>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="controls-right">
          <button className="icon-btn-text" onClick={() => loadQuestion(false, question?.topic)}>
            <Zap size={14} /> Next Question ▶
          </button>
          <button className="icon-btn-text secondary" onClick={() => loadQuestion(true)}>
            <SkipForward size={14} /> Skip
          </button>
          <button className="icon-btn-text secondary" onClick={() => setUserCode(boilerplates[selectedLanguage])}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="middle-layout">
        <div className="middle-main">
          {/* Question & Editor Row */}
          <div className="content-row">
            {/* Question Panel */}
            <div className={`question-panel-wrapper ${isQuestionMobileExpanded ? 'expanded' : ''}`}>
              <div className="glass-card content-panel question-panel">
                <button className="mobile-toggle-btn" onClick={() => setIsQuestionMobileExpanded(!isQuestionMobileExpanded)}>
                  <BookOpen size={16} /> {isQuestionMobileExpanded ? 'Hide' : 'View Question'}
                </button>
                
                {isLoadingQuestion ? (
                  <div className="loading-placeholder">
                    <Loader2 className="animate-spin" />
                    <p>Fetching question...</p>
                  </div>
                ) : question ? (
                  <div className="question-content">
                    <div className="q-meta">
                      <h3>{question.title}</h3>
                    </div>
                    <div className="q-description">
                      <p>{question.description}</p>
                    </div>
                    <div className="q-requirements">
                      <h4>Requirements</h4>
                      <ul>
                        {question.requirements.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                    <div className="code-example-box">
                      <div className="box-label">Example Input</div>
                      <pre>{question.exampleInput}</pre>
                      <div className="box-label">Example Output</div>
                      <pre>{question.exampleOutput}</pre>
                    </div>
                    
                    <div className="hints-section">
                      <button className="hint-toggle" onClick={() => setIsHintVisible(!isHintVisible)}>
                        <Lightbulb size={14} /> {isHintVisible ? 'Hide Hint' : 'Show Hint'}
                      </button>
                      {isHintVisible && (
                        <div className="hint-text">
                          {question.hints.map((h, i) => <p key={i}>• {h}</p>)}
                        </div>
                      )}
                    </div>

                    <div className="q-tags">
                      {question.tags.map(t => <span key={t} className="tag-pill">#{t}</span>)}
                    </div>
                  </div>
                ) : (
                  <div className="loading-placeholder">
                    <AlertCircle />
                    <p>Configure API Key to start</p>
                  </div>
                )}
              </div>
            </div>

            {/* Editor Panel */}
            <div className="editor-panel-wrapper">
              <div className="glass-card content-panel editor-panel">
                <div className="editor-header">
                  <div className="tab active">{selectedLanguage}</div>
                </div>
                <textarea
                  ref={editorRef}
                  className="code-editor"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  onKeyDown={handleTabKey}
                  placeholder="// Your code goes here..."
                  spellCheck="false"
                />
                <div className="editor-actions">
                  <button className="primary-button primary-button-blue" onClick={handleCheckCode} disabled={isCheckingCode || !question}>
                    {isCheckingCode ? <Loader2 className="animate-spin" /> : <><TrendingUp size={16} /> Check My Code</>}
                  </button>
                  <button className="primary-button primary-button-ghost" onClick={() => { navigator.clipboard.writeText(userCode); showToast("Copied!", "green"); }}>
                    <Copy size={16} /> Copy Code
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Panel */}
          {feedback && (
            <div className="feedback-section">
              <div className="glass-card feedback-panel">
                <div className="feedback-header">
                  <div className="score-main">
                    <div className="score-circle" style={{ borderColor: getScoreColor(feedback.score) }}>
                      <span className="score-num" style={{ color: getScoreColor(feedback.score) }}>{feedback.score}</span>
                      <span className="score-den">/ 10</span>
                      <div className="score-label" style={{ color: getScoreColor(feedback.score) }}>{feedback.overallVerdict}</div>
                    </div>
                  </div>
                  <div className="criteria-list">
                    {Object.entries(feedback.criteria).map(([key, val]) => (
                      <div key={key} className={`criteria-item ${val ? 'pass' : 'fail'}`}>
                        {val ? <CheckCircle size={14} /> : <X size={14} />} {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="feedback-body">
                  <div className="feedback-column">
                    <h4>📝 Code Review</h4>
                    <div className="feedback-bullets">
                      <h5>What you did well</h5>
                      <ul>{feedback.whatYouDidWell.map((f, i) => <li key={i} className="well">{f}</li>)}</ul>
                      <h5>Improvement areas</h5>
                      <ul>{feedback.needsImprovement.map((f, i) => <li key={i} className="needs">{f}</li>)}</ul>
                    </div>
                  </div>

                  <div className="feedback-column better-solution">
                    <h4>✨ Suggested Solution</h4>
                    <p>{feedback.suggestedSolutionExplanation}</p>
                    <div className="suggested-code-wrapper">
                      <div className="code-header">
                        <span>Solution</span>
                        <button onClick={() => { navigator.clipboard.writeText(feedback.suggestedSolutionCode); showToast("Copied!", "green"); }}><Copy size={12} /> Copy</button>
                      </div>
                      <SyntaxHighlighter language={selectedLanguage.toLowerCase()} style={vscDarkPlus} PreTag="div" customStyle={{ margin: 0, padding: '1rem', background: '#0f172a' }}>
                        {feedback.suggestedSolutionCode}
                      </SyntaxHighlighter>
                    </div>
                    <div className="why-better">
                      <h5>Why this is better</h5>
                      <p>{feedback.whyBetter}</p>
                    </div>
                  </div>
                </div>

                <div className="feedback-footer">
                  <button className="primary-button primary-button-blue" onClick={() => loadQuestion(false, question?.topic)}>
                    Next Related Question <ChevronRight size={16} />
                  </button>
                  {question?.relatedLearnPage && (
                    <button className="primary-button primary-button-ghost" onClick={() => navigate(`/learn-${question.relatedLearnPage}`)}>
                      📚 Learn This Topic
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="history-sidebar">
          <div className="glass-card sidebar-panel">
              <div className="sidebar-title"><History size={14} /> History</div>
            {history.length > 0 ? (
              <div className="history-list">
                {history.map(h => (
                  <div key={h.id} className="history-item" onClick={() => reloadFromHistory(h)}>
                    <div className="h-title">{h.title}</div>
                    <div className="h-meta">
                      <span className="h-score" style={{ color: getScoreColor(h.score) }}>{h.score}/10</span>
                      <span className="h-topic">{h.topic}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sidebar-empty">No history yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Lang Change */}
      {showLangResetDialog && (
        <div className="dialog-overlay open">
          <div className="glass-card dialog-box">
            <h4>Reset your code?</h4>
            <p>Switching language will reset your code to the new boilerplate. Continue?</p>
            <div className="dialog-actions">
              <button className="primary-button primary-button-blue" onClick={() => { setSelectedLanguage(showLangResetDialog); setUserCode(boilerplates[showLangResetDialog]); setShowLangResetDialog(null); }}>
                Yes, Reset
              </button>
              <button className="primary-button primary-button-ghost" onClick={() => setShowLangResetDialog(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast */}
      {toast && (
        <div className={`toast-notification visible ${toast.type}`}>
          <Info size={18} /> {toast.msg}
        </div>
      )}

      </div>

      <style>{`
        .coding-page-container { min-height: 100vh; display: flex; flex-direction: column; }
        
        /* Banner Styles */
        .desktop-notice-banner {
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(124, 58, 237, 0.35);
          border-radius: 10px;
          padding: 6px 16px;
          margin: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          backdrop-filter: blur(10px);
        }
        .banner-left { display: flex; align-items: center; gap: 12px; }
        .banner-left p { font-size: 13px; color: rgba(255,255,255,0.85); margin: 0; }
        .banner-close { background: none; border: none; color: rgba(255,255,255,0.5); font-size: 16px; cursor: pointer; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .banner-close:hover { color: white; }
        @media (min-width: 1025px) { .desktop-notice-banner { display: none; } }

        .header-title { color: white; font-size: 22px; font-weight: 700; }
        .header-badges { display: flex; gap: 12px; align-items: center; }
        .count-badge, .lang-badge, .difficulty-badge { 
          background: rgba(255,255,255,0.1); 
          border: 1px solid rgba(255,255,255,0.2); 
          border-radius: 20px; 
          padding: 4px 12px; 
          font-size: 12px; 
          font-weight: 600; 
          color: white; 
        }
        .difficulty-badge.easy { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.35); color: #4ade80; }
        .difficulty-badge.medium { background: rgba(251,191,36,0.15); border-color: rgba(251,191,36,0.35); color: #fbbf24; }
        .difficulty-badge.hard { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.35); color: #f87171; }

        .controls-bar { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 16px 20px; 
          border-radius: 14px; 
          background: rgba(255,255,255,0.06); 
          border: 1px solid rgba(255,255,255,0.1); 
          backdrop-filter: blur(10px);
        }
        .controls-left { display: flex; gap: 1.5rem; }
        .control-item { display: flex; flex-direction: column; gap: 6px; }
        .control-item label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: rgba(255,255,255,0.45); text-transform: uppercase; }
        .control-item select { 
          background: rgba(255,255,255,0.08); 
          border: 1px solid rgba(255,255,255,0.15); 
          border-radius: 8px; 
          color: white; 
          font-size: 13px; 
          padding: 8px 12px; 
          height: 40px; 
          outline: none; 
          cursor: pointer; 
          width: 100%; 
          appearance: none;
        }
        .control-item select option { background: #1a1535; color: white; }
        
        .controls-right { display: flex; gap: 12px; }
        .icon-btn-text { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          background: linear-gradient(135deg, #7c3aed, #4f46e5); 
          border: none; 
          color: white; 
          padding: 8px 18px; 
          border-radius: 8px; 
          font-size: 13px; 
          font-weight: 600; 
          height: 40px;
          cursor: pointer; 
          transition: transform 0.2s, box-shadow 0.2s; 
        }
        .icon-btn-text:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
        .icon-btn-text.secondary { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
        .icon-btn-text.secondary:hover { background: rgba(255,255,255,0.12); color: white; border-color: rgba(255,255,255,0.2); }

        .middle-layout { display: flex; gap: 1.5rem; }
        .middle-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.5rem; }
        .content-row { display: flex; gap: 1.5rem; align-items: flex-start; }
        .question-panel-wrapper { width: 40%; }
        .editor-panel-wrapper { width: 60%; }
        
        .content-panel { 
          background: rgba(255,255,255,0.06); 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 16px; 
          padding: 24px; 
          backdrop-filter: blur(10px);
          min-height: 400px; 
        }
        
        .loading-placeholder { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.4; gap: 1rem; color: white; }
        .mobile-toggle-btn { display: none; margin-bottom: 1rem; width: 100%; justify-content: center; gap: 8px; align-items: center; padding: 12px; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.3); border-radius: 8px; color: #a78bfa; font-weight: 700; cursor: pointer; }

        .q-meta h3 { font-size: 17px; font-weight: 700; color: white; margin-bottom: 12px; line-height: 1.4; }
        .q-description p { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.7; margin-bottom: 1.5rem; }
        .q-requirements h4 { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #7c63f5; text-transform: uppercase; margin: 16px 0 8px; }
        .q-requirements ul { padding-left: 1.2rem; margin-bottom: 2rem; }
        .q-requirements li { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 6px; line-height: 1.7; }
        
        .code-example-box { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.8); margin-bottom: 2rem; }
        .box-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 8px; }
        .code-example-box pre { margin-bottom: 10px; white-space: pre-wrap; }

        .hints-section { margin-bottom: 1.5rem; }
        .hint-toggle { color: #a78bfa; font-size: 13px; font-weight: 600; background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s; }
        .hint-toggle:hover { opacity: 0.8; }
        .hint-text { margin-top: 10px; padding: 12px; background: rgba(124, 58, 237, 0.05); border-radius: 8px; color: #a78bfa; font-size: 12px; line-height: 1.5; border: 1px dashed rgba(124, 58, 237, 0.2); }

        .q-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag-pill { background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.35); border-radius: 20px; padding: 3px 10px; font-size: 11px; color: #a78bfa; font-weight: 600; }

        .editor-header { display: flex; margin-bottom: 12px; }
        .editor-header .tab { background: rgba(124,58,237,0.25); border-bottom: 2px solid #7c3aed; color: #a78bfa; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 6px 6px 0 0; }
        
        .code-editor { 
          width: 100%; 
          min-height: 340px; 
          background: rgba(0,0,0,0.45); 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 10px; 
          padding: 16px; 
          color: #e2e8f0; 
          font-family: 'Fira Code', 'Courier New', monospace; 
          font-size: 13px; 
          line-height: 1.7; 
          resize: vertical; 
          outline: none; 
          caret-color: #a78bfa;
          transition: border-color 0.2s;
        }
        .code-editor:focus { border-color: rgba(124,58,237,0.5); }
        
        .editor-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .editor-actions .primary-button { 
          height: 44px; 
          border-radius: 8px; 
          font-size: 13px; 
          font-weight: 700; 
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
        }

        .feedback-panel { 
          background: rgba(255,255,255,0.06); 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 16px; 
          padding: 24px; 
          backdrop-filter: blur(10px);
          margin-top: 16px; 
        }
        .feedback-header { display: flex; gap: 3rem; align-items: center; margin-bottom: 2rem; padding: 1.5rem; border-radius: 16px; background: rgba(255,255,255,0.02); }
        .score-num { font-size: 40px; font-weight: 800; line-height: 1; }
        .score-den { font-size: 14px; color: rgba(255,255,255,0.3); font-weight: 700; margin-left: 4px; }
        .score-label { margin-top: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        
        .criteria-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 2.5rem; }
        .criteria-item { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .criteria-item.pass { color: #4ade80; }
        .criteria-item.fail { color: #f87171; }

        .feedback-body { display: flex; gap: 2.5rem; }
        .feedback-column h4 { font-size: 15px; font-weight: 700; color: white; margin-bottom: 12px; }
        .feedback-column h5 { font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 12px 0 6px; color: rgba(255,255,255,0.4); }
        .feedback-bullets li { font-size: 13px; margin-bottom: 8px; line-height: 1.7; }
        .feedback-bullets li.well { color: #4ade80; list-style-type: '✓ '; }
        .feedback-bullets li.needs { color: #f87171; list-style-type: '⚠ '; }

        .suggested-code-wrapper { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin: 1rem 0; }
        .suggested-code-wrapper .code-header { background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; }
        .suggested-code-wrapper .code-header span { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 700; }
        .suggested-code-wrapper .code-header button { background: none; border: none; color: #a78bfa; cursor: pointer; display: flex; align-items: center; gap: 6px; height: auto; padding: 4px 8px; font-size: 11px; }
        
        .why-better p { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; font-style: italic; margin-top: 12px; }

        .feedback-footer { margin-top: 2rem; display: flex; gap: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; }
        .feedback-footer .primary-button { height: 44px; border-radius: 8px; font-size: 13px; font-weight: 600; padding: 0 20px; }

        .history-sidebar { width: 220px; }
        .sidebar-panel { 
          background: rgba(255,255,255,0.06); 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 16px; 
          padding: 16px; 
          backdrop-filter: blur(10px);
          height: fit-content; 
        }
        .sidebar-title { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .history-list { display: flex; flex-direction: column; gap: 8px; }
        .history-item { padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: all 0.2s; }
        .history-item:hover { background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3); }
        .h-title { font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
        .h-meta { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; }
        .h-topic { color: #a78bfa; }
        .sidebar-empty { font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; padding: 20px 0; }

        .dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); z-index: 10000; display: flex; align-items: center; justify-content: center; visibility: hidden; opacity: 0; transition: all 0.3s; }
        .dialog-overlay.open { visibility: visible; opacity: 1; }
        .dialog-box { width: 400px; padding: 2rem; text-align: center; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); background: #1a1535; }
        .dialog-box h4 { font-size: 1.25rem; color: white; margin-bottom: 0.5rem; font-weight: 700; }
        .dialog-box p { color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 2rem; line-height: 1.6; }
        .dialog-actions { display: flex; gap: 1rem; }
        .dialog-actions button { flex: 1; height: 44px; border-radius: 8px; font-weight: 700; }

        @media (max-width: 1200px) {
          .middle-layout { flex-direction: column; }
          .history-sidebar { display: none; }
          .content-row { flex-direction: column; }
          .question-panel-wrapper, .editor-panel-wrapper { width: 100%; }
        }

        @media (max-width: 768px) {
          .coding-page-container { padding: 1rem !important; }
          .section-header-glass { flex-direction: column; gap: 1rem; align-items: flex-start; }
          .controls-bar { flex-direction: column; gap: 1.5rem; padding: 1.5rem; }
          .controls-left { flex-direction: column; width: 100%; gap: 1rem; }
          .control-item select { width: 100%; font-size: 16px; }
          .controls-right { width: 100%; flex-wrap: wrap; }
          .controls-right button { flex: 1; min-width: 120px; }
          
          .mobile-toggle-btn { display: flex; }
          .question-panel .question-content { display: none; }
          .question-panel-wrapper.expanded .question-content { display: block; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
          
          .code-editor { min-height: 280px; font-size: 13px; }
          .feedback-header { flex-direction: column; gap: 2rem; text-align: center; }
          .criteria-list { grid-template-columns: 1fr; gap: 10px; }
          .feedback-body { flex-direction: column; gap: 2rem; }
          
          .feedback-footer { flex-direction: column; }
          .feedback-footer button { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CodingPractice;
