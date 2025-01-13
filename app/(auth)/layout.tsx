export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-8'>{children}</div>
    </div>
  );
}
