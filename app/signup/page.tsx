import Link from 'next/link';
import {AuthForm} from '@/components/auth/auth-form';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex bg-gray-50'>
      {/* Left side - Image */}
      <div className='hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600'>
        <div className='absolute inset-0 bg-black/10' />
        <div className='relative z-10 m-auto max-w-lg px-8 text-center'>
          <h1 className='text-5xl font-bold mb-6 text-white'>
            Join intelliForm
          </h1>
          <p className='text-xl text-white/90'>
            Create an account and start building amazing forms
          </p>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <Card className='w-full max-w-md p-2 shadow-xl'>
          <CardHeader className='space-y-2'>
            <CardTitle className='text-3xl font-bold text-center'>
              Create your account
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <AuthForm type='signup' />
            <p className='text-center text-sm text-gray-600'>
              Already have an account?{' '}
              <Link
                href='/login'
                className='font-medium text-blue-600 hover:text-blue-500 transition-colors'
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
