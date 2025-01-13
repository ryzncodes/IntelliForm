export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white shadow'>
        <div className='container mx-auto px-4'>
          {/* Navigation will go here */}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
