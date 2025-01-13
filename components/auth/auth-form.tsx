'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export function AuthForm({type}: {type: 'login' | 'signup'}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', {email, password});
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
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
        />
      </div>
      <Button
        type='submit'
        size='lg'
        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium'
      >
        {type === 'login' ? 'Sign In' : 'Sign Up'}
      </Button>
    </form>
  );
}
