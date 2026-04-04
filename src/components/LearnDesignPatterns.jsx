import React, { useState, useEffect } from 'react';
import { 
  Menu, Play, BookOpen, Clock, Award, 
  ChevronRight, Save, Copy, CheckCircle, 
  Loader2, Zap, AlertCircle, X, ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { isDemoUser, getGroqApiKey } from '../utils/isDemoUser';

const LearnDesignPatterns = ({ user }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('TypeScript');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq-api-key') || '');
  const [copyStatus, setCopyStatus] = useState({});
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    const resolvedKey = getGroqApiKey(user);
    if (resolvedKey) setApiKey(resolvedKey);
    setIsApiKeyReady(Boolean(resolvedKey.trim()));
  }, [user]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [id]: true });
    setTimeout(() => setCopyStatus({ ...copyStatus, [id]: false }), 2000);
  };

  const handleSaveForInterview = () => {
    if (!explanation || !selectedTopic) return;
    
    const savedString = localStorage.getItem('design_saved_topics') || '[]';
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
    
    localStorage.setItem('design_saved_topics', JSON.stringify([...saved, newSave]));
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
          max_tokens: 2500,
          messages: [
            {
              role: "system",
              content: "You are an expert software architect and design patterns coach specializing in teaching QA engineers and developers. You explain SOLID principles, GoF design patterns, architecture patterns, and clean code with real practical examples in the selected language. Always relate patterns to real QA and test automation scenarios where relevant. Use clean markdown with proper code blocks."
            },
            {
              role: "user",
              content: `Language: ${selectedLanguage}\nTopic: ${selectedTopic}\n\nExplain with this EXACT structure (strict markdown):\n1. What is it? (plain English, 2-3 sentences)\n2. The Problem (what happens before or without this pattern)\n3. The Solution (how this pattern solves it)\n4. Key Components (participants involved)\n5. Code Example 1 — Basic implementation\n6. Code Example 2 — Real-world scenario (relate to QA/test automation where possible)\n7. Code Example 3 — Advanced / Interview level\n8. Structure Diagram (text-based ASCII format)\n\n#### When to Use\n- Use when: scenario 1\n- Use when: scenario 2\n\n#### When NOT to Use\n- Avoid when: scenario 1\n- Avoid when: scenario 2\n\n#### In Test Automation\n[How this pattern applies to test framework design]\n\n#### Common Mistakes\n- ❌ Mistake 1 (Anti-pattern)\n- ❌ Mistake 2 (Over-engineering)\n\n#### Interview Q&A\nQ: [question]\nA: [concise answer]\n\nQ: [question]\nA: [concise answer]\n\nQ: [question]\nA: [concise answer]\n\n#### Pro Tips\n- 💡 Tip 1\n- 💡 Tip 2\n\n## Rules\n- Always use the selected language for code examples\n- Include all necessary imports and class definitions\n- Code must be complete and runnable\n- Always include the ASCII structure diagram\n- Always include at least one QA/test automation related example\n- For SOLID topics: show before (violation) and after (fixed) code examples\n- For Interview Prep topics: 70% Q&A format\n- Never show patterns in isolation — always show the problem they solve first\n- Relate every pattern to real QA engineering work.`
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

  const languages = ['TypeScript', 'JavaScript', 'Java', 'C#', 'Python', 'Kotlin', 'Go'];

  const topicGroups = [
    {
      group: 'SOLID PRINCIPLES',
      topics: [
        'What are SOLID Principles?',
        'S — Single Responsibility Principle (SRP)',
        'O — Open/Closed Principle (OCP)',
        'L — Liskov Substitution Principle (LSP)',
        'I — Interface Segregation Principle (ISP)',
        'D — Dependency Inversion Principle (DIP)',
        'SOLID in Test Automation Frameworks',
        'SOLID Violations — How to Spot & Fix Them',
        'SOLID Principles Interview Questions'
      ]
    },
    {
      group: 'OTHER DESIGN PRINCIPLES',
      topics: [
        'DRY — Don\'t Repeat Yourself',
        'KISS — Keep It Simple Stupid',
        'YAGNI — You Aren\'t Gonna Need It',
        'GRASP Principles',
        'Law of Demeter',
        'Composition Over Inheritance',
        'Favour Interfaces Over Concrete Classes',
        'Separation of Concerns',
        'Principle of Least Astonishment',
        'Convention Over Configuration'
      ]
    },
    {
      group: 'CREATIONAL DESIGN PATTERNS',
      topics: [
        'What are Creational Patterns?',
        'Singleton Pattern',
        'Factory Method Pattern',
        'Abstract Factory Pattern',
        'Builder Pattern',
        'Prototype Pattern',
        'Object Pool Pattern',
        'Dependency Injection Pattern',
        'Service Locator Pattern',
        'Creational Patterns in Test Automation'
      ]
    },
    {
      group: 'STRUCTURAL DESIGN PATTERNS',
      topics: [
        'What are Structural Patterns?',
        'Adapter Pattern',
        'Bridge Pattern',
        'Composite Pattern',
        'Decorator Pattern',
        'Facade Pattern',
        'Flyweight Pattern',
        'Proxy Pattern',
        'Module Pattern',
        'Structural Patterns in Test Automation'
      ]
    },
    {
      group: 'BEHAVIORAL DESIGN PATTERNS',
      topics: [
        'What are Behavioral Patterns?',
        'Chain of Responsibility Pattern',
        'Command Pattern',
        'Iterator Pattern',
        'Mediator Pattern',
        'Memento Pattern',
        'Observer Pattern',
        'State Pattern',
        'Strategy Pattern',
        'Template Method Pattern',
        'Visitor Pattern',
        'Null Object Pattern',
        'BehaviorAL Design Pattern in Test Automation'
      ]
    },
    {
      group: 'TEST AUTOMATION DESIGN PATTERNS',
      topics: [
        'Page Object Model (POM)',
        'Page Factory Pattern',
        'Screenplay Pattern',
        'Fluent Interface Pattern',
        'Builder Pattern for Test Data',
        'Factory Pattern for Test Objects',
        'Repository Pattern for Test Data',
        'Chain of Responsibility for Test Steps',
        'Decorator Pattern for Test Logging',
        'Strategy Pattern for Cross-browser Testing',
        'Observer Pattern for Test Reporting',
        'Singleton for WebDriver / Browser Instance',
        'Data Transfer Object (DTO) in API Testing',
        'AAA Pattern (Arrange Act Assert)',
        'GWT Pattern (Given When Then)'
      ]
    },
    {
      group: 'ARCHITECTURE PATTERNS',
      topics: [
        'What is Software Architecture?',
        'Monolithic Architecture',
        'Microservices Architecture',
        'Layered (N-Tier) Architecture',
        'Hexagonal Architecture (Ports & Adapters)',
        'Clean Architecture',
        'Onion Architecture',
        'Event-Driven Architecture',
        'CQRS (Command Query Responsibility Segregation)',
        'Event Sourcing',
        'Domain-Driven Design (DDD) Basics',
        'Service-Oriented Architecture (SOA)',
        'Serverless Architecture',
        'MVC Pattern',
        'MVP Pattern',
        'MVVM Pattern',
        'BFF (Backend for Frontend) Pattern'
      ]
    },
    {
      group: 'TEST FRAMEWORK ARCHITECTURE',
      topics: [
        'Designing a Test Automation Framework',
        'Framework Layers & Responsibilities',
        'Configuration Management Pattern',
        'Test Data Management Architecture',
        'Reporting Architecture',
        'Parallel Execution Architecture',
        'CI/CD Pipeline Architecture for Testing',
        'Hybrid Framework Architecture',
        'Data-Driven Framework Architecture',
        'Keyword-Driven Framework Architecture',
        'BDD Framework Architecture',
        'Modular Framework Architecture',
        'API + UI Hybrid Framework Design',
        'Test Framework Scalability Patterns'
      ]
    },
    {
      group: 'CLEAN CODE PRINCIPLES',
      topics: [
        'What is Clean Code?',
        'Meaningful Names & Naming Conventions',
        'Functions — Small & Single Purpose',
        'Comments — When & When Not to Use',
        'Code Formatting & Structure',
        'Error Handling Best Practices',
        'Avoiding Code Smells',
        'Refactoring Techniques',
        'Code Reviews Best Practices',
        'Technical Debt — What & How to Manage',
        'Clean Code in Test Automation'
      ]
    },
    {
      group: 'OBJECT ORIENTED DESIGN',
      topics: [
        'OOP Fundamentals Recap',
        'Abstraction in Depth',
        'Encapsulation in Depth',
        'Inheritance vs Composition',
        'Polymorphism in Depth',
        'Interfaces vs Abstract Classes',
        'Coupling & Cohesion',
        'Designing Loosely Coupled Systems',
        'UML Basics for Developers & QA',
        'Class Diagram Reading & Writing'
      ]
    },
    {
      group: 'FUNCTIONAL PROGRAMMING CONCEPTS',
      topics: [
        'What is Functional Programming?',
        'Pure Functions',
        'Immutability',
        'Higher-Order Functions',
        'Function Composition',
        'Currying & Partial Application',
        'Monads Simplified',
        'FP vs OOP — When to Use Which',
        'Functional Patterns in Test Automation'
      ]
    },
    {
      group: 'CONCURRENCY PATTERNS',
      topics: [
        'Thread Safety Basics',
        'Mutex & Lock Patterns',
        'Producer-Consumer Pattern',
        'Active Object Pattern',
        'Parallel vs Concurrent Testing',
        'Thread-Safe Singleton in Test Automation',
        'Async/Await Patterns',
        'Race Condition Detection in Tests'
      ]
    },
    {
      group: 'CLOUD & DISTRIBUTED PATTERNS',
      topics: [
        'Circuit Breaker Pattern',
        'Retry Pattern',
        'Bulkhead Pattern',
        'Throttling Pattern',
        'Sidecar Pattern',
        'Ambassador Pattern',
        'Strangler Fig Pattern',
        'Saga Pattern',
        'Outbox Pattern',
        'API Gateway Pattern',
        'Testing Distributed Systems'
      ]
    },
    {
      group: 'INTERVIEW PREP',
      topics: [
        'Top 40 Design Pattern Interview Questions',
        'SOLID Principles Interview Deep Dive',
        'Architecture Pattern Interview Questions',
        'Test Automation Framework Design Questions',
        'Clean Code Interview Questions',
        'OOP Interview Questions for QA',
        'Scenario-Based Design Questions',
        'How to Explain Your Framework Architecture',
        'Common Design Mistakes in Test Automation',
        'Design Patterns Best Practices for QA'
      ]
    }
  ];

  return (
    <div className="section-container design-page-container" style={{ padding: '1.5rem 2.5rem', background: 'rgba(15, 23, 42, 0.2)', overflow: 'visible' }}>
      
      {/* Page Header */}
      <div className="section-header-glass">
        <div className="header-title-group">
          <span style={{ fontSize: '24px' }}>🏗️</span>
          <h2 className="header-title">Learn Design Patterns & Architecture</h2>
        </div>
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.4rem 1rem', borderRadius: '20px', color: '#a78bfa', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ExternalLink size={14} /> {selectedLanguage}
        </div>
      </div>

      {!isApiKeyReady && !isDemoUser(user) && (
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.2rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertCircle size={18} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          Configure your GROQ API key in the navbar to start learning Design Patterns.
        </div>
      )}

      <div className="design-layout">
        {/* Left Control Panel */}
        <div className={`control-panel-container ${isBottomSheetOpen ? 'mobile-open' : ''}`}>
          <div className="glass-card control-panel">
            <div className="mobile-handle-container">
              <div className="mobile-drag-indicator"></div>
              <button onClick={() => setIsBottomSheetOpen(false)} className="mobile-close-btn"><X /></button>
            </div>

            <div className="panel-section">
              <label>SELECT LANGUAGE</label>
              <select 
                style={{ fontSize: '16px' }}
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="panel-section">
              <label>SELECT TOPIC</label>
              <select 
                style={{ fontSize: '16px' }}
                className="topic-select"
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">Select Topic...</option>
                {topicGroups.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <button 
              className="primary-button primary-button-blue explain-btn" 
              onClick={handleExplain} 
              disabled={isLoading || !selectedTopic || !isApiKeyReady}
              style={{ minHeight: '44px' }}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Explain Topic ▶'}
            </button>
            <p className="control-help-text" style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>
              Get detailed explanation with real code examples
            </p>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="content-panel-container">
          <div className="glass-card content-panel">
            {!explanation && !isLoading && (
              <div className="centered-placeholder">
                <BookOpen size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                <p>Select a language and topic to start learning Design Patterns & Architecture</p>
              </div>
            )}
            {isLoading && (
              <div className="loading-state">
                <Loader2 size={48} className="animate-spin" style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
                <p>Generating explanation...</p>
              </div>
            )}
            {explanation && (
              <div className="explanation-display">
                <button className="save-interview-btn" onClick={handleSaveForInterview} style={{ minHeight: '44px' }}>
                  {saveStatus ? <CheckCircle size={14} /> : <Award size={14} />} {saveStatus ? 'Saved' : '🔖 Save for Interview'}
                </button>
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      const lang = match ? match[1] : selectedLanguage.toLowerCase();
                      const codeContent = String(children).replace(/\n$/, '');
                      
                      return !inline ? (
                        <div className="code-block-wrapper">
                          <div className="code-header">
                            <span className="db-badge">{selectedLanguage}</span>
                            <button 
                              onClick={() => handleCopy(codeContent, `design-${Math.random()}`)}
                              className="copy-btn"
                            >
                              <Copy size={14} /> Copy
                            </button>
                          </div>
                          <SyntaxHighlighter 
                            style={vscDarkPlus} 
                            language={lang} 
                            PreTag="div" 
                            {...props}
                            customStyle={{ margin: 0, padding: '1.5rem' }}
                          >
                            {codeContent}
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
        .design-page-container {
          min-height: 100%;
          overflow-y: visible !important;
        }

        .design-layout { display: flex; gap: 24px; margin-top: 1.5rem; align-items: flex-start; }
        
        .control-panel-container { 
          width: 320px; 
          position: sticky; 
          top: 20px; 
          z-index: 100;
        }

        .control-panel { 
          padding: 2.5rem 2rem; 
          background: rgba(30, 41, 59, 0.5); 
          border-radius: 28px; 
          border: 1px solid rgba(59, 130, 246, 0.2); 
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .panel-section { 
          margin-bottom: 2rem; 
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
        }

        .panel-section label { display: block; color: #94a3b8; font-size: 0.75rem; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 12px; }
        
        .control-panel select { 
          width: 100%; 
          max-width: 100%;
          max-height: 44px;
          height: 44px;
          overflow: hidden;
          font-size: 13px;
          padding: 0 35px 0 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background-color: rgba(30, 41, 59, 1);
          color: white; 
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          outline: none;
          box-sizing: border-box;
          transition: all 0.3s ease;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 14px;
          text-overflow: ellipsis;
        }

        .control-panel select:hover {
          border-color: rgba(255,255,255,0.25);
          background-color: rgba(255,255,255,0.12);
        }

        .control-panel select:focus {
          max-height: 280px;
          overflow-y: auto;
          border-color: #7c63f5;
        }

        .control-panel select option {
          background-color: #1e293b;
          color: white;
          padding: 12px;
        }

        .topic-select optgroup {
          font-size: 10px;
          font-weight: 700;
          color: #7c63f5;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #1a1535;
        }

        .topic-select option {
          font-size: 13px;
          padding: 8px 14px;
          background: #1a1535;
          color: rgba(255,255,255,0.8);
        }

        .topic-select option:hover,
        .topic-select option:checked {
          background: rgba(124, 58, 237, 0.35);
          color: white;
        }

        .explain-btn { width: 100%; padding: 1.2rem; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; color: white; border-radius: 14px; cursor: pointer; font-weight: 800; display: flex; align-items: center; gap: 10px; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 20px rgba(124, 58, 237, 0.2); }
        .explain-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(124, 58, 237, 0.4); filter: brightness(1.1); }
        .explain-btn:active:not(:disabled) { transform: translateY(-1px); }
        
        .content-panel-container { flex: 1; min-width: 0; }
        
        .content-panel { 
          min-height: 650px; 
          padding: 3rem; 
          background: rgba(30, 41, 59, 0.15); 
          border-radius: 32px; 
          border: 1px solid rgba(255, 255, 255, 0.05); 
          position: relative; 
          height: auto;
          backdrop-filter: blur(5px);
        }

        .centered-placeholder, .loading-state { height: 450px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #64748b; text-align: center; }
        .explanation-display { color: #e2e8f0; line-height: 1.7; }
        .explanation-display h1, .explanation-display h2, .explanation-display h3 { color: white; margin: 2rem 0 1rem; font-weight: 700; }
        .explanation-display p { margin-bottom: 1.2rem; font-size: 1.05rem; }
        .explanation-display ul, .explanation-display ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .explanation-display li { margin-bottom: 0.7rem; }

        .code-block-wrapper { 
          margin: 2rem 0; 
          border-radius: 16px; 
          overflow: hidden; 
          border: 1px solid rgba(255, 255, 255, 0.08); 
          background: #0f172a;
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .db-badge {
          font-size: 0.65rem;
          font-weight: 900;
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.15);
          padding: 3px 10px;
          border-radius: 6px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .copy-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s;
        }
        .copy-btn:hover { color: white; }

        .save-interview-btn { 
          position: absolute; 
          top: 2rem; 
          right: 2rem; 
          background: rgba(139, 92, 246, 0.1); 
          border: 1px solid rgba(139, 92, 246, 0.2); 
          color: #a78bfa; 
          padding: 0.7rem 1.4rem; 
          border-radius: 12px; 
          font-size: 0.85rem; 
          font-weight: 700; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          transition: all 0.3s ease; 
          z-index: 10;
        }
        .save-interview-btn:hover { background: #8b5cf6; color: white; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3); }
        
        .mobile-fab { display: none; position: fixed; bottom: 6rem; right: 2rem; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; border-radius: 50px; padding: 14px 28px; color: white; font-weight: 800; align-items: center; gap: 10px; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.4); z-index: 500; cursor: pointer; min-height: 50px; }
        .mobile-handle-container { display: none; }
        
        @media (max-width: 1024px) {
          .design-layout { flex-direction: column; gap: 32px; }
          .control-panel-container { width: 100%; position: static; }
          .control-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: end; }
          .explain-btn { grid-column: span 2; }
          .panel-section { margin-bottom: 0; }
          .control-help-text { grid-column: span 2; }
        }
        
        @media (max-width: 768px) {
          .design-page-container { 
            padding: 1rem !important; 
            overflow-x: hidden;
            box-sizing: border-box;
            max-width: 100%;
          }
          .design-layout { gap: 16px; margin-top: 1rem; }
          .mobile-fab { 
            display: flex; 
            bottom: 6rem; 
            right: 1.5rem;
            padding: 12px 24px;
            font-size: 14px;
          }
          .control-panel-container { position: fixed; bottom: 0; left: 0; right: 0; z-index: 2000; transform: translateY(100%); transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
          .control-panel-container.mobile-open { transform: translateY(0); }
          .control-panel { border-radius: 32px 32px 0 0; display: block; border-top: 2px solid #8b5cf6; background: #0f172a; padding: 2rem 1.5rem 4rem; box-shadow: 0 -20px 40px rgba(0,0,0,0.5); }
          .mobile-handle-container { display: flex; justify-content: center; position: relative; margin-bottom: 2rem; }
          .mobile-drag-indicator { width: 50px; height: 5px; background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
          .mobile-close-btn { position: absolute; right: 0; top: -8px; background: rgba(255,255,255,0.05); border-radius: 50%; color: white; cursor: pointer; padding: 5px; }
          .save-interview-btn { position: static; width: 100%; margin-bottom: 2rem; justify-content: center; }
          
          .content-panel { 
            padding: 1.5rem 1rem; 
            border-radius: 20px; 
            box-sizing: border-box;
            max-width: 100%;
            overflow-x: hidden;
            min-height: 400px;
          }

          .explanation-display {
            font-size: 14px;
            line-height: 1.7;
            word-break: break-word;
            overflow-wrap: break-word;
          }

          .explanation-display h1 { font-size: clamp(20px, 6vw, 28px); margin: 1.5rem 0 1rem; }
          .explanation-display h2 { font-size: clamp(18px, 5vw, 24px); margin: 1.5rem 0 0.8rem; }
          .explanation-display h3 { font-size: clamp(16px, 4vw, 20px); margin: 1.2rem 0 0.6rem; }
          .explanation-display p { margin-bottom: 1rem; }

          .code-block-wrapper { 
            margin: 1.2rem 0; 
            max-width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            contain: inline-size;
          }
          
          .code-block-wrapper pre {
            white-space: pre !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
          }

          .control-panel select {
            font-size: 16px;
            height: 48px;
            max-height: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default LearnDesignPatterns;
