'use client';

import {useForm} from '@/lib/hooks/use-form';
import {FormPreview} from '@/components/forms/form-preview';

interface FormPreviewClientProps {
  id: string;
}

export function FormPreviewClient({id}: FormPreviewClientProps) {
  const {currentForm: form, isLoading, error} = useForm(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600'>
        Error: {error.message}
      </div>
    );
  }

  if (!form) {
    return <div>Form not found</div>;
  }

  return (
    <div className='container max-w-3xl py-8'>
      <FormPreview form={form} />
    </div>
  );
}
