import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { toast } from 'sonner';
import Login from '../Login';
import '@testing-library/jest-dom';

// ... rest of your test file

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the useAuth hook
const mockLogin = vi.fn();

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

describe('Login Component', () => {
  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders login form with all fields', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    renderLogin();
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Check that fields are required
    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    
    // Check if login was not called when form is empty
    fireEvent.click(submitButton);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    const testUser = { username: 'testuser', password: 'password123' };
    mockLogin.mockResolvedValueOnce(undefined);
    
    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: testUser.username },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: testUser.password },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if login was called with correct data
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(testUser.username, testUser.password);
    });
    
    // Check for success message
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
    });
    
    // Check navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid username or password');
    });
    
    // Check that navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables form elements while loading', async () => {
    // Mock login to return a promise that we can control
    let resolveLogin: () => void;
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValueOnce(loginPromise);
    
    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that elements are disabled during loading
    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
    
    // Resolve the login
    resolveLogin!();
    
    // Wait for the loading to finish
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
    });
  });

  it('displays correct button text during loading', async () => {
    // Mock login to return a promise that we can control
    let resolveLogin: () => void;
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValueOnce(loginPromise);
    
    renderLogin();
    
    // Initially shows "Sign In"
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Should show "Signing in..." during loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    });
    
    // Resolve the login
    resolveLogin!();
    
    // Wait for completion
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
    });
  });
});
