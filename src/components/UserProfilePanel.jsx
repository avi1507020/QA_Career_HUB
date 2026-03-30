import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, Pencil, Plus, Trash2, 
  Link, Code2, User, Save, RotateCcw, 
  CheckCircle2, Info, AlertTriangle, ChevronDown, Check
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import './UserProfilePanel.css';

const ROLES = [
  "Active Explorer",
  "QA Engineer",
  "QA Lead",
  "QA Manager",
  "SDET",
  "Automation Engineer",
  "Manual Tester",
  "Dev / Developer",
  "DevOps"
];

const EXPERIENCE_OPTIONS = [
  "Fresher", "1-2 yrs", "3-5 yrs", "5-8 yrs", "8-12 yrs", "12+ yrs"
];

const JOB_TYPES = ["Full-time", "Contract", "Freelance", "Internship"];
const WORK_MODES = ["On-site", "Remote", "Hybrid"];

const INITIAL_PROFILE = {
  firstName: '', 
  lastName: '', 
  email: '', 
  phone: '', 
  city: '',
  role: 'Active Explorer',
  jobTitle: '',
  experience: 'Fresher',
  skills: [],
  linkedin: '',
  github: '',
  bio: '',
  jobType: [],
  workMode: 'Remote',
  expectedSalary: '',
  openToRelocation: false,
  avatarUrl: ''
};

const UserProfilePanel = ({ user, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [initialProfile, setInitialProfile] = useState(INITIAL_PROFILE);
  const [editSections, setEditSections] = useState({ basic: false, who: false, prefs: false });
  const [newSkill, setNewSkill] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      document.body.style.overflow = 'hidden';
      fetchProfile();
    } else {
      document.body.style.overflow = 'auto';
    }
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data().profile || docSnap.data();
        const mergedProfile = { ...INITIAL_PROFILE, ...data };
        setProfile(mergedProfile);
        setInitialProfile(mergedProfile);
        
        // Check if role is custom
        if (data.role && !ROLES.includes(data.role)) {
          setIsCustomRole(true);
          setCustomRoleText(data.role);
        }
      } else {
        // New user - prefill email if available
        const nameParts = user.displayName ? user.displayName.split(' ') : [];
        const newProfile = { 
          ...INITIAL_PROFILE, 
          email: user.email || '', 
          firstName: nameParts[0] || '', 
          lastName: nameParts.slice(1).join(' ') || '' 
        };
        setProfile(newProfile);
        setInitialProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching profile, likely missing Firestore rules or missing document:", error);
      // Fallback to default state if read rules deny access
      const nameParts = user.displayName ? user.displayName.split(' ') : [];
      const fallbackProfile = { 
        ...INITIAL_PROFILE, 
        email: user.email || '', 
        firstName: nameParts[0] || '', 
        lastName: nameParts.slice(1).join(' ') || '' 
      };
      setProfile(fallbackProfile);
      setInitialProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const dataToSave = {
        profile: {
          ...profile,
          updatedAt: serverTimestamp()
        }
      };
      await setDoc(docRef, dataToSave, { merge: true });
      setInitialProfile(profile);
      triggerToast("Profile updated successfully!");
      setEditSections({ basic: false, who: false, prefs: false });
    } catch (error) {
      console.error("Error saving profile:", error);
      triggerToast("Failed to save changes", "red");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfile({ ...profile, avatarUrl: url });
      triggerToast("Photo uploaded!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      triggerToast("Upload failed", "red");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && newSkill.trim()) {
      if (!profile.skills.includes(newSkill.trim())) {
        setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });
  };

  const togglePill = (field, value) => {
    const current = profile[field] || [];
    if (current.includes(value)) {
      setProfile({ ...profile, [field]: current.filter(v => v !== value) });
    } else {
      setProfile({ ...profile, [field]: [...current, value] });
    }
  };

  const triggerToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const calculateCompletion = () => {
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'city',
      'jobTitle', 'experience', 'linkedin', 'github', 'bio',
      'workMode', 'expectedSalary'
    ];
    let filled = fields.filter(f => profile[f] && profile[f].toString().trim() !== '').length;
    if (profile.skills.length > 0) filled++;
    if (profile.jobType.length > 0) filled++;
    if (profile.avatarUrl) filled++;
    
    const total = fields.length + 3;
    return Math.round((filled / total) * 100);
  };

  const hasUnsavedChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile);

  const resetChanges = () => {
    setProfile(initialProfile);
    setEditSections({ basic: false, who: false, prefs: false });
  };

  const handleRoleChange = (e) => {
    const val = e.target.value;
    if (val === "custom") {
      setIsCustomRole(true);
    } else {
      setIsCustomRole(false);
      setProfile({ ...profile, role: val });
    }
  };

  const confirmCustomRole = () => {
    if (customRoleText.trim()) {
      setProfile({ ...profile, role: customRoleText.trim() });
      setIsCustomRole(false);
    }
  };

  return (
    <div className={`user-profile-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="user-profile-panel" onClick={(e) => e.stopPropagation()}>
        {loading && <div className="loading-overlay"><div className="spinner"></div></div>}
        
        <header className="profile-header">
          <h2>User Profile</h2>
          <button className="close-profile" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="profile-scroll-area">
          {/* Avatar Section */}
          <section className="avatar-section">
            <div className="avatar-container">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={40} color="rgba(255,255,255,0.5)" />
                </div>
              )}
              <button 
                className="avatar-upload-btn" 
                onClick={() => fileInputRef.current.click()}
                title="Change Photo"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
            </div>
            
            <div className="display-name-container">
              <input 
                className="display-name-input"
                value={`${profile.firstName} ${profile.lastName}`.trim() || 'Anonymous User'}
                readOnly
              />
            </div>

            <div className="role-badge-container">
              {!isCustomRole ? (
                <div style={{ position: 'relative' }}>
                   <select 
                    className="role-select"
                    value={profile.role || ''}
                    onChange={handleRoleChange}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    {profile.role && !ROLES.includes(profile.role) && (
                      <option value={profile.role}>{profile.role}</option>
                    )}
                    <option value="custom">+ Add Custom Role...</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                </div>
              ) : (
                <div className="skill-input-wrapper">
                  <input 
                    className="role-select"
                    style={{ textAlign: 'left', paddingRight: '40px' }}
                    value={customRoleText}
                    onChange={(e) => setCustomRoleText(e.target.value)}
                    placeholder="Enter custom role..."
                    autoFocus
                  />
                  <button 
                    onClick={confirmCustomRole}
                    style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: '#10b981', border: 'none', color: 'white', padding: '5px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Check size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Completion Bar */}
          <section className="completion-section">
            <div className="completion-label">
              <span>Profile Completion</span>
              <span>{calculateCompletion()}%</span>
            </div>
            <div className="completion-bar-bg">
              <div 
                className="completion-bar-fill" 
                style={{ width: `${calculateCompletion()}%` }}
              ></div>
            </div>
          </section>

          {/* Basic Info */}
          <div className="profile-section">
            <header className="section-header">
              <h3>Basic INFO</h3>
              <div className="edit-toggle" onClick={() => setEditSections({...editSections, basic: !editSections.basic})}>
                <Pencil size={16} />
              </div>
            </header>
            
            <div className="form-grid">
              <div className={`field-group ${!editSections.basic ? 'readonly' : ''}`}>
                <label>First Name</label>
                <input 
                  type="text" 
                  value={profile.firstName} 
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  readOnly={!editSections.basic}
                />
              </div>
              <div className={`field-group ${!editSections.basic ? 'readonly' : ''}`}>
                <label>Last Name</label>
                <input 
                  type="text" 
                  value={profile.lastName} 
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  readOnly={!editSections.basic}
                />
              </div>
              <div className={`field-group full-width ${!editSections.basic ? 'readonly' : ''}`}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  readOnly={!editSections.basic}
                />
              </div>
              <div className={`field-group ${!editSections.basic ? 'readonly' : ''}`}>
                <label>Phone</label>
                <input 
                  type="text" 
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  readOnly={!editSections.basic}
                  placeholder="+1 234..."
                />
              </div>
              <div className={`field-group ${!editSections.basic ? 'readonly' : ''}`}>
                <label>City</label>
                <input 
                  type="text" 
                  value={profile.city} 
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                  readOnly={!editSections.basic}
                />
              </div>
            </div>
          </div>

          {/* Who You Are */}
          <div className="profile-section">
            <header className="section-header">
              <h3>Who You Are</h3>
              <div className="edit-toggle" onClick={() => setEditSections({...editSections, who: !editSections.who})}>
                <Pencil size={16} />
              </div>
            </header>
            
            <div className="form-grid">
              <div className={`field-group full-width ${!editSections.who ? 'readonly' : ''}`}>
                <label>Current Job Title</label>
                <input 
                  type="text" 
                  value={profile.jobTitle} 
                  onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                  readOnly={!editSections.who}
                  placeholder="e.g. Senior QA Lead"
                />
              </div>
              
              <div className={`field-group full-width ${!editSections.who ? 'readonly' : ''}`}>
                <label>Years of Experience</label>
                {editSections.who ? (
                  <select 
                    value={profile.experience}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                  >
                    {EXPERIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type="text" value={profile.experience} readOnly />
                )}
              </div>

              <div className="field-group full-width">
                <label>Skills / Tech Stack</label>
                <div className="skills-container">
                  {profile.skills.map(skill => (
                    <span key={skill} className="skill-tag">
                      {skill}
                      {editSections.who && (
                        <X size={12} className="remove-skill" onClick={() => removeSkill(skill)} />
                      )}
                    </span>
                  ))}
                  {editSections.who && (
                    <div className="skill-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="Add skill..." 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleAddSkill}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', borderRadius: '0' }}
                      />
                      <button onClick={handleAddSkill} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                        <Plus size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={`field-group full-width ${!editSections.who ? 'readonly' : ''}`}>
                <label>LinkedIn URL</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link size={16} style={{ color: '#0a66c2', opacity: profile.linkedin ? 1 : 0.4 }} />
                  <input 
                    type="text" 
                    value={profile.linkedin} 
                    onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                    readOnly={!editSections.who}
                    placeholder="linkedin.com/in/..."
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className={`field-group full-width ${!editSections.who ? 'readonly' : ''}`}>
                <label>GitHub / Portfolio</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code2 size={16} style={{ opacity: profile.github ? 1 : 0.4 }} />
                  <input 
                    type="text" 
                    value={profile.github} 
                    onChange={(e) => setProfile({...profile, github: e.target.value})}
                    readOnly={!editSections.who}
                    placeholder="github.com/..."
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className={`field-group full-width ${!editSections.who ? 'readonly' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Short Bio</label>
                  <span style={{ fontSize: '0.65rem', color: (profile.bio || '').length > 300 ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>
                    {(profile.bio || '').length} / 300
                  </span>
                </div>
                <textarea 
                  rows="3"
                  value={profile.bio} 
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      setProfile({...profile, bio: e.target.value});
                    }
                  }}
                  readOnly={!editSections.who}
                  placeholder="Share a brief overview of your professional background..."
                />
              </div>
            </div>
          </div>

          {/* Job Preferences */}
          <div className="profile-section" style={{ marginBottom: hasUnsavedChanges ? '100px' : '20px' }}>
            <header className="section-header">
              <h3>Job Preferences</h3>
              <div className="edit-toggle" onClick={() => setEditSections({...editSections, prefs: !editSections.prefs})}>
                <Pencil size={16} />
              </div>
            </header>
            
            <div className="form-grid">
              <div className="field-group full-width">
                <label>Job Type</label>
                <div className="pill-group">
                  {JOB_TYPES.map(type => (
                    <div 
                      key={type} 
                      className={`pill ${profile.jobType.includes(type) ? 'active' : ''}`}
                      onClick={() => editSections.prefs && togglePill('jobType', type)}
                      style={{ cursor: editSections.prefs ? 'pointer' : 'default' }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              <div className="field-group full-width">
                <label>Work Mode</label>
                <div className="pill-group">
                  {WORK_MODES.map(mode => (
                    <div 
                      key={mode} 
                      className={`pill ${profile.workMode === mode ? 'active' : ''}`}
                      onClick={() => editSections.prefs && setProfile({...profile, workMode: mode})}
                      style={{ cursor: editSections.prefs ? 'pointer' : 'default' }}
                    >
                      {mode}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`field-group ${!editSections.prefs ? 'readonly' : ''}`}>
                <label>Expected Salary</label>
                <input 
                  type="text" 
                  value={profile.expectedSalary} 
                  onChange={(e) => setProfile({...profile, expectedSalary: e.target.value})}
                  readOnly={!editSections.prefs}
                  placeholder="e.g. ₹15,00,000"
                />
              </div>

              <div className="field-group">
                <label>Open to Relocation</label>
                <div className="toggle-wrapper" style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{profile.openToRelocation ? 'Yes' : 'No'}</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={profile.openToRelocation} 
                      onChange={(e) => editSections.prefs && setProfile({...profile, openToRelocation: e.target.checked})}
                      disabled={!editSections.prefs}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasUnsavedChanges && (
          <footer className="profile-footer">
            <div className="unsaved-badge">
              <AlertTriangle size={16} />
              <span>You have unsaved changes</span>
            </div>
            <div className="footer-actions">
              <button className="primary-button cancel-btn" onClick={resetChanges} style={{ minWidth: '100px', height: '44px' }}>
                <RotateCcw size={16} /> Cancel
              </button>
              <button className="primary-button save-btn" onClick={saveProfile} style={{ height: '44px' }}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </footer>
        )}

        {showToast && (
          <div className={`toast-notification visible ${toastMsg.type === 'red' ? 'red' : ''}`} style={{ width: '80%', left: '50%', transform: 'translateX(-50%)', bottom: '20px', top: 'auto', zIndex: 100 }}>
            {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
            {toastMsg.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePanel;
