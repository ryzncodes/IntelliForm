'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useAuth} from '@/lib/hooks/use-auth';

export function AuthForm({type}: {type: 'login' | 'signup'}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signIn, signUp, isLoading, error} = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {error && (
        <div className='p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md'>
          {error}
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
  );
}
