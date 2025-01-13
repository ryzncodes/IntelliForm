'use client';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export function AuthForm({type}: AuthFormProps) {
  return (
    <form className='mt-8 space-y-6'>
      {/* Form fields will go here */}
      <button
        type='submit'
        className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      >
        {type === 'login' ? 'Sign in' : 'Sign up'}
      </button>
    </form>
  );
}
