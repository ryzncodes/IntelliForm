import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold'>Welcome to IntelliForm</h2>
        <p className='text-muted-foreground mt-2'>
          Create and manage your dynamic forms
        </p>
      </div>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='p-6'>
          <h3 className='font-semibold mb-2'>Create New Form</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Start building a new dynamic form with AI assistance
          </p>
          <Link href='/forms/new'>
            <Button>Create Form</Button>
          </Link>
        </Card>

        <Card className='p-6'>
          <h3 className='font-semibold mb-2'>My Forms</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            View and manage your existing forms
          </p>
          <Link href='/forms'>
            <Button variant='outline'>View Forms</Button>
          </Link>
        </Card>

        <Card className='p-6'>
          <h3 className='font-semibold mb-2'>Responses</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Check responses to your forms
          </p>
          <Link href='/responses'>
            <Button variant='outline'>View Responses</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
