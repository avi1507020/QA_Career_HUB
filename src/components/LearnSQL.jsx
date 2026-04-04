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

const LearnSQL = ({ user }) => {
  const [selectedDatabase, setSelectedDatabase] = useState('MySQL');
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
    
    const savedString = localStorage.getItem('sql_saved_topics') || '[]';
    let saved = [];
    try {
      saved = JSON.parse(savedString);
    } catch (e) {
      saved = [];
    }
    
    const newSave = {
      id: Date.now(),
      topic: selectedTopic,
      database: selectedDatabase,
      content: explanation,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('sql_saved_topics', JSON.stringify([...saved, newSave]));
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
              content: "You are an expert SQL coach specializing in teaching QA engineers. Explain SQL topics with practical database testing examples. Always show syntax for the selected database type. Use clean markdown with proper SQL code blocks."
            },
            {
              role: "user",
              content: `Database: ${selectedDatabase}\nTopic: ${selectedTopic}\n\nExplain with this exact structure:\n1. What is it? (plain English, 2-3 sentences)\n2. Why QA engineers need this (real testing scenarios)\n3. Syntax / Template (the base SQL pattern)\n4. Example 1 — Basic usage with comments\n5. Example 2 — QA/testing real-world scenario\n6. Example 3 — Interview-level complex query\n7. Common mistakes QA engineers make (2-3 points)\n8. Interview Q&A (3 question-answer pairs)\n9. Pro tips for QA (2-3 bullet points)\n\nUse ${selectedDatabase} syntax throughout all examples.`
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
      setExplanation("### Error\nFailed to generate SQL explanation. Please check your connection or API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const databases = ['MySQL', 'PostgreSQL', 'MS SQL Server', 'Oracle', 'SQLite', 'MongoDB'];

  const topicGroups = [
    {
      group: 'SQL FUNDAMENTALS',
      topics: [
        'What is SQL & Why QA Engineers Need It',
        'SQL vs NoSQL — Key Differences',
        'Database Terminology (tables, rows, columns, keys)',
        'SQL Data Types',
        'Installing & Connecting to a Database'
      ]
    },
    {
      group: 'BASIC QUERIES',
      topics: [
        'SELECT Statement',
        'WHERE Clause & Filtering',
        'ORDER BY & Sorting',
        'LIMIT & OFFSET (Pagination)',
        'DISTINCT & Removing Duplicates',
        'NULL Handling (IS NULL, COALESCE)',
        'Aliases (AS keyword)'
      ]
    },
    {
      group: 'FILTERING & CONDITIONS',
      topics: [
        'AND, OR, NOT Operators',
        'IN & NOT IN',
        'BETWEEN Operator',
        'LIKE & Wildcards (%, _)',
        'CASE WHEN Statements'
      ]
    },
    {
      group: 'JOINS',
      topics: [
        'INNER JOIN',
        'LEFT JOIN & RIGHT JOIN',
        'FULL OUTER JOIN',
        'SELF JOIN',
        'CROSS JOIN',
        'Multiple Table Joins',
        'JOIN with WHERE vs ON'
      ]
    },
    {
      group: 'AGGREGATIONS & GROUPING',
      topics: [
        'COUNT, SUM, AVG, MIN, MAX',
        'GROUP BY',
        'HAVING Clause',
        'GROUP BY vs HAVING vs WHERE'
      ]
    },
    {
      group: 'SUBQUERIES & CTEs',
      topics: [
        'Subqueries (Nested SELECT)',
        'Correlated Subqueries',
        'EXISTS & NOT EXISTS',
        'Common Table Expressions (WITH clause)',
        'Recursive CTEs'
      ]
    },
    {
      group: 'DATA MODIFICATION',
      topics: [
        'INSERT INTO',
        'UPDATE Statement',
        'DELETE Statement',
        'TRUNCATE vs DELETE vs DROP',
        'UPSERT (INSERT ON CONFLICT)',
        'Transactions (BEGIN, COMMIT, ROLLBACK)'
      ]
    },
    {
      group: 'DATABASE DESIGN',
      topics: [
        'Primary Keys & Foreign Keys',
        'Indexes & Performance',
        'Normalization (1NF, 2NF, 3NF)',
        'Constraints (UNIQUE, NOT NULL, CHECK)',
        'Views & Virtual Tables',
        'Stored Procedures',
        'Triggers'
      ]
    },
    {
      group: 'QA-SPECIFIC SQL',
      topics: [
        'Writing Test Data Queries',
        'Validating Data After Test Execution',
        'Checking Record Counts & Assertions',
        'Finding Duplicate Records',
        'Comparing Two Tables (Data Diff)',
        'Verifying Foreign Key Integrity',
        'Checking NULL/Empty Values in Test Data',
        'Database Cleanup After Tests',
        'Test Data Setup & Teardown Queries',
        'Seed Data Scripts for Testing',
        'Verifying API Response vs Database'
      ]
    },
    {
      group: 'ADVANCED SQL',
      topics: [
        'Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
        'PARTITION BY',
        'LAG & LEAD Functions',
        'String Functions (CONCAT, SUBSTRING, TRIM, REPLACE)',
        'Date & Time Functions',
        'JSON in SQL (PostgreSQL/MySQL)',
        'Query Optimization & EXPLAIN',
        'Execution Plans'
      ]
    },
    {
      group: 'INTERVIEW PREP',
      topics: [
        'Top 30 SQL Interview Questions for QA',
        'Common SQL Mistakes in QA Interviews',
        'SQL Scenario-Based Questions',
        'Write a Query on the Spot (Practice Set)',
        'SQL Best Practices for QA Engineers'
      ]
    }
  ];

  return (
    <div className="section-container sql-page-container" style={{ padding: '1.5rem 2.5rem', background: 'rgba(15, 23, 42, 0.2)', overflow: 'visible' }}>
      
      {/* Page Header */}
      <div className="section-header-glass">
        <div className="header-title-group">
          <span style={{ fontSize: '24px' }}>🗄️</span>
          <h2 className="header-title">Learn SQL for QA</h2>
        </div>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem 1rem', borderRadius: '20px', color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ExternalLink size={14} /> {selectedDatabase}
        </div>
      </div>

      {!isApiKeyReady && !isDemoUser(user) && (
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.2rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertCircle size={18} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          Configure your GROQ API key in the navbar to start learning SQL.
        </div>
      )}

      <div className="sql-layout">
        {/* Left Control Panel */}
        <div className={`control-panel-container ${isBottomSheetOpen ? 'mobile-open' : ''}`}>
          <div className="glass-card control-panel">
            <div className="mobile-handle-container">
              <div className="mobile-drag-indicator"></div>
              <button onClick={() => setIsBottomSheetOpen(false)} className="mobile-close-btn"><X /></button>
            </div>

            <div className="panel-section">
              <label>SELECT DATABASE</label>
              <select 
                style={{ fontSize: '16px' }}
                value={selectedDatabase} 
                onChange={(e) => setSelectedDatabase(e.target.value)}
              >
                {databases.map(db => (
                  <option key={db} value={db}>{db}</option>
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
                  <optgroup key={g.group} label={g.group} style={{ background: '#1e293b', color: '#60a5fa', fontWeight: 'bold' }}>
                    {g.topics.map(t => <option key={t} value={t} style={{ background: '#0f172a', color: 'white' }}>{t}</option>)}
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
              Get detailed SQL explanation with examples
            </p>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="content-panel-container">
          <div className="glass-card content-panel">
            {!explanation && !isLoading && (
              <div className="centered-placeholder">
                <BookOpen size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                <p>Select a database and topic to start learning SQL</p>
              </div>
            )}
            {isLoading && (
              <div className="loading-state">
                <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                <p>Generating SQL explanation...</p>
              </div>
            )}
            {explanation && (
              <div className="explanation-display">
                <button className="save-interview-btn" onClick={handleSaveForInterview} style={{ minHeight: '44px' }}>
                  {saveStatus ? <CheckCircle size={14} /> : <Save size={14} />} {saveStatus ? 'Saved' : 'Save for Interview'}
                </button>
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      const lang = match ? match[1] : '';
                      const codeContent = String(children).replace(/\n$/, '');
                      
                      return !inline && (lang === 'sql' || lang === 'sqlite' || lang === 'mysql' || lang === 'postgresql') ? (
                        <div className="code-block-wrapper">
                          <div className="code-header">
                            <span className="db-badge">{selectedDatabase}</span>
                            <button 
                              onClick={() => handleCopy(codeContent, `sql-${Math.random()}`)}
                              className="copy-btn"
                            >
                              <Copy size={14} /> Copy
                            </button>
                          </div>
                          <SyntaxHighlighter 
                            style={vscDarkPlus} 
                            language="sql" 
                            PreTag="div" 
                            {...props}
                            customStyle={{ margin: 0, padding: '1.5rem' }}
                          >
                            {codeContent}
                          </SyntaxHighlighter>
                          <a 
                            href={selectedDatabase.includes('MongoDB') ? 'https://mongoplayground.net/' : 'https://www.db-fiddle.com'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="run-query-btn"
                          >
                             ▶ Run Query
                          </a>
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
        .sql-page-container {
          min-height: 100%;
          overflow-y: visible !important;
        }

        .sql-layout { display: flex; gap: 24px; margin-top: 1.5rem; align-items: flex-start; }
        
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

        /* If a duplicate select is rendering below the first */
        .panel-section select:nth-of-type(2) {
          display: none;
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

        .explain-btn { width: 100%; padding: 1.2rem; background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; color: white; border-radius: 14px; cursor: pointer; font-weight: 800; display: flex; align-items: center; gap: 10px; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }
        .explain-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.4); filter: brightness(1.1); }
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
          color: #60a5fa;
          background: rgba(59, 130, 246, 0.15);
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

        .run-query-btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 12px;
          background: rgba(59, 130, 246, 0.08);
          color: #60a5fa;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 700;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.3s ease;
        }
        .run-query-btn:hover { background: rgba(59, 130, 246, 0.15); color: white; }

        .save-interview-btn { 
          position: absolute; 
          top: 2rem; 
          right: 2rem; 
          background: rgba(16, 185, 129, 0.1); 
          border: 1px solid rgba(16, 185, 129, 0.2); 
          color: #34d399; 
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
        .save-interview-btn:hover { background: #10b981; color: white; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }
        
        .mobile-fab { display: none; position: fixed; bottom: 2.5rem; right: 2rem; background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; border-radius: 50px; padding: 14px 28px; color: white; font-weight: 800; align-items: center; gap: 10px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4); z-index: 500; cursor: pointer; min-height: 50px; }
        .mobile-handle-container { display: none; }
        
        @media (max-width: 1024px) {
          .sql-layout { flex-direction: column; gap: 32px; }
          .control-panel-container { width: 100%; position: static; }
          .control-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: end; }
          .explain-btn { grid-column: span 2; }
          .panel-section { margin-bottom: 0; }
          .control-help-text { grid-column: span 2; }
        }
        
        @media (max-width: 768px) {
          .sql-page-container { 
            padding: 1rem !important; 
            overflow-x: hidden;
            box-sizing: border-box;
            max-width: 100%;
          }
          .sql-layout { gap: 16px; margin-top: 1rem; }
          .mobile-fab { 
            display: flex; 
            bottom: 6rem; /* Sit above footer */
            right: 1.5rem;
            padding: 12px 24px;
            font-size: 14px;
          }
          .control-panel-container { position: fixed; bottom: 0; left: 0; right: 0; z-index: 2000; transform: translateY(100%); transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
          .control-panel-container.mobile-open { transform: translateY(0); }
          .control-panel { border-radius: 32px 32px 0 0; display: block; border-top: 2px solid #3b82f6; background: #0f172a; padding: 2rem 1.5rem 4rem; box-shadow: 0 -20px 40px rgba(0,0,0,0.5); }
          .mobile-handle-container { display: flex; justify-content: center; position: relative; margin-bottom: 2rem; }
          .mobile-drag-indicator { width: 50px; height: 5px; background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
          .mobile-close-btn { position: absolute; right: 0; top: -8px; background: rgba(255,255,255,0.05); border-radius: 50%; color: white; cursor: pointer; padding: 5px; }
          .save-interview-btn { position: static; width: 100%; margin-bottom: 2rem; justify-content: center; }
          
          .content-panel { 
            padding: 1.5rem 1rem; /* 16px horizontal padding */
            border-radius: 20px; 
            box-sizing: border-box;
            max-width: 100%;
            overflow-x: hidden;
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
            overflow-x: auto; /* Internal scroll only */
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

export default LearnSQL;
