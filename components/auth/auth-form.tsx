'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/lib/hooks/use-auth';
import {loginSchema, signupSchema} from '@/lib/schemas/auth';
import {ZodError} from 'zod';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export function AuthForm({type}: AuthFormProps) {
  const router = useRouter();
  const {signIn, signUp} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = Object.fromEntries(new FormData(e.currentTarget));

    try {
      if (type === 'login') {
        const validatedData = loginSchema.parse(formData);
        const {error} = await signIn(
          validatedData.email,
          validatedData.password
        );
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const validatedData = signupSchema.parse(formData);
        const {error} = await signUp(
          validatedData.email,
          validatedData.password,
          validatedData.fullName
        );
        if (error) throw error;
        router.push('/auth/login?verified=true');
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrors({form: err.message});
      } else if (err instanceof ZodError) {
        // Zod validation errors
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(({path, message}) => {
          fieldErrors[path[0]] = message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({form: 'An error occurred'});
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
      {errors.form && (
        <div className='bg-red-50 text-red-500 p-4 rounded-md text-sm'>
          {errors.form}
        </div>
      )}

      {type === 'signup' && (
        <div>
          <label
            htmlFor='fullName'
            className='block text-sm font-medium text-gray-700'
          >
            Full Name
          </label>
          <input
            id='fullName'
            name='fullName'
            type='text'
            required
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
          />
          {errors.fullName && (
            <p className='mt-1 text-sm text-red-500'>{errors.fullName}</p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor='email'
          className='block text-sm font-medium text-gray-700'
        >
          Email address
        </label>
        <input
          id='email'
          name='email'
          type='email'
          autoComplete='email'
          required
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
        />
        {errors.email && (
          <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='password'
          className='block text-sm font-medium text-gray-700'
        >
          Password
        </label>
        <input
          id='password'
          name='password'
          type='password'
          autoComplete={type === 'login' ? 'current-password' : 'new-password'}
          required
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
        />
        {errors.password && (
          <p className='mt-1 text-sm text-red-500'>{errors.password}</p>
        )}
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isLoading ? 'Loading...' : type === 'login' ? 'Sign in' : 'Sign up'}
      </button>
    </form>
  );
}
