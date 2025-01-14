'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useAuth} from '@/lib/hooks/use-auth';

export function AuthForm({type}: {type: 'login' | 'signup'}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signIn, signUp, signInWithProvider, isLoading, error} = useAuth();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  const authError =
    error ||
    (searchParams.get('error') === 'auth_callback_failed'
      ? 'Authentication failed. Please try again.'
      : null);

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        {authError && (
          <div className='p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md'>
            {authError}
          </div>
        )}
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-sm font-medium'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='you@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='h-11'
            disabled={isLoading}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password' className='text-sm font-medium'>
            Password
          </Label>
          <Input
            id='password'
            type='password'
            placeholder='••••••••'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='h-11'
            disabled={isLoading}
          />
        </div>
        <Button
          type='submit'
          size='lg'
          className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium'
          disabled={isLoading}
        >
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                  fill='none'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              {type === 'login' ? 'Signing in...' : 'Signing up...'}
            </span>
          ) : type === 'login' ? (
            'Sign In'
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>

      {/* OAuth Provider */}
      <Button
        type='button'
        variant='outline'
        className='w-full bg-white'
        onClick={() => signInWithProvider('google')}
        disabled={isLoading}
      >
        <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
          <path
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            fill='#4285F4'
          />
          <path
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            fill='#34A853'
          />
          <path
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            fill='#FBBC05'
          />
          <path
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            fill='#EA4335'
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}
