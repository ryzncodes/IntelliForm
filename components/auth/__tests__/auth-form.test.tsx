import {render, screen} from '@testing-library/react';
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

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /sign in/i})
      ).toBeInTheDocument();
    });

    it('handles form submission', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const user = userEvent.setup();
      render(<AuthForm type='login' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', {name: /sign in/i});
      await user.click(submitButton);

      expect(consoleSpy).toHaveBeenCalledWith('Form submitted:', {
        email: 'test@example.com',
        password: 'password123',
      });
      consoleSpy.mockRestore();
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
      const consoleSpy = jest.spyOn(console, 'log');
      const user = userEvent.setup();
      render(<AuthForm type='signup' />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', {name: /sign up/i});
      await user.click(submitButton);

      expect(consoleSpy).toHaveBeenCalledWith('Form submitted:', {
        email: 'test@example.com',
        password: 'password123',
      });
      consoleSpy.mockRestore();
    });
  });
});
