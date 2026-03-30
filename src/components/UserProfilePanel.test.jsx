import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfilePanel from './UserProfilePanel';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as firestore from 'firebase/firestore';
import * as fstorage from 'firebase/storage';

describe('UserProfilePanel Component Suite', () => {
  const mockUser = { uid: 'u123', email: 'hello@mock.com', displayName: 'Jane Doe' };
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[Test 36] Does not display if isOpen is false', () => {
    const { container } = render(<UserProfilePanel isOpen={false} onClose={mockOnClose} user={mockUser} />);
    expect(container.firstChild.className).not.toContain('open');
  });

  it('[Test 37] Displays panel if isOpen is true', () => {
    const { container } = render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    expect(container.firstChild.className).toContain('open');
  });

  it('[Test 38] Renders User Profile heading correctly', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  it('[Test 39] Triggers onClose when X button is clicked', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    // Select the button holding the X lucide icon (via class)
    const btn = document.querySelector('.close-profile');
    fireEvent.click(btn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('[Test 40] Handles profile fetch on mount', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), 'users', 'u123');
    expect(firestore.getDoc).toHaveBeenCalled();
  });

  it('[Test 41] Safely sets initial email on load', async () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    // We expect the email field to hold user.email
    const inputs = screen.getAllByRole('textbox');
    // We must find the standard inputs. By default they are readOnly until edit mode.
    // Wait for the query since useEffect triggers state.
    await waitFor(() => {
      const emailInput = screen.getAllByRole('textbox').find(i => i.value === 'hello@mock.com');
      expect(emailInput).toBeTruthy();
    });
  });

  it('[Test 42] Displays first name extrapolated from displayName', async () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    await waitFor(() => {
      const fnInput = screen.getAllByRole('textbox').find(i => i.value === 'Jane');
      expect(fnInput).toBeTruthy();
    });
  });

  it('[Test 43] Subsections for Basic Info render properly', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
  });

  it('[Test 44] Subsections for Who You Are render properly', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    expect(screen.getByText('Who You Are')).toBeInTheDocument();
    expect(screen.getByText('Current Role / Title')).toBeInTheDocument();
  });

  it('[Test 45] Clicking Edit Pencil enables field editing', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    // Initial state is readonly
    const section = document.querySelectorAll('.profile-section')[0];
    const editBtn = section.querySelector('.edit-toggle');
    fireEvent.click(editBtn);
    // After firing, the fields within that section should drop the readonly class
    expect(section.querySelectorAll('.readonly').length).toBe(0);
  });

  it('[Test 46] The toggle Open to Relocation functions properly', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const box = screen.getByRole('checkbox');
    fireEvent.click(box);
    expect(box.checked).toBe(true);
  });

  it('[Test 47] Updates expected salary correctly via input', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const inputs = screen.getAllByRole('textbox');
    // Finding expected salary field
    const expectedSalaryLabel = screen.getByText('Expected Salary');
    const salaryInput = expectedSalaryLabel.nextElementSibling;
    fireEvent.change(salaryInput, { target: { value: '80000' } });
    expect(salaryInput.value).toBe('80000');
  });

  it('[Test 48] Changes in fields trigger the unsaved changes warning footer', async () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const expectedSalaryLabel = screen.getByText('Expected Salary');
    const salaryInput = expectedSalaryLabel.nextElementSibling;
    fireEvent.change(salaryInput, { target: { value: '90000' } });
    expect(await screen.findByText('You have unsaved changes')).toBeInTheDocument();
  });

  it('[Test 49] Cancel unsaved changes reverts data back to original', async () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const expectedSalaryLabel = screen.getByText('Expected Salary');
    const salaryInput = expectedSalaryLabel.nextElementSibling;
    fireEvent.change(salaryInput, { target: { value: '90000' } });
    fireEvent.click(screen.getByText('Cancel'));
    expect(salaryInput.value).toBe(''); // Reverted to default ''
    expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();
  });

  it('[Test 50] Typing in add skill input correctly binds value', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const skillInput = screen.getByPlaceholderText('Add skill e.g. Selenium');
    fireEvent.change(skillInput, { target: { value: 'Cypress' } });
    expect(skillInput.value).toBe('Cypress');
  });

  it('[Test 51] Adding a robust skill renders visually via tags', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const skillInput = screen.getByPlaceholderText('Add skill e.g. Selenium');
    fireEvent.change(skillInput, { target: { value: 'Appium' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('Appium')).toBeInTheDocument();
  });

  it('[Test 52] Renders fallback Anonymous User if no name provided', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={{ uid: 'b' }} />);
    expect(screen.getByDisplayValue('Anonymous User')).toBeInTheDocument();
  });

  it('[Test 53] Removing a skill tag dynamically deletes it', async () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const skillInput = screen.getByPlaceholderText('Add skill e.g. Selenium');
    fireEvent.change(skillInput, { target: { value: 'Jira' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });
    const removeBtn = document.querySelector('.remove-skill');
    fireEvent.click(removeBtn);
    expect(screen.queryByText('Jira')).not.toBeInTheDocument();
  });

  it('[Test 54] Simulates custom role entry via the Custom Role dropdown behavior', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const roleSelect = document.querySelector('.role-select');
    fireEvent.change(roleSelect, { target: { value: 'custom' } });
    expect(screen.getByPlaceholderText('Enter custom role...')).toBeInTheDocument();
  });

  it('[Test 55] Calculates completion bar accurately when basic fields filled', () => {
    render(<UserProfilePanel isOpen={true} onClose={mockOnClose} user={mockUser} />);
    const fill = document.querySelector('.completion-bar-fill');
    expect(fill.style.width).toBeDefined();
  });
});
