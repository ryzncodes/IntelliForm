'use client';

export function Navbar() {
  return (
    <nav className='bg-white shadow'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex justify-between items-center'>
          <div className='text-xl font-bold'>intelliForm</div>
          <div>{/* Navigation links will go here */}</div>
        </div>
      </div>
    </nav>
  );
}
