import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AuthForm} from '../auth-form';
import {useAuth} from '@/lib/hooks/use-auth';

// Mock the useAuth hook
jest.mock('@/lib/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

describe('AuthForm', () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockSignInWithProvider = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInWithProvider: mockSignInWithProvider,
      isLoading: false,
      error: null,
    });
  });

  describe('Login Form', () => {
    it('renders login form correctly', () => {
      render(<AuthForm type='login' />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /sign in/i})
      ).toBeInTheDocument();
    });

    it('handles form submission', async () => {
      const user = userEvent.setup();
      render(<AuthForm type='login' />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {name: /sign in/i});

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockSignIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    it('shows loading state', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        signUp: mockSignUp,
        signInWithProvider: mockSignInWithProvider,
        isLoading: true,
        error: null,
      });

      render(<AuthForm type='login' />);

      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /signing in/i})).toBeDisabled();
    });

    it('shows error message', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        signUp: mockSignUp,
        signInWithProvider: mockSignInWithProvider,
        isLoading: false,
        error: 'Invalid credentials',
      });

      render(<AuthForm type='login' />);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  describe('Signup Form', () => {
    it('renders signup form correctly', () => {
      render(<AuthForm type='signup' />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /sign up/i})
      ).toBeInTheDocument();
    });

    it('handles form submission', async () => {
      const user = userEvent.setup();
      render(<AuthForm type='signup' />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {name: /sign up/i});

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    it('shows loading state', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        signUp: mockSignUp,
        signInWithProvider: mockSignInWithProvider,
        isLoading: true,
        error: null,
      });

      render(<AuthForm type='signup' />);

      expect(screen.getByText(/signing up/i)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /signing up/i})).toBeDisabled();
    });

    it('shows error message', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        signUp: mockSignUp,
        signInWithProvider: mockSignInWithProvider,
        isLoading: false,
        error: 'Email already exists',
      });

      render(<AuthForm type='signup' />);

      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  describe('Google OAuth', () => {
    it('renders Google sign in button', () => {
      render(<AuthForm type='login' />);
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
    });

    it('handles Google sign in', async () => {
      const user = userEvent.setup();
      render(<AuthForm type='login' />);

      const googleButton = screen.getByText(/continue with google/i);
      await user.click(googleButton);

      expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
    });

    it('disables Google button during loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        signUp: mockSignUp,
        signInWithProvider: mockSignInWithProvider,
        isLoading: true,
        error: null,
      });

      render(<AuthForm type='login' />);
      expect(
        screen.getByText(/continue with google/i).closest('button')
      ).toBeDisabled();
    });
  });
});
