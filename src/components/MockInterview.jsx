import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroqApiKey } from '../utils/isDemoUser';
import { 
  BarChart2, 
  X, 
  ChevronDown, 
  Search, 
  Mic, 
  Square, 
  Play, 
  SkipForward, 
  Pause, 
  LogOut, 
  Loader,
  ArrowRight,
  CheckCircle,
  Home
} from 'lucide-react';

const TOPICS = [
  {
    group: 'MANUAL TESTING',
    topics: [
      'Functional Testing', 'Regression Testing', 'Smoke Testing', 'Sanity Testing', 
      'Exploratory Testing', 'Boundary Value Analysis', 'Equivalence Partitioning', 
      'Decision Table Testing', 'Test Case Design', 'Bug Life Cycle', 
      'Test Plan and Strategy', 'STLC (Software Testing Life Cycle)', 'Defect Severity and Priority'
    ]
  },
  {
    group: 'AUTOMATION TESTING',
    topics: [
      'Automation Testing Fundamentals', 'Selenium WebDriver', 'Playwright', 'Cypress', 
      'Appium (Mobile Testing)', 'TestNG and JUnit', 'NUnit and xUnit (C#)', 
      'PyTest (Python)', 'Page Object Model (POM)', 'Data-Driven Testing', 
      'Keyword-Driven Testing', 'Hybrid Framework Design', 'CI/CD for Test Automation'
    ]
  },
  {
    group: 'PROGRAMMING LANGUAGES',
    topics: ['Java for QA', 'C# for QA', 'Python for QA', 'JavaScript for QA', 'TypeScript for QA']
  },
  {
    group: 'API TESTING',
    topics: [
      'REST API Testing Fundamentals', 'Rest Assured', 'RestSharp', 'Playwright API Testing', 
      'Postman and Newman', 'API Authentication Testing', 'Contract Testing'
    ]
  },
  {
    group: 'PERFORMANCE TESTING',
    topics: ['Performance Testing Concepts', 'K6 Load Testing', 'JMeter', 'Performance Metrics Analysis']
  },
  {
    group: 'DATABASE TESTING',
    topics: ['SQL for QA Engineers', 'Database Testing Fundamentals', 'Test Data Management']
  },
  {
    group: 'AGILE AND PROCESS',
    topics: ['Agile Testing Methodology', 'Scrum for QA Engineers', 'BDD and Gherkin', 'Test Management (JIRA Zephyr)']
  },
  {
    group: 'DESIGN AND ARCHITECTURE',
    topics: ['SOLID Principles', 'Design Patterns for QA', 'Clean Code Practices']
  },
  {
    group: 'BEHAVIOURAL',
    topics: [
      'Tell Me About Yourself', 'Situational and Behavioural Questions', 
      'Conflict Resolution in QA Teams', 'Career Goals and Growth'
    ]
  }
];

const MockInterview = ({ user }) => {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState('SETUP'); // SETUP, ACTIVE, RESULTS, HISTORY

  // SETUP STATE
  const [level, setLevel] = useState('Fresher');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [answerMode, setAnswerMode] = useState('Type');
  const [timeLimit, setTimeLimit] = useState(3); // minutes

  // ACTIVE INTERVIEW STATE
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Feedback inline
  const [showInlineFeedback, setShowInlineFeedback] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Recognition ref
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if mapped
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer((prev) => prev !== transcript ? transcript : prev);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (pageState !== 'ACTIVE' || showInlineFeedback) return;
    if (timeLimit === 0) return; // No timer
    if (isPaused) return;

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [pageState, isPaused, timeLeft, timeLimit, showInlineFeedback]);

  const handleTimeUp = () => {
    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    submitAnswer();
  };

  const getTimerColors = () => {
    const maxSecs = timeLimit * 60;
    const ratio = timeLeft / maxSecs;
    if (ratio > 0.5) return '#4ade80';
    if (ratio > 0.25) return '#fbbf24';
    return '#f87171'; // red
  };

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    setPageState('ACTIVE');
    
    try {
      // In a real app we'd call GROQ API. Here we mock for now until the user implements specific prompts
      const groqApiKey = getGroqApiKey(user);
      if (!groqApiKey) {
        throw new Error("GROQ API Key is missing. Please set it in options.");
      }

      const prompt = `You are an expert QA technical interviewer. Generate ${numQuestions} questions for a ${level} candidate focusing on these topics: ${selectedTopics.join(', ')}. Return ONLY a JSON array of strings containing the questions and nothing else. No markdown formatting.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'user', content: prompt + ' Return ONLY valid JSON array like ["Question 1?", "Question 2?"]. Do not wrap in markdown or anything else.' }],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));
      
      const mapped = parsed.map((q) => ({
        text: q,
        topic: selectedTopics[Math.floor(Math.random() * selectedTopics.length)],
        difficulty: level === 'Fresher' ? 'Easy' : (level === 'Mid-level' ? 'Medium' : 'Hard')
      })).slice(0, numQuestions);

      setQuestions(mapped);
      setCurrentIdx(0);
      setTimeLeft(timeLimit * 60);
    } catch (err) {
      console.error(err);
      // Fallback dummy questions
      const dummy = Array(numQuestions).fill(0).map((_, i) => ({
        text: `Tell me about your experience with ${selectedTopics[0] || 'QA'}. (Question ${i+1})?`,
        topic: selectedTopics[0] || 'General',
        difficulty: 'Medium'
      }));
      setQuestions(dummy);
      setCurrentIdx(0);
      setTimeLeft(timeLimit * 60);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const evaluateAnswer = async (answer) => {
    setEvaluating(true);
    
    // In a real implementation, you'd send `questions[currentIdx].text` and `answer` to GROQ to get proper feedback and a score.
    // Simulating API call...
    setTimeout(() => {
      const isGood = answer.length > 50;
      setInlineFeedback({
        score: answer.toLowerCase() === 'skipped' ? 0 : (isGood ? Math.floor(Math.random() * 3) + 7 : Math.floor(Math.random() * 3) + 4),
        positive: answer.toLowerCase() === 'skipped' ? "No answer provided." : "✓ Explores the basic concept correctly.",
        improve: answer.toLowerCase() === 'skipped' ? "Try to provide an answer to get a score." : "⚡ Could add more technical depth and examples."
      });
      setEvaluating(false);
      setShowInlineFeedback(true);
    }, 1500);
  };

  const submitAnswer = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    evaluateAnswer(currentAnswer);
  };

  const handleNextQuestion = () => {
    const q = questions[currentIdx];
    setSessionAnswers((prev) => [...prev, {
      question: q.text,
      topic: q.topic,
      answer: currentAnswer,
      score: inlineFeedback.score,
      feedback: inlineFeedback
    }]);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setCurrentAnswer('');
      setShowInlineFeedback(false);
      setInlineFeedback(null);
      setTimeLeft(timeLimit * 60);
    } else {
      setPageState('RESULTS');
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support the Web Speech API. Please use Chrome.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setCurrentAnswer('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredTopics = TOPICS.map(g => ({
    ...g,
    topics: g.topics.filter(t => t.toLowerCase().includes(topicSearch.toLowerCase()))
  })).filter(g => g.topics.length > 0);

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(prev => prev.filter(t => t !== topic));
    } else {
      if (selectedTopics.length < 5) {
        setSelectedTopics(prev => [...prev, topic]);
      }
    }
  };

  const renderSetup = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>🎙️</span> QA Mock Interview
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            AI-powered interview practice with real-time scoring and feedback
          </p>
        </div>
        <button 
          onClick={() => setPageState('HISTORY')}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(124,58,237,0.5)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <BarChart2 size={16} /> My Performance
        </button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '36px',
        margin: '0 auto',
        maxWidth: '720px'
      }}>
        {/* Step 1 */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '12px', color: 'white', fontWeight: '600' }}>Your Experience Level</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['Fresher', 'Mid-level', 'Senior'].map(lvl => {
              const isActive = level === lvl;
              const emoji = lvl === 'Fresher' ? '👶' : lvl === 'Mid-level' ? '💼' : '🚀';
              return (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: isActive ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {emoji} {lvl}
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '4px', color: 'white', fontWeight: '600' }}>Select Interview Topics</label>
          <span style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>Choose up to 5 topics (select at least 1)</span>
          
          <button 
            onClick={() => setShowTopicModal(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Browse Topics <ChevronDown size={16} />
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedTopics.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No topics selected yet</div>
            ) : (
              selectedTopics.map(t => (
                <div key={t} style={{
                  background: 'rgba(124,58,237,0.25)',
                  border: '1px solid rgba(124,58,237,0.4)',
                  color: '#a78bfa',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {t}
                  <button onClick={() => toggleTopic(t)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '4px', color: 'white', fontWeight: '600' }}>Number of Questions</label>
          <span style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>Each question has a {timeLimit} min timer</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[5, 10, 15, 20, 25].map(num => {
              const isActive = numQuestions === num;
              return (
                <button
                  key={num}
                  onClick={() => setNumQuestions(num)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: isActive ? '600' : '400'
                  }}
                >
                  {num}
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 4 */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '12px', color: 'white', fontWeight: '600' }}>Answer Mode</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            {['Type', 'Voice + Type'].map(mode => {
              const isActive = answerMode === mode;
              const emoji = mode === 'Type' ? '⌨️' : '🎤';
              return (
                <button
                  key={mode}
                  onClick={() => setAnswerMode(mode)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: isActive ? '600' : '400'
                  }}
                >
                  {emoji} {mode}
                </button>
              )
            })}
          </div>
          {answerMode === 'Voice + Type' && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Voice works best in Chrome</div>
          )}
        </div>

        {/* Step 5 */}
        <div style={{ marginBottom: '36px' }}>
          <label style={{ display: 'block', marginBottom: '12px', color: 'white', fontWeight: '600' }}>Time Per Question</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 5, 0].map(mins => {
              const isActive = timeLimit === mins;
              const label = mins === 0 ? 'No timer' : `${mins} min`;
              return (
                <button
                  key={mins}
                  onClick={() => setTimeLimit(mins)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: isActive ? '600' : '400'
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          disabled={selectedTopics.length === 0}
          onClick={fetchQuestions}
          style={{
            width: '100%',
            height: '52px',
            background: selectedTopics.length === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: selectedTopics.length === 0 ? 'rgba(255,255,255,0.3)' : 'white',
            fontSize: '15px',
            fontWeight: '700',
            borderRadius: '12px',
            border: 'none',
            cursor: selectedTopics.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🎙️ Start Mock Interview
        </button>
      </div>

      {/* TOPIC MODAL */}
      {showTopicModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#13112a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            width: '680px',
            maxWidth: '95vw',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Select Topics (max 5)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    background: 'rgba(124,58,237,0.3)',
                    color: '#a78bfa',
                    borderRadius: '20px',
                    padding: '3px 12px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {selectedTopics.length}/5 selected
                  </span>
                  <button 
                    onClick={() => setShowTopicModal(false)}
                    className="modal-close-btn"
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.2s' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search topics..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: '8px 14px 8px 36px',
                    color: 'white',
                    fontSize: '13px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div className="topic-modal-body" style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              {filteredTopics.map((group, idx) => (
                <div key={idx} style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    color: '#7c63f5',
                    textTransform: 'uppercase',
                    margin: '0 0 12px 0'
                  }}>
                    {group.group}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {group.topics.map(topic => {
                      const isSelected = selectedTopics.includes(topic);
                      const isDisabled = !isSelected && selectedTopics.length >= 5;
                      return (
                        <div
                          key={topic}
                          onClick={() => !isDisabled && toggleTopic(topic)}
                          style={{
                            background: isSelected ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${isSelected ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.12)'}`,
                            borderRadius: '20px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            color: isSelected ? '#a78bfa' : 'rgba(255,255,255,0.7)',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            fontWeight: isSelected ? '600' : '400',
                            opacity: isDisabled ? 0.35 : 1
                          }}
                        >
                          {topic}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setSelectedTopics([])} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                Clear All
              </button>
              <button 
                onClick={() => setShowTopicModal(false)}
                style={{
                  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 24px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Done ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const msecs = secs % 60;
    return `${mins}:${msecs < 10 ? '0' : ''}${msecs}`;
  };

  const renderActive = () => {
    if (loadingQuestions) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Loader size={48} color="#a78bfa" className="animate-spin" />
          <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.7)' }}>Generating tailored questions for you...</p>
        </div>
      );
    }

    if (questions.length === 0) return null;
    const q = questions[currentIdx];

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', position: 'relative' }}>
        {/* Top Bar */}
        <div style={{ 
          position: 'sticky', top: '10px', zIndex: 10, 
          background: 'rgba(19, 17, 42, 0.9)', backdropFilter: 'blur(10px)',
          padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Question {currentIdx + 1} of {numQuestions}</span>
            <span style={{
              background: 'rgba(124,58,237,0.25)', color: '#a78bfa',
              borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: '600'
            }}>
              {q.topic}
            </span>
          </div>

          {timeLimit > 0 && (
            <div style={{ 
              fontSize: '18px', fontWeight: '700', fontFamily: 'monospace',
              color: getTimerColors(), letterSpacing: '2px',
              animation: timeLeft < (timeLimit * 60 * 0.25) ? 'pulse 1s infinite' : 'none'
            }}>
              {formatTime(timeLeft)}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setIsPaused(!isPaused)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={() => setPageState('RESULTS')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <LogOut size={14} /> End Interview
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '4px', marginBottom: '24px' }}>
          <div style={{ 
            height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
            width: `${((currentIdx) / numQuestions) * 100}%`, transition: 'width 0.4s ease'
          }}></div>
        </div>

        {/* Question Card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '32px', margin: '0 auto 24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: q.difficulty === 'Easy' ? '#4ade80' : q.difficulty === 'Medium' ? '#fbbf24' : '#f87171', border: '1px solid', padding: '2px 8px', borderRadius: '12px' }}>
                {q.difficulty}
              </span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124,58,237,0.3)', border: '1px solid #7c3aed', color: '#a78bfa', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentIdx + 1}
            </div>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', lineHeight: '1.6', margin: '0 0 20px 0' }}>
            {q.text}
          </h2>

          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            disabled={evaluating || showInlineFeedback}
            placeholder="Type your answer here... Be as detailed as you would in a real interview."
            style={{
              minHeight: '180px', width: '100%', boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '16px', color: 'white', fontSize: '14px',
              lineHeight: '1.7', resize: 'vertical', outline: 'none'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div>
              {answerMode === 'Voice + Type' && (
                <button 
                  onClick={toggleRecording}
                  disabled={evaluating || showInlineFeedback}
                  style={{
                    background: isRecording ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.06)',
                    border: isRecording ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.12)',
                    color: isRecording ? '#f87171' : 'white',
                    padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'
                  }}
                >
                  {isRecording ? <Square size={14} /> : <Mic size={14} />}
                  {isRecording ? 'Stop Recording' : 'Start Speaking'}
                  {isRecording && <div style={{ width: '8px', height: '8px', background: '#f87171', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>}
                </button>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              {currentAnswer.trim().split(/\s+/).filter(x => x.length > 0).length} words
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <button
              onClick={() => { setCurrentAnswer('Skipped'); submitAnswer(); }}
              disabled={evaluating || showInlineFeedback}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <SkipForward size={16} /> Skip Question
            </button>
            <button
              onClick={submitAnswer}
              disabled={currentAnswer.trim().length === 0 || evaluating || showInlineFeedback}
              style={{
                background: currentAnswer.trim().length === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                color: currentAnswer.trim().length === 0 ? 'rgba(255,255,255,0.4)' : 'white',
                border: 'none', height: '44px', minWidth: '160px', padding: '0 24px', borderRadius: '8px',
                fontWeight: '600', cursor: currentAnswer.trim().length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {evaluating ? <Loader size={16} className="animate-spin" /> : 'Submit Answer ▶'}
            </button>
          </div>
        </div>

        {/* Micro Feedback */}
        {showInlineFeedback && inlineFeedback && (
          <div style={{
            background: 'rgba(19, 17, 42, 0.95)', border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: '16px', padding: '20px', marginTop: '16px',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: 'white' }}>Quick Feedback</h3>
              <div style={{
                background: inlineFeedback.score >= 7 ? 'rgba(74, 222, 128, 0.2)' : inlineFeedback.score >= 5 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                color: inlineFeedback.score >= 7 ? '#4ade80' : inlineFeedback.score >= 5 ? '#fbbf24' : '#f87171',
                padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px'
              }}>
                {inlineFeedback.score}/10
              </div>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#4ade80' }}>✓</span> {inlineFeedback.positive}
            </p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#fbbf24' }}>⚡</span> {inlineFeedback.improve}
            </p>
            <button
              onClick={handleNextQuestion}
              style={{
                width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white',
                border: 'none', padding: '12px 0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {currentIdx < questions.length - 1 ? 'Next Question →' : 'View Final Results Form →'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    // Basic aggregation
    const avgScore = sessionAnswers.length > 0 
      ? Math.round(sessionAnswers.reduce((acc, curr) => acc + (curr.score || 0), 0) / sessionAnswers.length)
      : 0;

    let color = '#ef4444'; 
    let verdict = 'Needs More Practice 📚';
    if (avgScore >= 8) { color = '#4ade80'; verdict = 'Excellent Performance! 🎉'; }
    else if (avgScore >= 6) { color = '#fbbf24'; verdict = 'Good Effort! Keep Going 💪'; }
    else if (avgScore >= 4) { color = '#f87171'; verdict = 'Needs Work ⚡'; }

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))',
          borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '24px'
        }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%', border: `3px solid ${color}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'white', lineHeight: '1' }}>{avgScore}</span>
            <span style={{ fontSize: '16px', opacity: 0.6, color: 'white' }}>/ 10</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>{verdict}</h2>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', minWidth: '120px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>{sessionAnswers.length}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions Answered</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', minWidth: '120px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>{level}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience Level</div>
            </div>
          </div>
        </div>

        <h3 style={{ color: 'white', marginBottom: '16px' }}>Question Breakdown</h3>
        {sessionAnswers.map((item, idx) => (
          <div key={idx} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '20px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Question {idx + 1} | {item.topic}</span>
              <span style={{ 
                color: item.score >= 7 ? '#4ade80' : item.score >= 5 ? '#fbbf24' : '#f87171',
                fontWeight: '700', fontSize: '14px'
              }}>Score: {item.score}/10</span>
            </div>
            <p style={{ color: 'white', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>{item.question}</p>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
              <strong>Your Answer:</strong><br/>{item.answer || <em>No answer provided</em>}
            </div>
            {item.feedback && (
               <div style={{ fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                 <div style={{ color: '#4ade80', marginBottom: '6px' }}>✓ {item.feedback.positive}</div>
                 <div style={{ color: '#fbbf24' }}>⚡ {item.feedback.improve}</div>
               </div>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingBottom: '40px' }}>
          <button
            onClick={() => {
              setSessionAnswers([]);
              setPageState('SETUP');
            }}
            style={{
              flex: 1, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white',
              border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            Start New Session
          </button>
          <button
            onClick={() => setPageState('HISTORY')}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white',
              border: '1px solid rgba(255,255,255,0.2)', padding: '16px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            View History
          </button>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <button 
            onClick={() => setPageState('SETUP')}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
          >
            <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h1 style={{ fontSize: '28px', margin: 0, color: 'white' }}>Mock Interview History</h1>
       </div>
       
       <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
         <BarChart2 size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 16px' }} />
         <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>History Coming Soon</h3>
         <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
           Your past interview sessions and performance trends will be available here soon to help you track your growth over time.
         </p>
         <button
            onClick={() => setPageState('SETUP')}
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            Back to Setup
          </button>
       </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 100%)',  fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '20px 0' }}>
        {pageState === 'SETUP' && renderSetup()}
        {pageState === 'ACTIVE' && renderActive()}
        {pageState === 'RESULTS' && renderResults()}
        {pageState === 'HISTORY' && renderHistory()}
      </div>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .topic-modal-body::-webkit-scrollbar {
            width: 8px;
          }
          .topic-modal-body::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 4px;
          }
          .topic-modal-body::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 4px;
          }
          .topic-modal-body::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }
          .modal-close-btn:hover {
            color: white !important;
          }
        `}
      </style>
    </div>
  );
};

export default MockInterview;
