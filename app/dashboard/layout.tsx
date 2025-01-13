'use client';

import {useAuth} from '@/lib/hooks/use-auth';
import {Button} from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {signOut, isLoading} = useAuth();

  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white shadow'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-xl font-semibold'>IntelliForm</h1>
            <div className='flex items-center gap-4'>
              <Button variant='outline' onClick={signOut} disabled={isLoading}>
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className='container mx-auto px-4 py-8'>{children}</main>
    </div>
  );
}
