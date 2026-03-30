import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from './AuthModal';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as firebaseAuth from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  GithubAuthProvider: vi.fn()
}));

describe('AuthModal Component Suite', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[Test 56] Renders null if isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={mockOnClose} triggerToast={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('[Test 57] Renders modal if isOpen is true', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    expect(screen.getByText('Login to QA Career Hub')).toBeInTheDocument();
  });

  it('[Test 58] Toggles to Sign Up modal correctly', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    fireEvent.click(screen.getByText('Sign up here'));
    expect(screen.getByText('Create new Account')).toBeInTheDocument();
  });

  it('[Test 59] Toggles back to Login modal correctly', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    fireEvent.click(screen.getByText('Sign up here'));
    fireEvent.click(screen.getByText('Login here'));
    expect(screen.getByText('Login to QA Career Hub')).toBeInTheDocument();
  });

  it('[Test 60] Can type an email', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    const emailInput = screen.getByPlaceholderText('avish@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('[Test 61] Can type a password', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    const pwInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(pwInput, { target: { value: 'password123' } });
    expect(pwInput.value).toBe('password123');
  });

  it('[Test 62] Displays password requirement error on short password during sign up', async () => {
    const mockToast = vi.fn();
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={mockToast} />);
    fireEvent.click(screen.getByText('Sign up here'));
    
    // Fill short pass
    const pwInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(pwInput, { target: { value: '123' } });
    
    // Submit
    fireEvent.click(screen.getByText('Sign Up'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Password must be at least 6 characters long.", "red");
    });
  });

  it('[Test 63] Submits email/password login correctly', async () => {
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });
    const mockToast = vi.fn();
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={mockToast} />);
    
    const email = screen.getByPlaceholderText('avish@example.com');
    const pwd = screen.getByPlaceholderText('••••••••');
    fireEvent.change(email, { target: { value: 'dev@test.com' } });
    fireEvent.change(pwd, { target: { value: '123456' } });
    
    fireEvent.click(screen.getByText('Log In'));
    
    await waitFor(() => {
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('[Test 64] Calls Google Login service on button click', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    fireEvent.click(screen.getByText('Continue with Google'));
    expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
  });

  it('[Test 65] Calls Github Login service on button click', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    fireEvent.click(screen.getByText('Continue with GitHub'));
    expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
  });

  it('[Test 66] Renders Forgot Password link', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
  });

  it('[Test 67] Has secure password input field types', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    const pwd = screen.getByPlaceholderText('••••••••');
    expect(pwd.type).toBe('password');
  });

  it('[Test 68] Handles generic signIn rejection appropriately', async () => {
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValue(new Error("Firebase Auth Error"));
    const mockToast = vi.fn();
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={mockToast} />);
    
    // submit blank
    fireEvent.click(screen.getByText('Log In'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Login failed. Please check your credentials.", "red");
    });
  });

  it('[Test 69] Prevents closure when clicking inside modal overlay payload', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    const modalBase = document.querySelector('.auth-modal');
    // Clicking the visual box shouldn't trigger container overlay close
    fireEvent.click(modalBase);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('[Test 70] Closes modal when overlay is clicked', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} triggerToast={vi.fn()} />);
    const overlay = document.querySelector('.auth-overlay');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
