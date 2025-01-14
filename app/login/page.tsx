import Link from 'next/link';
import {AuthForm} from '@/components/auth/auth-form';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {BackgroundGradientAnimation} from '@/components/ui/background-gradient-animation';
import {AnimatedGridPattern} from '@/components/ui/animated-grid-pattern';
import {BlurFade} from '@/components/ui/blur-fade';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: {verified?: string};
}) {
  return (
    <div className='min-h-screen flex bg-gray-50'>
      {/* Left side - Animated Gradient */}
      <div className='hidden lg:flex lg:w-1/2 relative overflow-hidden'>
        <BackgroundGradientAnimation
          gradientBackgroundStart='rgb(0, 34, 102)'
          gradientBackgroundEnd='rgb(0, 8, 40)'
          firstColor='0, 48, 130'
          secondColor='0, 84, 166'
          thirdColor='0, 119, 204'
          fourthColor='25, 50, 110'
          fifthColor='10, 30, 90'
          pointerColor='0, 65, 155'
          containerClassName='!h-full !w-full'
        >
          <div className='absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-center'>
            <div>
              <BlurFade delay={0.2}>
                <h1 className='text-5xl font-bold mb-6 bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20'>
                  Welcome back to intelliForm
                </h1>
              </BlurFade>
              <BlurFade delay={0.4}>
                <p className='text-xl text-white/90'>
                  Sign in to continue building amazing forms
                </p>
              </BlurFade>
            </div>
          </div>
        </BackgroundGradientAnimation>
      </div>

      {/* Right side - Login Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8 relative'>
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.035}
          duration={3}
          className='[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]'
        />
        <Card className='w-full max-w-md p-2 shadow-xl relative z-10 bg-white/70'>
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
