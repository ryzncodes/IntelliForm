import Link from 'next/link';
import {AuthForm} from '@/components/auth/auth-form';

export default function LoginPage({
  searchParams,
}: {
  searchParams: {verified?: string};
}) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h1 className='text-center text-3xl font-bold'>intelliForm</h1>
          <h2 className='mt-6 text-center text-2xl font-bold text-gray-900'>
            Sign in to your account
          </h2>
          {searchParams.verified && (
            <div className='mt-4 p-4 bg-green-50 text-green-700 rounded-md text-sm'>
              Account created successfully! Please sign in.
            </div>
          )}
        </div>

        <AuthForm type='login' />

        <p className='mt-4 text-center text-sm text-gray-600'>
          Don&apos;t have an account?{' '}
          <Link
            href='/auth/signup'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
