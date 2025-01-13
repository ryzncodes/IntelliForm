import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AuthForm} from '../auth-form';
import {useAuth} from '@/lib/hooks/use-auth';
import {useRouter} from 'next/navigation';

// Mock the hooks
jest.mock('@/lib/hooks/use-auth');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AuthForm', () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Login Form', () => {
    it('renders login form correctly', () => {
      render(<AuthForm type='login' />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /sign in/i})
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    });

    it('shows validation errors for invalid email', async () => {
      render(<AuthForm type='login' />);

      await userEvent.type(
        screen.getByLabelText(/email address/i),
        'invalid-email'
      );
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');

      fireEvent.submit(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it('shows validation errors for short password', async () => {
      render(<AuthForm type='login' />);

      await userEvent.type(
        screen.getByLabelText(/email address/i),
        'test@example.com'
      );
      await userEvent.type(screen.getByLabelText(/password/i), 'short');

      fireEvent.submit(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('calls signIn with valid credentials and redirects', async () => {
      mockSignIn.mockResolvedValueOnce({error: null});

      render(<AuthForm type='login' />);

      await userEvent.type(
        screen.getByLabelText(/email address/i),
        'test@example.com'
      );
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');

      fireEvent.submit(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Signup Form', () => {
    it('renders signup form correctly', () => {
      render(<AuthForm type='signup' />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /sign up/i})
      ).toBeInTheDocument();
    });

    it('shows validation error for invalid full name', async () => {
      render(<AuthForm type='signup' />);

      await userEvent.type(screen.getByLabelText(/full name/i), '123');
      await userEvent.type(
        screen.getByLabelText(/email address/i),
        'test@example.com'
      );
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');

      fireEvent.submit(screen.getByRole('button', {name: /sign up/i}));

      await waitFor(() => {
        expect(
          screen.getByText(/full name can only contain letters and spaces/i)
        ).toBeInTheDocument();
      });
    });

    it('calls signUp with valid data and redirects', async () => {
      mockSignUp.mockResolvedValueOnce({error: null});

      render(<AuthForm type='signup' />);

      await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
      await userEvent.type(
        screen.getByLabelText(/email address/i),
        'test@example.com'
      );
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');

      fireEvent.submit(screen.getByRole('button', {name: /sign up/i}));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          'John Doe'
        );
        expect(mockPush).toHaveBeenCalledWith('/auth/login?verified=true');
      });
    });
  });
});
