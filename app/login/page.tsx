import Link from 'next/link';
import {AuthForm} from '@/components/auth/auth-form';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: {verified?: string};
}) {
  return (
    <div className='min-h-screen flex bg-gray-50'>
      {/* Left side - Image */}
      <div className='hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600'>
        <div className='absolute inset-0 bg-black/10' />
        <div className='relative z-10 m-auto max-w-lg px-8 text-center'>
          <h1 className='text-5xl font-bold mb-6 text-white'>
            Welcome back to intelliForm
          </h1>
          <p className='text-xl text-white/90'>
            Sign in to continue building amazing forms
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <Card className='w-full max-w-md p-2 shadow-xl'>
          <CardHeader className='space-y-2'>
            <CardTitle className='text-3xl font-bold text-center'>
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {searchParams.verified && (
              <div className='p-4 bg-green-50 text-green-700 rounded-lg text-sm animate-fade-in'>
                Account created successfully! Please sign in.
              </div>
            )}
            <AuthForm type='login' />
            <p className='text-center text-sm text-gray-600'>
              Don&apos;t have an account?{' '}
              <Link
                href='/signup'
                className='font-medium text-blue-600 hover:text-blue-500 transition-colors'
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
