'use client';

import {useEffect} from 'react';
import Link from 'next/link';
import {useForm} from '@/lib/hooks/use-form';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {MoreVertical, FileEdit, Trash2, BarChart} from 'lucide-react';

export function FormsList() {
  const {forms, isLoading, error, getForms, deleteForm} = useForm();

  useEffect(() => {
    getForms();
  }, [getForms]);

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              <div className='h-3 bg-gray-200 rounded w-1/2'></div>
            </CardHeader>
            <CardContent>
              <div className='h-3 bg-gray-200 rounded w-full mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-4/5'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600'>
        Error: {error.message}
      </div>
    );
  }

  if (!forms?.length) {
    return (
      <Card className='text-center p-6'>
        <CardHeader>
          <CardTitle>No Forms Yet</CardTitle>
          <CardDescription>
            Create your first form to get started
          </CardDescription>
        </CardHeader>
        <CardFooter className='justify-center'>
          <Link href='/forms/new'>
            <Button>Create New Form</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {forms.map((form) => (
        <Card key={form.id}>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='line-clamp-1'>{form.title}</CardTitle>
                <CardDescription className='line-clamp-1'>
                  {form.description || 'No description'}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <MoreVertical className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className='flex items-center'
                    >
                      <FileEdit className='mr-2 h-4 w-4' />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/forms/${form.id}/responses`}
                      className='flex items-center'
                    >
                      <BarChart className='mr-2 h-4 w-4' />
                      View Responses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-red-600 focus:text-red-600'
                    onClick={() => deleteForm(form.id)}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-sm text-muted-foreground'>
              Created {new Date(form.created_at).toLocaleDateString()}
            </div>
            <div className='mt-2 flex items-center gap-2'>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  form.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {form.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link href={`/forms/${form.id}/edit`}>Edit Form</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
