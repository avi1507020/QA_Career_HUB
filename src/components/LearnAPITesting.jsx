import React, { useState, useEffect } from 'react';
import {
  Plug, Copy, Loader2, Save, X, ExternalLink, Menu,
  AlertCircle, CheckCircle, ChevronRight, BookOpen, Code, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { isDemoUser } from '../utils/isDemoUser';

// ─── Content Definitions (framework → topics) ─────────────────────────────────
const CONTENT_MAP = {
  "API Fundamentals": {
    icon: "🌐", lang: "Concepts", color: "#60a5fa", accent: "rgba(96,165,250,0.15)",
    topics: [
      "What is an API?", "REST vs SOAP vs GraphQL vs gRPC",
      "HTTP Methods (GET POST PUT PATCH DELETE)", "HTTP Status Codes Complete Guide",
      "Request Structure (Headers Body Params)", "Response Structure (Status Headers Body)",
      "Query Params vs Path Params vs Body", "Content Types (JSON XML Form Data)",
      "API Versioning", "Idempotency in APIs", "Stateless vs Stateful APIs",
      "Synchronous vs Asynchronous APIs", "Webhooks vs REST APIs", "Rate Limiting and Throttling",
      "What is API Testing?", "Why API Testing Matters for QA", "Types of API Testing",
      "Functional API Testing", "Integration API Testing", "Contract Testing",
      "End-to-End API Testing", "Negative API Testing", "Boundary Value Testing for APIs",
      "API Testing Checklist for QA", "Difference Between UI and API Testing"
    ]
  },
  "Auth & Security": {
    icon: "🔐", lang: "Security", color: "#f472b6", accent: "rgba(244,114,182,0.15)",
    topics: [
      "Basic Authentication", "API Key Authentication", "Bearer Token Authentication",
      "OAuth 2.0 Flow Explained", "JWT (JSON Web Token) Deep Dive",
      "Session vs Token Authentication", "Testing Secured Endpoints",
      "SSL and TLS in API Testing", "CORS — What QA Needs to Know",
      "OWASP API Security Top 10", "SQL Injection via API",
      "Authentication Bypass Testing", "Sensitive Data Exposure Testing"
    ]
  },
  "Postman": {
    icon: "📮", lang: "No-Code", color: "#f97316", accent: "rgba(249,115,22,0.15)",
    topics: [
      "Postman Workspace Setup", "Creating and Organizing Collections",
      "Environment Variables in Postman", "Writing Pre-request Scripts",
      "Writing Test Scripts (pm.test)", "Assertions in Postman (pm.expect)",
      "Running Collections with Newman", "Postman Mock Servers",
      "Postman API Monitoring", "Importing OpenAPI and Swagger into Postman",
      "Data-Driven Testing in Postman (CSV JSON)", "Postman in CI/CD with Newman"
    ]
  },
  "Rest Assured": {
    icon: "☕", lang: "Java", color: "#fbbf24", accent: "rgba(251,191,36,0.15)",
    topics: [
      "What is Rest Assured and Setup", "Project Structure and Dependencies",
      "Making GET Requests", "Making POST Requests", "PUT PATCH DELETE Requests",
      "Request Specification and Base URI", "Response Specification",
      "Path Parameters and Query Parameters", "Request Headers and Authentication",
      "Request Body (JSON XML)", "Response Validation (statusCode body)",
      "JSON Path and XML Path Extraction", "Hamcrest Matchers in Rest Assured",
      "JSON Schema Validation", "File Upload and Download", "Multipart Form Data",
      "Filters and Logging", "Rest Assured with TestNG", "Rest Assured with JUnit 5",
      "Data-Driven API Testing", "Rest Assured with Allure Reports", "Rest Assured in CI/CD"
    ]
  },
  "RestSharp": {
    icon: "♦", lang: "C#", color: "#a78bfa", accent: "rgba(167,139,250,0.15)",
    topics: [
      "What is RestSharp and Setup", "Project Structure (.NET)", "Creating a RestClient",
      "Making GET Requests", "Making POST Requests", "PUT PATCH DELETE Requests",
      "Request Headers and Authentication", "Serialization and Deserialization (JSON)",
      "Query Parameters and URL Segments", "Response Handling and Status Codes",
      "Assertions with FluentAssertions", "RestSharp with NUnit", "RestSharp with xUnit",
      "Data-Driven Testing with RestSharp", "RestSharp with Bearer Token Auth",
      "RestSharp with OAuth2", "JSON Schema Validation in C#",
      "RestSharp Async Requests", "RestSharp in CI/CD (Azure DevOps)",
      "RestSharp with Allure or ExtentReports"
    ]
  },
  "Playwright API": {
    icon: "🎭", lang: "TypeScript", color: "#34d399", accent: "rgba(52,211,153,0.15)",
    topics: [
      "Playwright API Testing Setup", "Making GET Requests with request context",
      "Making POST Requests", "PUT PATCH DELETE Requests",
      "Setting Headers and Auth Tokens", "Request Body and JSON Payload",
      "Response Assertions (expect)", "JSON Response Extraction",
      "Schema Validation in Playwright", "Reusing Auth State Across Tests",
      "API and UI Combined Testing", "Mocking API Responses in Playwright",
      "Intercepting Network Requests", "Data-Driven API Tests in Playwright",
      "Playwright API Tests in CI/CD"
    ]
  },
  "SuperTest": {
    icon: "⚡", lang: "Node.js", color: "#4ade80", accent: "rgba(74,222,128,0.15)",
    topics: [
      "What is SuperTest and Setup", "Testing Express and Node APIs",
      "GET POST PUT DELETE with SuperTest", "Assertions with Jest and SuperTest",
      "Auth Header Testing", "SuperTest in CI/CD"
    ]
  },
  "Karate DSL": {
    icon: "🥋", lang: "Gherkin", color: "#fb923c", accent: "rgba(251,146,60,0.15)",
    topics: [
      "What is Karate DSL and Setup", "Writing Feature Files for API Tests",
      "GET POST PUT DELETE in Karate", "Assertions and Matching in Karate",
      "Data-Driven Testing in Karate", "Karate in CI/CD"
    ]
  },
  "Advanced Topics": {
    icon: "🚀", lang: "Architecture", color: "#e879f9", accent: "rgba(232,121,249,0.15)",
    topics: [
      "Contract Testing with Pact", "Consumer-Driven Contract Testing",
      "API Mocking and Stubbing (WireMock MSW)", "GraphQL Testing", "gRPC API Testing",
      "WebSocket API Testing", "API Versioning Testing Strategies",
      "Backward Compatibility Testing", "API Pagination Testing",
      "File Upload and Download Testing", "API Caching Testing",
      "Idempotency Testing", "Chaos Engineering for APIs",
      "Framework Architecture for API Testing", "API Service Layer Pattern",
      "Base Request and Response Classes", "Config and Environment Management",
      "Reusable Auth Helpers", "Request Builder Pattern",
      "Response Model and POJO Classes", "Logging and Reporting",
      "Retry Logic for Flaky API Tests", "Parallel API Test Execution",
      "API Test Framework in CI/CD Pipeline"
    ]
  },
  "Performance & Security": {
    icon: "📊", lang: "Testing", color: "#f87171", accent: "rgba(248,113,113,0.15)",
    topics: [
      "API Load Testing Basics", "API Performance Benchmarks", "Response Time Assertions",
      "API Security Testing Checklist", "Rate Limiting and Throttling Testing", "XSS via API Testing",
      "Swagger and OpenAPI Spec Reading", "Generating Tests from OpenAPI Spec",
      "JSON Schema Validator", "WireMock API Mocking", "Mock Service Worker (MSW)",
      "Insomnia vs Postman", "curl for API Testing", "jq for JSON Processing",
      "Faker Libraries for Test Data"
    ]
  },
  "CI/CD & Reports": {
    icon: "🔄", lang: "DevOps", color: "#38bdf8", accent: "rgba(56,189,248,0.15)",
    topics: [
      "Running API Tests in GitHub Actions", "Running API Tests in Jenkins",
      "Running API Tests in Azure DevOps", "Allure Reports for API Tests",
      "ExtentReports for API Tests", "Slack Notifications for API Test Results",
      "API Test Artifacts and Logs in CI"
    ]
  },
  "Interview Prep": {
    icon: "🎯", lang: "Interview", color: "#c084fc", accent: "rgba(192,132,252,0.15)",
    topics: [
      "Top 40 API Testing Interview Questions", "Rest Assured Interview Questions",
      "RestSharp Interview Questions", "Playwright API Interview Questions",
      "Scenario-Based API Testing Questions", "API Framework Design Questions",
      "API Security Testing Questions", "Common Mistakes in API Testing Interviews",
      "How to Explain API Testing in an Interview", "API Testing Best Practices"
    ]
  }
};

const LANG_MAP = {
  "Rest Assured": "java", "RestSharp": "csharp", "Playwright API": "typescript",
  "Postman": "javascript", "SuperTest": "javascript", "Karate DSL": "gherkin",
  "API Fundamentals": "http", "Auth & Security": "http", "Advanced Topics": "javascript",
  "Performance & Security": "bash", "CI/CD & Reports": "yaml", "Interview Prep": "text"
};

const LearnAPITesting = ({ user }) => {
  const [selectedContent, setSelectedContent] = useState('RestSharp');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq-api-key') || '');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');

  const content = CONTENT_MAP[selectedContent];
  const filteredTopics = content?.topics.filter(t =>
    t.toLowerCase().includes(topicSearch.toLowerCase())
  ) || [];

  useEffect(() => {
    setSelectedTopic('');
    setTopicSearch('');
    setExplanation('');
  }, [selectedContent]);

  useEffect(() => {
    const fetchKey = async () => {
      if (user) {
        if (isDemoUser(user)) return;
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().profile?.groqApiKey) {
            const k = snap.data().profile.groqApiKey;
            setApiKey(k);
            localStorage.setItem('groq-api-key', k);
          }
        } catch (e) { console.error(e); }
      }
    };
    fetchKey();
  }, [user]);

  const handleExplain = async () => {
    if (!selectedTopic || !apiKey) return;
    setIsLoading(true);
    setExplanation('');
    setIsBottomSheetOpen(false);
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2500,
          messages: [
            {
              role: "system",
              content: `You are an expert API testing coach. Teach using ${selectedContent} (${content.lang}). Use clean markdown with proper fenced code blocks tagged with the correct language.`
            },
            {
              role: "user",
              content: `Content Area: ${selectedContent}\nTopic: ${selectedTopic}\n\nExplain with:\n1. What is it? (2-3 sentences)\n2. Why QA engineers need it\n3. Key concepts\n4. Code Example 1 — Basic\n5. Code Example 2 — Real-world QA scenario\n6. Code Example 3 — Advanced/Interview level\n7. Common mistakes (2-3)\n8. Interview Q&A (3 pairs)\n9. Pro tips\n\nUse ${selectedContent} (${content.lang}) for all code.`
            }
          ]
        })
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      setExplanation(data.choices[0].message.content);
    } catch {
      setExplanation("### Error\nFailed to generate. Please check your GROQ API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!explanation || !selectedTopic) return;
    const saved = JSON.parse(localStorage.getItem('api_saved_topics') || '[]');
    localStorage.setItem('api_saved_topics', JSON.stringify([...saved, {
      id: Date.now(), topic: selectedTopic, framework: selectedContent,
      content: explanation, timestamp: new Date().toISOString()
    }]));
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  return (
    <div className="at-root">
      {/* ── Top Header ───────────────────────────────────────── */}
      <div className="at-topbar">
        <div className="at-topbar-left">
          <span className="at-plug-icon">🔌</span>
          <div>
            <h1 className="at-title">Learn API Testing & Automation</h1>
            <p className="at-subtitle">Select a content area → pick a topic → get AI-powered explanation with real code</p>
          </div>
        </div>
        {selectedContent && (
          <div className="at-active-badge" style={{ background: content.accent, color: content.color, borderColor: content.color }}>
            {content.icon} {selectedContent} · <span>{content.lang}</span>
          </div>
        )}
      </div>

      {!apiKey && (
        <div className="at-api-warn">
          <AlertCircle size={16} /> Configure your GROQ API key in the navbar to start learning.
        </div>
      )}

      {/* ── Content Selector (pill cards) ───────────────────── */}
      <div className="at-content-selector">
        <p className="at-selector-label">SELECT CONTENT</p>
        <div className="at-content-grid">
          {Object.entries(CONTENT_MAP).map(([key, val]) => (
            <button
              key={key}
              className={`at-content-card ${selectedContent === key ? 'active' : ''}`}
              style={selectedContent === key ? { background: val.accent, borderColor: val.color, color: val.color } : {}}
              onClick={() => setSelectedContent(key)}
            >
              <span className="at-card-icon">{val.icon}</span>
              <span className="at-card-name">{key}</span>
              <span className="at-card-lang" style={selectedContent === key ? { background: val.color, color: '#000' } : {}}>{val.lang}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────── */}
      <div className="at-layout">
        {/* Left: topic list */}
        <div className={`at-sidebar ${isBottomSheetOpen ? 'mobile-open' : ''}`}>
          <div className="at-sidebar-inner">
            <div className="at-sidebar-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="at-sidebar-title" style={{ color: content?.color }}>
                  {content?.icon} {selectedContent} Topics
                </span>
                <button className="at-mobile-close" onClick={() => setIsBottomSheetOpen(false)}><X size={18} /></button>
              </div>
              <span className="at-topic-count">{content?.topics.length} topics available</span>
              <input
                className="at-search"
                placeholder="Search topics..."
                value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)}
              />
            </div>

            <div className="at-topic-list">
              {filteredTopics.map(t => (
                <button
                  key={t}
                  className={`at-topic-item ${selectedTopic === t ? 'active' : ''}`}
                  style={selectedTopic === t ? { borderLeftColor: content?.color, background: content?.accent, color: content?.color } : {}}
                  onClick={() => setSelectedTopic(t)}
                >
                  <ChevronRight size={13} className="at-chevron" />
                  <span>{t}</span>
                </button>
              ))}
            </div>

            <button
              className="at-explain-btn"
              style={{ background: selectedTopic && apiKey ? `linear-gradient(135deg, ${content?.color}, ${content?.color}cc)` : undefined }}
              onClick={handleExplain}
              disabled={isLoading || !selectedTopic || !apiKey}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              {isLoading ? 'Generating...' : 'Explain Topic'}
            </button>
          </div>
        </div>

        {/* Right: content panel */}
        <div className="at-content-panel">
          {!explanation && !isLoading && (
            <div className="at-placeholder">
              <div className="at-ph-icon">{content?.icon || '🔌'}</div>
              <h3>Ready to learn {selectedContent}?</h3>
              <p>{selectedTopic ? `Click "Explain Topic" to learn about "${selectedTopic}"` : `Select a topic from the left panel to get started`}</p>
              <div className="at-ph-tags">
                {content?.topics.slice(0, 4).map(t => (
                  <span key={t} className="at-ph-tag" onClick={() => setSelectedTopic(t)} style={{ borderColor: content?.color, color: content?.color }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="at-loading">
              <Loader2 size={56} className="animate-spin" style={{ color: content?.color }} />
              <p>Generating <strong>{selectedContent}</strong> explanation...</p>
              <span>{selectedTopic}</span>
            </div>
          )}

          {explanation && (
            <div className="at-explanation">
              <div className="at-exp-topbar">
                <div className="at-exp-meta">
                  <span className="at-exp-badge" style={{ background: content?.accent, color: content?.color }}>{content?.icon} {selectedContent}</span>
                  <span className="at-exp-lang-badge">{content?.lang}</span>
                  <span className="at-exp-topic">{selectedTopic}</span>
                </div>
                <button className="at-save-btn" onClick={handleSave}>
                  {saveStatus ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save for Interview</>}
                </button>
              </div>

              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const lang = match ? match[1] : (LANG_MAP[selectedContent] || 'text');
                    const code = String(children).replace(/\n$/, '');
                    return !inline ? (
                      <div className="at-code-block">
                        <div className="at-code-header">
                          <span className="at-code-lang">{lang}</span>
                          <button className="at-copy-btn" onClick={() => navigator.clipboard.writeText(code)}>
                            <Copy size={13} /> Copy
                          </button>
                        </div>
                        <SyntaxHighlighter style={vscDarkPlus} language={lang} PreTag="div" {...props}
                          customStyle={{ margin: 0, padding: '1.5rem', borderRadius: '0 0 12px 12px', fontSize: '13px' }}>
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    ) : <code className="at-inline-code" {...props}>{children}</code>;
                  }
                }}
              >{explanation}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="at-fab" onClick={() => setIsBottomSheetOpen(true)}>
        <BookOpen size={18} /> Topics
      </button>

      <style>{`
        .at-root { min-height: 100vh; padding: 1.5rem 2rem; color: white; max-width: 1400px; margin: 0 auto; }

        /* Topbar */
        .at-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
        .at-topbar-left { display: flex; gap: 1rem; align-items: center; }
        .at-plug-icon { font-size: 28px; }
        .at-title { font-size: 1.6rem; font-weight: 800; margin: 0; color: #ffffff; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
        .at-subtitle { font-size: 12px; color: rgba(255,255,255,0.65); margin: 4px 0 0; }
        .at-active-badge { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid; white-space: nowrap; backdrop-filter: blur(8px); }
        .at-api-warn { background: rgba(0,0,0,0.6); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 12px 16px; border-radius: 12px; margin-bottom: 1.5rem; font-size: 13px; display: flex; align-items: center; gap: 10px; }

        /* Content Selector */
        .at-content-selector { margin-bottom: 1.5rem; }
        .at-selector-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.55); letter-spacing: 2px; margin-bottom: 10px; }
        .at-content-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .at-content-card {
          background: rgba(10, 12, 28, 0.75);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px; padding: 8px 14px; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.85);
          transition: all 0.2s;
          white-space: nowrap;
          backdrop-filter: blur(12px);
        }
        .at-content-card:hover { background: rgba(30,30,60,0.9); border-color: rgba(255,255,255,0.3); color: #ffffff; transform: translateY(-1px); }
        .at-card-icon { font-size: 16px; }
        .at-card-name { font-size: 13px; font-weight: 600; color: #f1f5f9; }
        .at-card-lang { font-size: 9px; font-weight: 800; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.6); padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px; }

        /* Layout */
        .at-layout { display: flex; gap: 1.5rem; align-items: flex-start; }

        /* Sidebar */
        .at-sidebar { width: 300px; flex-shrink: 0; position: sticky; top: 20px; }
        .at-sidebar-inner {
          background: rgba(8, 10, 25, 0.92);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px; overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .at-sidebar-header { padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .at-sidebar-title { font-size: 13px; font-weight: 800; display: block; margin-bottom: 4px; color: #f1f5f9; }
        .at-topic-count { font-size: 11px; color: rgba(255,255,255,0.45); display: block; margin-bottom: 12px; }
        .at-search {
          width: 100%; background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; padding: 8px 12px;
          color: #f1f5f9; font-size: 12px; box-sizing: border-box;
        }
        .at-search::placeholder { color: rgba(255,255,255,0.3); }
        .at-search:focus { outline: none; border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.1); }
        .at-topic-list {
          max-height: 420px; overflow-y: auto; padding: 8px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent;
        }
        .at-topic-item {
          width: 100%; background: none; border: none;
          border-left: 2px solid transparent;
          padding: 9px 12px; color: rgba(255,255,255,0.72);
          font-size: 12px; text-align: left; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          border-radius: 0 8px 8px 0; transition: all 0.15s; line-height: 1.4;
        }
        .at-topic-item:hover { background: rgba(255,255,255,0.07); color: #ffffff; }
        .at-topic-item.active { font-weight: 700; color: #ffffff; }
        .at-chevron { opacity: 0.35; flex-shrink: 0; }
        .at-topic-item.active .at-chevron { opacity: 1; }
        .at-explain-btn {
          width: 100%; margin: 0; border: none; padding: 14px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: rgba(255,255,255,0.06);
          border-top: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); transition: all 0.2s;
        }
        .at-explain-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .at-explain-btn:not(:disabled) { color: white; }
        .at-explain-btn:not(:disabled):hover { background: rgba(255,255,255,0.1); }

        /* Content Panel */
        .at-content-panel {
          flex: 1; min-width: 0;
          background: rgba(8, 10, 25, 0.88);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px; min-height: 500px; overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        /* Placeholder */
        .at-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 480px; text-align: center; padding: 3rem; }
        .at-ph-icon { font-size: 64px; margin-bottom: 1.5rem; opacity: 0.25; }
        .at-placeholder h3 { font-size: 1.25rem; margin: 0 0 0.5rem; color: #e2e8f0; }
        .at-placeholder p { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 1.5rem; }
        .at-ph-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .at-ph-tag { border: 1px solid; border-radius: 20px; padding: 6px 14px; font-size: 12px; cursor: pointer; opacity: 0.65; transition: opacity 0.2s; }
        .at-ph-tag:hover { opacity: 1; }

        /* Loading */
        .at-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 480px; gap: 1rem; }
        .at-loading p { font-size: 15px; color: #e2e8f0; }
        .at-loading span { font-size: 12px; color: rgba(255,255,255,0.45); }

        /* Explanation */
        .at-explanation { padding: 2rem; }
        .at-exp-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 10px; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .at-exp-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .at-exp-badge { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; }
        .at-exp-lang-badge { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55); padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; }
        .at-exp-topic { font-size: 12px; color: rgba(255,255,255,0.45); }
        .at-save-btn { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .at-save-btn:hover { background: #10b981; color: white; }

        /* Markdown content */
        .at-explanation h1 { color: #f1f5f9; font-size: 1.35rem; margin: 2rem 0 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.6rem; }
        .at-explanation h2 { color: #e2e8f0; font-size: 1.15rem; margin: 1.75rem 0 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 0.5rem; }
        .at-explanation h3 { color: #cbd5e1; font-size: 1rem; margin: 1.25rem 0 0.6rem; }
        .at-explanation h4 { color: #94a3b8; font-size: 0.9rem; margin: 1rem 0 0.4rem; }
        .at-explanation p { color: #cbd5e1; line-height: 1.85; font-size: 14px; margin-bottom: 1rem; }
        .at-explanation ul, .at-explanation ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .at-explanation li { color: #cbd5e1; font-size: 14px; line-height: 1.75; margin-bottom: 0.3rem; }
        .at-explanation strong { color: #f1f5f9; font-weight: 700; }
        .at-explanation em { color: #a5b4fc; font-style: italic; }
        .at-explanation blockquote { border-left: 3px solid #7c3aed; padding-left: 1rem; margin: 1rem 0; color: #94a3b8; font-style: italic; }
        .at-explanation hr { border-color: rgba(255,255,255,0.08); margin: 1.5rem 0; }

        /* Code blocks */
        .at-code-block { margin: 1.5rem 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .at-code-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .at-code-lang { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.45); letter-spacing: 1px; text-transform: uppercase; }
        .at-copy-btn { background: none; border: none; color: rgba(255,255,255,0.35); font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; }
        .at-copy-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
        .at-inline-code { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.2); padding: 2px 7px; border-radius: 5px; font-size: 12px; color: #c4b5fd; font-family: 'Fira Code', monospace; }

        /* Mobile FAB */
        .at-fab { display: none; position: fixed; bottom: 6rem; right: 1.5rem; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: none; border-radius: 50px; padding: 12px 22px; color: white; font-weight: 800; align-items: center; gap: 8px; box-shadow: 0 10px 30px rgba(124,58,237,0.4); z-index: 500; cursor: pointer; font-size: 14px; }
        .at-mobile-close { background: rgba(255,255,255,0.08); border: none; color: rgba(255,255,255,0.6); border-radius: 50%; padding: 6px; cursor: pointer; display: none; width: 30px; height: 30px; align-items: center; justify-content: center; }

        @media (max-width: 1024px) {
          .at-layout { flex-direction: column; }
          .at-sidebar { width: 100%; position: static; }
          .at-topic-list { max-height: 250px; }
        }
        @media (max-width: 768px) {
          .at-root { padding: 1rem; }
          .at-title { font-size: 1.2rem; }
          .at-fab { display: flex; }
          .at-mobile-close { display: flex; }
          .at-sidebar { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; z-index: 2000; transform: translateY(100%); transition: transform 0.4s ease; }
          .at-sidebar.mobile-open { transform: translateY(0); }
          .at-sidebar-inner { border-radius: 24px 24px 0 0; background: #080a19; border-top: 2px solid #7c3aed; }
          .at-topic-list { max-height: 55vh; }
          .at-content-panel { min-height: 300px; }
          .at-explanation { padding: 1.25rem; }
          .at-exp-topbar { flex-direction: column; align-items: flex-start; }
          .at-save-btn { width: 100%; justify-content: center; }
          .at-content-grid { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
          .at-content-card { flex-shrink: 0; }
        }
      `}</style>
    </div>
  );
};

export default LearnAPITesting;
