import React, { useState } from 'react';
import { User, Mail, Lock, LogIn, UserPlus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { DEMO_EMAIL, DEMO_PASSWORD, loginAsDemo, getDemoUser } from '../utils/useDemoAuth';

const Auth = ({ onLogin, onClose, onOpenDemo }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const inputEmail = formData.email.trim();
        const inputPwd = formData.password.trim();
        
        if (inputEmail === DEMO_EMAIL && inputPwd === DEMO_PASSWORD) {
          loginAsDemo(DEMO_EMAIL, DEMO_PASSWORD);
          onLogin(getDemoUser());
          return;
        }

        // Real Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onLogin(userCredential.user);
      } else {
        // Real Firebase Signup
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Update Firebase Profile with Full Name
        await updateProfile(userCredential.user, {
          displayName: `${formData.firstName} ${formData.lastName}`.trim()
        });
        
        // Reload user to ensure displayName is updated in the current object
        await userCredential.user.reload();
        const updatedUser = auth.currentUser;

        setSuccess('Profile created successfully!');
        onLogin(updatedUser); // Auto-login after signup
      }
    } catch (err) {
      console.error("Firebase Auth Error:", err.code, err.message);
      
      const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please login instead.',
        'auth/invalid-credential': 'Invalid email or password. Please try again.',
        'auth/weak-password': 'Password is too weak. Must be at least 6 characters.',
        'auth/operation-not-allowed': 'Sign-up is currently disabled. Please enable "Email/Password" in your Firebase Auth Console.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
      };

      setError(errorMessages[err.code] || `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirmation-overlay open" style={{ zIndex: 9000 }} onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '1rem', color: 'white', letterSpacing: '-0.5px' }}>
          {isLogin ? 'Welcome Job Hunter! 🎯' : 'Start Your Journey'}
        </h2>
        <p style={{ color: '#d1d5db', marginBottom: '3rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
          {isLogin ? 'Log in to track your QA career path' : 'Create your unique profile to stay on top of testing jobs'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isLogin && (
            <>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="First Name" 
                  required 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="auth-input"
                />
                <User size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  required 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="auth-input"
                />
                <User size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              </div>
            </>
          )}

          <div style={{ position: 'relative' }}>
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="auth-input"
            />
            <Mail size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="auth-input"
            />
            <Lock size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          </div>

          <button type="submit" className="rocket-button auth-btn-large" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
            {!loading && (isLogin ? 'Login Now' : 'Create Profile')}
          </button>
        </form>

        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center', margin: '16px 0' }}>─── or ───</div>
        <button 
          onClick={onOpenDemo}
          style={{ width: '100%', height: '48px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '10px', color: '#a78bfa', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          🚀 Try Demo — No Sign Up Needed
        </button>

        <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account?" : "Already have a profile?"} 
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'transparent', border: 'none', color: '#8b5cf6', fontWeight: '800', marginLeft: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
