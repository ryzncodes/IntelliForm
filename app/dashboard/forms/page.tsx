import Link from 'next/link';
import {FormsList} from '@/components/forms/forms-list';
import {Button} from '@/components/ui/button';
import {PlusCircle} from 'lucide-react';

export default function FormsPage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold'>My Forms</h1>
        <Button asChild>
          <Link href='/dashboard/forms/new' className='flex items-center gap-2'>
            <PlusCircle className='h-5 w-5' />
            Create New Form
          </Link>
        </Button>
      </div>

      <FormsList />
    </div>
  );
}
