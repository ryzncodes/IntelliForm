import Link from 'next/link';
import {AuthForm} from '@/components/auth/auth-form';

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h1 className='text-center text-3xl font-bold'>intelliForm</h1>
          <h2 className='mt-6 text-center text-2xl font-bold text-gray-900'>
            Create your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Start creating dynamic forms in minutes
          </p>
        </div>

        <AuthForm type='signup' />

        <p className='mt-4 text-center text-sm text-gray-600'>
          Already have an account?{' '}
          <Link
            href='/auth/login'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
