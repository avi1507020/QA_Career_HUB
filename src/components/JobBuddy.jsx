import React, { useState, useEffect } from 'react';
import { 
  Target, Search, BookOpen, Lightbulb, 
  MapPin, Briefcase, IndianRupee, ExternalLink,
  ChevronRight, Info, Loader2, CheckCircle,
  Globe, Layers, UserPlus, 
  ArrowRight, FileText, Smartphone, Layout, X, Plus, Filter, MessageSquare, Award,
  Zap, Building2, Map, Calendar, Clock, Mail, User, ChevronDown, ChevronUp, Check, Square
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { isDemoUser } from '../utils/isDemoUser';

const PLATFORM_GROUPS = {
  "JOB PORTALS": [
    "Naukri", "LinkedIn", "Indeed India", "Foundit (Monster)", "Shine", 
    "Instahyre", "Glassdoor", "Freshersworld", "Internshala", "Hirist", 
    "Cutshort", "Wellfound", "iimjobs", "TimesJobs", "Apna Jobs"
  ],
  "COMPANY CAREER PORTALS": [
    "TCS iBegin", "Infosys Careers", "Wipro Careers", "Cognizant Careers", 
    "Capgemini Careers", "HCL Careers", "Tech Mahindra Careers", "Accenture Careers", 
    "LTIMindtree Careers", "Mphasis Careers", "Hexaware Careers", "Persistent Careers"
  ],
  "WALK-IN & CAMPUS": [
    "Walk-in Drives", "Campus Placement Drives", "Off-Campus Drives", 
    "Pool Campus Drives", "Government IT Jobs"
  ],
  "STARTUP & PRODUCT": [
    "Wellfound (AngelList)", "WorkAtAStartup", "YCombinator Jobs", "Cutshort", "Instahyre"
  ]
};

const PLATFORM_STYLE_MAP = {
  "Naukri": { bg: 'rgba(255,102,0,0.15)', color: '#ff6600' },
  "LinkedIn": { bg: 'rgba(0,119,181,0.15)', color: '#0077b5' },
  "Indeed India": { bg: 'rgba(0,114,187,0.15)', color: '#0072bb' },
  "Foundit": { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  "Shine": { bg: 'rgba(255,51,102,0.15)', color: '#ff3366' },
  "Instahyre": { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  "Glassdoor": { bg: 'rgba(0,214,163,0.15)', color: '#00d6a3' },
  "Freshersworld": { bg: 'rgba(0,200,100,0.15)', color: '#00c864' },
  "Internshala": { bg: 'rgba(0,176,255,0.15)', color: '#00b0ff' },
  "Hirist": { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  "Cutshort": { bg: 'rgba(255,140,0,0.15)', color: '#ff8c00' },
  "Wellfound": { bg: 'rgba(0,214,163,0.15)', color: '#00d6a3' },
  "iimjobs": { bg: 'rgba(180,0,0,0.15)', color: '#ff4444' },
  "Walk-in": { bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  "Campus": { bg: 'rgba(167,139,250,0.15)', color: '#c4b5fd' },
  "Company Portal": { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' }
};

const COMPANY_PORTALS = [
  { name: "TCS iBegin", tip: "Register on iBegin for all TCS drives", link: "https://ibegin.tcs.com/iBegin/" },
  { name: "Infosys Careers", tip: "Check InfyTQ for fresher opportunities", link: "https://career.infosys.com/joblist" },
  { name: "Wipro Careers", tip: "Register on Wipro Talent Community", link: "https://careers.wipro.com/" },
  { name: "Cognizant", tip: "Use job ID search for faster apply", link: "https://careers.cognizant.com/" },
  { name: "Capgemini", tip: "Check campus hiring section", link: "https://www.capgemini.com/in-en/careers/" },
  { name: "HCL Technologies", tip: "HCL Freshers drive — check TechBee", link: "https://www.hcltech.com/careers" },
  { name: "Tech Mahindra", tip: "Smart Hiring portal for freshers", link: "https://careers.techmahindra.com/" },
  { name: "Accenture India", tip: "ASE role open for freshers year-round", link: "https://www.accenture.com/in-en/careers" },
  { name: "LTIMindtree", tip: "Good for QA automation roles", link: "https://www.ltimindtree.com/careers/" },
  { name: "Mphasis", tip: "BFSI focused — good for MBA Finance", link: "https://careers.mphasis.com/" },
  { name: "Hexaware", tip: "Regular QA fresher drives", link: "https://hexaware.com/careers/" },
  { name: "Persistent", tip: "Product engineering QA roles", link: "https://careers.persistent.com/" }
];

const JobBuddy = ({ user }) => {
  const [activeTab, setActiveTab] = useState('find');
  const [findMode, setFindMode] = useState('listings'); 
  const [fresherSubTab, setFresherSubTab] = useState('guide'); 
  const [expSubTab, setExpSubTab] = useState('guide');

  // Filters State
  const [exp, setExp] = useState('Fresher (0-1 years)');
  const [education, setEducation] = useState('Any');
  const [trade, setTrade] = useState('Any');
  const [location, setLocation] = useState('Pan India');
  const [selectedCity, setSelectedCity] = useState('All Major Cities');
  const [jobType, setJobType] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [numResults, setNumResults] = useState(10);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq-api-key') || '');

  // Platform Section State
  const [platforms, setPlatforms] = useState(() => {
    const saved = localStorage.getItem('job_buddy_platform_prefs');
    return saved ? JSON.parse(saved) : ["Naukri", "LinkedIn", "Indeed India", "Instahyre"];
  });
  const [expandedGroups, setExpandedGroups] = useState({ "JOB PORTALS": true });

  // Results State
  const [jobs, setJobs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);

  // Best Practices State
  const [background, setBackground] = useState('B.Tech Computer Science');
  const [personalGuide, setPersonalGuide] = useState('');
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);

  const [currentExp, setCurrentExp] = useState('1-3 years');
  const [currentSkills, setCurrentSkills] = useState('Manual Testing');
  const [upgradeGuide, setUpgradeGuide] = useState('');
  const [isGeneratingUpgrade, setIsGeneratingUpgrade] = useState(false);

  const isMBAFinance = (exp.includes('Fresher') && (education === 'MBA' && trade === 'Finance')) || (exp.includes('Fresher') && education === 'MBA Finance');

  useEffect(() => {
    localStorage.setItem('job_buddy_platform_prefs', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    const fetchKey = async () => {
      if (user) {
        if (isDemoUser(user)) return;
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().profile?.groqApiKey) {
            setApiKey(docSnap.data().profile.groqApiKey);
          }
        } catch (e) { console.error("Error fetching Groq Key:", e); }
      }
    };
    fetchKey();
  }, [user]);

  const handleSearch = async () => {
    if (!apiKey) return;
    setIsSearching(true);
    setJobs([]);
    
    try {
      let systemPrompt = "";
      let userPrompt = "";

      if (findMode === 'walkins') {
        systemPrompt = "You are a QA job search assistant specializing in the Indian job market. Generate realistic QA walk-in drive listings for India. Respond ONLY with a raw JSON array, no markdown, no code fences.";
        userPrompt = `Generate ${numResults} QA walk-in drive listings for India.\nCity: ${selectedCity}\nExperience: ${exp}\n\nReturn ONLY a raw JSON array (no markdown): [{id, company, role, walkInDate, walkInTime, venue, city, contactPerson, contactEmail, skills:[], experience, documents:[], registrationUrl, isFresher:boolean}]`;
      } else if (isMBAFinance) {
        systemPrompt = "You are a senior QA career coach in India. Generate high-quality IT/QA job listings specifically for MBA Finance freshers from 2025 batch. Respond ONLY with a raw JSON array, no markdown, no code fences.";
        userPrompt = `Generate ${numResults} job listings SPECIFICALLY for MBA Finance freshers from 2025 batch in India. Role types: Business Analyst (QA domain), Test Analyst (Finance), UAT Analyst (Banking), Functional Tester (ERP/SAP). Use companies like TCS BaNCS, Infosys BPM, Mphasis, Razorpay, and Big 4. Return ONLY a raw JSON array (no markdown): [{id, title, company, location, experience, salary, jobType, platform, postedDate, skills:[], description, requirements:[], isFresher:true, applyUrl, financeRelevance, domainKnowledge:[], additionalAdvantage}]`;
      } else {
        systemPrompt = "You are a QA job search assistant specializing in the Indian job market. Generate realistic QA job listings. Respond ONLY with a raw JSON array, no markdown, no code fences.";
        userPrompt = `Generate ${numResults} QA job listings for India.\nFilters: Experience: ${exp}, Location: ${location}, Source: ${sourceFilter}, Platforms: ${platforms.join(', ')}.\nReturn ONLY a raw JSON array (no markdown): [{id, title, company, location, experience, salary, jobType, platform, postedDate, skills:[], description, requirements:[], isFresher:boolean, applyUrl, source, applicationMode, companyPortalUrl}]`;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 3000, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] })
      });

      const data = await response.json();
      // Strip markdown code fences if GROQ wraps the response (e.g. ```json ... ```)
      let raw = data.choices[0].message.content.trim();
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const jobList = JSON.parse(raw);
      setJobs(Array.isArray(jobList) ? jobList : []);
    } catch (e) { 
      console.error(e); 
      alert("Could not load listings. Please check your API key and try again.");
    } finally { setIsSearching(false); }
  };

  const generatePersonalGuide = async () => {
    if (!apiKey) return;
    setIsGeneratingGuide(true);
    const prompt = isMBAFinance ? `I am an MBA Finance fresher from 2025 batch in India looking for QA/IT jobs. Give me a complete detailed guide with BFSI QA roles, top skills, salary script, and 30-60-90 day plan.` : `Background: ${background}\nExperience: Fresher\nGive me a complete QA career roadmap for India.`;
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2500,
          messages: [{ role: "system", content: "You are a senior QA career coach in India. Use clean markdown." }, { role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      setPersonalGuide(data.choices[0].message.content);
    } catch (e) { console.error(e); } finally { setIsGeneratingGuide(false); }
  };

  const generateUpgradeGuide = async () => {
    if (!apiKey) return;
    setIsGeneratingUpgrade(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2000,
          messages: [{ role: "system", content: "You are a senior QA career coach in India. Use clean markdown." }, { role: "user", content: `Experience: ${currentExp}\nCurrent Skills: ${currentSkills}\nGive a career upgrade guide with market value, negotiation scripts, and senior role positioning.` }]
        })
      });
      const data = await response.json();
      setUpgradeGuide(data.choices[0].message.content);
    } catch (e) { console.error(e); } finally { setIsGeneratingUpgrade(false); }
  };

  const getBadges = (job) => {
    const s = PLATFORM_STYLE_MAP[job.platform] || PLATFORM_STYLE_MAP[job.source] || { bg: 'rgba(255,255,255,0.1)', color: 'white' };
    return (
      <div className="badges">
        <span className="platform-badge" style={{ background: s.bg, color: s.color }}>{job.platform || job.source || 'Job'}</span>
        {job.isFresher && <span className="exp-badge fresher">Fresher</span>}
        {job.walkInDate && <span className="exp-badge walkin-date">🚶 Walk-in: {job.walkInDate}</span>}
        {isMBAFinance && <span className="exp-badge mba-badge">MBA Finance</span>}
      </div>
    );
  };

  return (
    <div className="job-buddy-container">
      {/* Header */}
      <div className="job-buddy-header">
        <div className="header-left">
          <Target size={28} className="header-target-icon" />
          <div><h1>Job Buddy</h1><p className="subtitle">Find QA jobs, learn how to apply, and get AI-powered career coaching.</p></div>
        </div>
        <div className="header-right"><span className="groq-badge">Powered by GROQ AI</span></div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button className={`tab-btn ${activeTab === 'find' ? 'active' : ''}`} onClick={() => setActiveTab('find')}><Search size={16} /> Find Jobs</button>
        <button className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`} onClick={() => setActiveTab('apply')}><BookOpen size={16} /> How to Apply</button>
        <button className={`tab-btn ${activeTab === 'best' ? 'active' : ''}`} onClick={() => setActiveTab('best')}><Lightbulb size={16} /> Best Practices</button>
      </div>

      {activeTab === 'find' && (
        <div className="find-jobs-tab">
          <div className="glass-card filters-card">
            <div className="sub-mode-toggle">
              <button className={`mode-pill ${findMode === 'listings' ? 'active' : ''}`} onClick={() => setFindMode('listings')}>📋 Job Listings</button>
              <button className={`mode-pill ${findMode === 'walkins' ? 'active' : ''}`} onClick={() => setFindMode('walkins')}>🚶 Walk-in Drives</button>
            </div>

            <div className="filters-row">
              <div className="filter-group">
                <label>EXPERIENCE</label>
                <select value={exp} onChange={(e) => setExp(e.target.value)}><option>Fresher (0-1 years)</option><option>1-3 years</option><option>3-5 years</option><option>5-8 years</option></select>
              </div>
              {exp.includes('Fresher') && (
                <div className="filter-group">
                  <label>EDUCATION</label>
                  <select value={education} onChange={(e) => setEducation(e.target.value)}><option>Any</option><option>B.Tech/B.E</option><option>MCA</option><option>MBA</option><option>MBA Finance</option></select>
                </div>
              )}
              {exp.includes('Fresher') && education === 'MBA' && (
                <div className="filter-group"><label>TRADE</label><select value={trade} onChange={(e) => setTrade(e.target.value)}><option>Any</option><option>Finance</option><option>IT</option><option>HR</option></select></div>
              )}
              {findMode === 'walkins' ? (
                <div className="filter-group"><label>CITY</label><select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}><option>All Cities</option><option>Bangalore</option><option>Hyderabad</option><option>Pune</option></select></div>
              ) : (
                <div className="filter-group"><label>LOCATION</label><select value={location} onChange={(e) => setLocation(e.target.value)}><option>Pan India</option><option>Remote</option><option>Bangalore</option></select></div>
              )}
              <div className="filter-group"><label>SOURCE</label><select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}><option>All Sources</option><option>Job Portals</option><option>Company Portals</option></select></div>
            </div>

            {findMode === 'listings' && (
              <div className="platform-selection-area">
                {Object.entries(PLATFORM_GROUPS).map(([group, list]) => (
                  <div key={group} className="platform-group">
                    <div className="group-header" onClick={() => setExpandedGroups(prev => ({...prev, [group]: !prev[group]}))}>
                      <span>{expandedGroups[group] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} {group}</span>
                      <div className="group-actions" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPlatforms([...new Set([...platforms, ...list])])}>All</button>
                        <button onClick={() => setPlatforms(platforms.filter(p => !list.includes(p)))}>None</button>
                      </div>
                    </div>
                    {expandedGroups[group] && <div className="group-pills">{list.map(p => <button key={p} className={`pill ${platforms.includes(p) ? 'active' : ''}`} onClick={() => platforms.includes(p) ? setPlatforms(platforms.filter(x => x !== p)) : setPlatforms([...platforms, p])}>{p}</button>)}</div>}
                  </div>
                ))}
              </div>
            )}

            <button className="search-btn main-search" onClick={handleSearch} disabled={isSearching || !apiKey}>{isSearching ? <Loader2 className="animate-spin" /> : <Search size={20} />} Search Opportunities</button>
          </div>

          {isMBAFinance && (
            <div className="mba-finance-banner">
              <div className="banner-icon">🎓</div>
              <div className="banner-content"><h3>MBA Finance 2025 Batch — Special Jobs</h3><p>Curated QA and IT roles that accept MBA Finance graduates in India</p></div>
              <span className="batch-badge">2025 Batch</span>
            </div>
          )}

          {isSearching && <div className="loading-state"><Loader2 className="animate-spin" size={48} /><p>Finding the perfect roles for you...</p></div>}

          <div className="results-container">
            {jobs.map(job => (
              <div key={job.id} className={`glass-card job-card ${job.walkInDate ? 'walkin-border' : ''}`}>
                <div className="card-top">{getBadges(job)}<span className="posted-date">{job.postedDate}</span></div>
                <h3>{job.role || job.title}</h3><p className="company-name">{job.company}</p>
                <div className="job-meta">
                  <span><MapPin size={14} /> {job.venue || job.location}</span>
                  {job.walkInTime && <span><Clock size={14} /> {job.walkInTime}</span>}
                  <span><Briefcase size={14} /> {job.experience}</span>
                </div>
                {job.financeRelevance && (
                  <div className="mba-info-section">
                    <p className="rel-label">Why this fits MBA Finance 🎓</p><p className="rel-text">{job.financeRelevance}</p>
                    <div className="domain-pills">{job.domainKnowledge?.map(d => <span key={d} className="domain-pill">{d}</span>)}</div>
                  </div>
                )}
                <div className="card-actions">
                  <a href={job.applyUrl || job.registrationUrl} target="_blank" className="apply-btn">{job.walkInDate ? '📋 Register' : '🔗 Apply'}</a>
                  {job.venue && <a href={`https://maps.google.com/?q=${job.venue}`} target="_blank" className="details-btn maps-btn">📍 Maps</a>}
                  <button className="details-btn" onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>Details</button>
                </div>
                {expandedJob === job.id && <div className="job-details-expand"><p>{job.description}</p></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'apply' && (
        <div className="how-to-apply-tab">
           <div className="apply-guides-grid">
               <div className="glass-card guide-card naukri-accent">
                  <h3>How to Apply on Naukri</h3><p>Optimize your profile for India's #1 Job Portal.</p>
                  <a href="https://www.naukri.com" className="platform-btn naukri-btn" target="_blank">Open Naukri</a>
               </div>
               <div className="glass-card guide-card linkedin-accent">
                  <h3>How to Apply on LinkedIn</h3><p>Leverage your professional network for QA roles.</p>
                  <a href="https://www.linkedin.com/jobs" className="platform-btn linkedin-btn" target="_blank">Open LinkedIn</a>
               </div>
           </div>
           
           <h3 className="section-title">Company Career Portals</h3>
           <div className="company-portals-grid">
              {COMPANY_PORTALS.map(c => (
                <div key={c.name} className="glass-card company-portal-card">
                   <Building2 size={24} color="#a78bfa" />
                   <h4>{c.name}</h4><p>{c.tip}</p>
                   <a href={c.link} target="_blank">Careers Page →</a>
                </div>
              ))}
           </div>

           <div className="glass-card walkin-tips-card">
              <h3>🚶 Walk-in Drive Success Tips</h3>
              <ol><li>Arrive 30 mins early</li><li>Carry 3 copies of resume</li><li>Formal attire is mandatory</li><li>Prepare your 30s elevator pitch</li></ol>
           </div>
        </div>
      )}

      {activeTab === 'best' && (
        <div className="best-practices-tab">
          <div className="sub-tab-nav">
             <button className={`sub-tab ${fresherSubTab === 'guide' ? 'active' : ''}`} onClick={() => setFresherSubTab('guide')}>👶 For Freshers</button>
             <button className={`sub-tab ${expSubTab === 'salary' ? 'active' : ''}`} onClick={() => { setFresherSubTab('none'); setExpSubTab('salary'); }}>💼 For Experienced</button>
          </div>

          <div className="coaching-card glass-card">
             <div className="coaching-controls">
                <div className="control-group"><label>Background</label><select value={background} onChange={e => setBackground(e.target.value)}><option>B.Tech CS</option><option>MBA Finance</option><option>MCA</option></select></div>
                <button className="search-btn" onClick={generatePersonalGuide} disabled={isGeneratingGuide}>{isGeneratingGuide ? <Loader2 className="animate-spin" /> : "Get AI Guide"}</button>
             </div>
             {personalGuide && <ReactMarkdown className="markdown-content">{personalGuide}</ReactMarkdown>}
          </div>

          {isMBAFinance && (
             <div className="mba-quick-apply">
                <h3>Top Portals for MBA Finance QA Jobs</h3>
                <div className="quick-apply-grid"><a href="https://www.iimjobs.com/j/quality-assurance-jobs" className="glass-card mini-card">🎓 iimjobs QA</a><a href="https://www.naukri.com/mba-qa-analyst-jobs" className="glass-card mini-card">🔍 Naukri MBA</a></div>
             </div>
          )}

          {!isMBAFinance && (
            <div className="salary-guide-section">
               <h3>QA Salary Guide (India 2025)</h3>
               <div className="salary-grid">{[{l:'Fresher',r:'3-6 LPA'},{l:'1-3 yr',r:'6-12 LPA'},{l:'3-5 yr',r:'12-20 LPA'}].map(x => <div key={x.l} className="salary-card glass-card"><span>{x.l}</span><span>{x.r}</span></div>)}</div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .job-buddy-container { min-height: 100vh; padding: 2rem; color: white; max-width: 1300px; margin: 0 auto; }
        .job-buddy-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .tab-navigation { display: flex; gap: 10px; margin-bottom: 2rem; }
        .tab-btn { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.6); padding: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; }
        .tab-btn.active { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border: none; }
        .glass-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; backdrop-filter: blur(10px); }
        .filters-card { padding: 1.5rem; margin-bottom: 2rem; }
        .sub-mode-toggle { display: flex; gap: 8px; margin-bottom: 1.5rem; }
        .mode-pill { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 20px; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer; }
        .mode-pill.active { background: #7c3aed; color: white; }
        .filters-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
        .filter-group { flex: 1; min-width: 140px; }
        .filter-group label { display: block; font-size: 10px; font-weight: 800; color: #a78bfa; margin-bottom: 8px; }
        .filter-group select { width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 10px; color: white; border-radius: 8px; }
        .platform-group { margin-bottom: 1rem; }
        .group-header { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); cursor: pointer; border-radius: 8px; }
        .group-actions button { background: none; border: none; color: #60a5fa; font-size: 11px; margin-left: 10px; cursor: pointer; }
        .group-pills { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 0; }
        .pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 20px; font-size: 11px; cursor: pointer; color: rgba(255,255,255,0.6); }
        .pill.active { background: rgba(124,58,237,0.2); color: #a78bfa; border-color: #7c3aed; }
        .main-search { width: 100%; margin-top: 1rem; padding: 14px; }
        .results-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }
        .job-card { padding: 1.5rem; position: relative; }
        .walkin-border { border-left: 4px solid #4ade80; }
        .mba-finance-banner { background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.2)); border: 1px solid #7c3aed; padding: 16px; border-radius: 14px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 15px; }
        .badges { display: flex; gap: 6px; }
        .platform-badge { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; }
        .exp-badge { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; }
        .exp-badge.fresher { background: rgba(74,222,128,0.1); color: #4ade80; }
        .exp-badge.walkin-date { background: #4ade80; color: #000; }
        .exp-badge.mba-badge { background: #7c3aed; color: white; }
        .job-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; margin: 10px 0; opacity: 0.6; }
        .card-actions { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; margin-top: 15px; }
        .apply-btn { background: #7c3aed; color: white; text-align: center; padding: 10px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 12px; }
        .details-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px; border-radius: 8px; font-size: 11px; cursor: pointer; }
        .company-portals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .company-portal-card { padding: 1.5rem; text-align: center; }
        .company-portal-card h4 { margin: 10px 0; }
        .company-portal-card a { color: #a78bfa; font-weight: 700; text-decoration: none; font-size: 12px; }
        .salary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .salary-card { padding: 1rem; display: flex; justify-content: space-between; font-weight: 700; }
        @media (max-width: 768px) {
          .results-container { grid-template-columns: 1fr; }
          .card-actions { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default JobBuddy;
