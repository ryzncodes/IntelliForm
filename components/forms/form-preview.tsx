'use client';

import {FormResponse} from '@/components/forms/form-response';
import type {FormWithSections} from '@/lib/types/database';

interface FormPreviewProps {
  form: FormWithSections;
}

export function FormPreview({form}: FormPreviewProps) {
  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium'>Preview Mode</div>
        </div>
      </div>
      <FormResponse form={form} />
    </div>
  );
}
