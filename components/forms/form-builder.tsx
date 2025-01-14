'use client';

import {useEffect, useCallback} from 'react';
import {useForm} from '@/lib/hooks/use-form';
import {Button} from '@/components/ui/button';
import {Section} from './section';
import {NewSection, Section as SectionType} from '@/lib/types/database';

interface FormBuilderProps {
  formId: string;
}

export function FormBuilder({formId}: FormBuilderProps) {
  const {
    currentForm,
    isLoading,
    error,
    getForm,
    updateForm,
    createSection,
    updateSection,
    deleteSection,
  } = useForm();

  const fetchForm = useCallback(async () => {
    await getForm(formId);
  }, [formId, getForm]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

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

  if (!currentForm) {
    return <div>Form not found</div>;
  }

  async function handleAddSection() {
    if (!currentForm) return;

    const newSection: NewSection = {
      title: 'New Section',
      description: '',
      order: currentForm.sections.length,
      form_id: formId,
    };

    await createSection(newSection);
  }

  async function handleUpdateSection(
    sectionId: string,
    data: Partial<SectionType>
  ) {
    await updateSection(sectionId, data);
  }

  async function handleDeleteSection(sectionId: string) {
    await deleteSection(sectionId);
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>{currentForm.title}</h1>
          <p className='text-muted-foreground'>{currentForm.description}</p>
        </div>
        <Button
          onClick={() =>
            updateForm(formId, {is_published: !currentForm.is_published})
          }
        >
          {currentForm.is_published ? 'Unpublish' : 'Publish'}
        </Button>
      </div>

      <div className='space-y-4'>
        {currentForm.sections.map((section: SectionType) => (
          <Section
            key={section.id}
            section={section}
            onUpdate={handleUpdateSection.bind(null, section.id)}
            onDelete={() => handleDeleteSection(section.id)}
          />
        ))}

        <Button onClick={handleAddSection}>Add Section</Button>
      </div>
    </div>
  );
}
