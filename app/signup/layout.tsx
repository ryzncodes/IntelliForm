export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 pl-0 pr-4 sm:pr-6 lg:pr-8'>
      <div className='w-full space-y-8'>{children}</div>
    </div>
  );
}
