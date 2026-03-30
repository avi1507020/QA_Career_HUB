import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as firestore from 'firebase/firestore';

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Header Component Test Suite', () => {
  const mockUser = { uid: '123', email: 'test@mail.com', displayName: 'Test User' };
  const mockOnLogout = vi.fn();
  const mockOnOpenAuth = vi.fn();
  const mockOnOpenProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[Test 1] Renders the QA Career Hub logo text correctly', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('QA Career Hub')).toBeInTheDocument();
  });

  it('[Test 2] Renders the logo slogan correctly', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Elevate Your Testing Career')).toBeInTheDocument();
  });

  it('[Test 3] Displays Login / Sign Up button when user is not logged in', () => {
    renderWithRouter(<Header user={null} onOpenAuth={mockOnOpenAuth} />);
    expect(screen.getByText('Login / Sign Up')).toBeInTheDocument();
  });

  it('[Test 4] Does not display user chip when user is null', () => {
    renderWithRouter(<Header user={null} />);
    expect(screen.queryByText('LogOut')).not.toBeInTheDocument();
    expect(screen.queryByText('Active Explorer')).not.toBeInTheDocument();
  });

  it('[Test 5] Fires onOpenAuth when Login button is clicked', () => {
    renderWithRouter(<Header user={null} onOpenAuth={mockOnOpenAuth} />);
    fireEvent.click(screen.getByText('Login / Sign Up'));
    expect(mockOnOpenAuth).toHaveBeenCalledTimes(1);
  });

  it('[Test 6] Renders Logout button when user is logged in', () => {
    renderWithRouter(<Header user={mockUser} />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('[Test 7] Fires onLogout when Logout button is clicked', () => {
    renderWithRouter(<Header user={mockUser} onLogout={mockOnLogout} />);
    fireEvent.click(screen.getByText('Logout'));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('[Test 8] Displays user displayName if available', () => {
    renderWithRouter(<Header user={mockUser} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('[Test 9] Displays fallback email username if displayName is null', () => {
    renderWithRouter(<Header user={{ uid: '456', email: 'johndoe@ymail.com' }} />);
    expect(screen.getByText('johndoe')).toBeInTheDocument();
  });

  it('[Test 10] Calls onSnapshot to fetch the users profile dynamically', () => {
    renderWithRouter(<Header user={mockUser} />);
    expect(firestore.onSnapshot).toHaveBeenCalledTimes(1);
  });

  it('[Test 11] Passes user.uid to the Firestore doc reference correctly', () => {
    renderWithRouter(<Header user={mockUser} />);
    expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
  });

  it('[Test 12] Cleans up the onSnapshot listener on component unmount', () => {
    const unsubMock = vi.fn();
    firestore.onSnapshot.mockReturnValueOnce(unsubMock);
    const { unmount } = renderWithRouter(<Header user={mockUser} />);
    unmount();
    expect(unsubMock).toHaveBeenCalledTimes(1);
  });

  it('[Test 13] Opens User Profile panel when user chip is clicked', () => {
    renderWithRouter(<Header user={mockUser} onOpenProfile={mockOnOpenProfile} />);
    const chip = screen.getByText('Test User').closest('.user-chip');
    fireEvent.click(chip);
    expect(mockOnOpenProfile).toHaveBeenCalledTimes(1);
  });

  it('[Test 14] Displays custom fetched role when onSnapshot returns data', async () => {
    firestore.onSnapshot.mockImplementation((docRef, callback) => {
      callback({
        exists: () => true,
        data: () => ({ profile: { role: 'SDET Manager', firstName: 'Alice' } })
      });
      return vi.fn();
    });
    renderWithRouter(<Header user={mockUser} />);
    await waitFor(() => {
      expect(screen.getByText('SDET Manager')).toBeInTheDocument();
    });
  });

  it('[Test 15] Displays fallback Active Explorer role if doc snapshot contains no role', async () => {
    firestore.onSnapshot.mockImplementation((docRef, callback) => {
      callback({
        exists: () => true,
        data: () => ({ profile: {} })
      });
      return vi.fn();
    });
    renderWithRouter(<Header user={mockUser} />);
    await waitFor(() => {
      expect(screen.getByText('Active Explorer')).toBeInTheDocument();
    });
  });
});
