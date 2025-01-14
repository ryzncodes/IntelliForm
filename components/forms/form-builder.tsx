'use client';

import {useEffect} from 'react';
import {useForm} from '@/lib/hooks/use-form';
import {Button} from '@/components/ui/button';
import {Section} from './section';
import {NewSection} from '@/lib/types/database';

interface FormBuilderProps {
  formId: string;
}

export function FormBuilder({formId}: FormBuilderProps) {
  const {currentForm, isLoading, error, getForm, updateForm} = useForm();

  useEffect(() => {
    getForm(formId);
  }, [formId, getForm]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!currentForm) {
    return <div>Form not found</div>;
  }

  async function addSection() {
    const newSection: NewSection = {
      title: 'New Section',
      description: '',
      order: currentForm.sections.length,
      form_id: formId,
    };

    await updateForm(formId, {
      sections: [...currentForm.sections, newSection],
    } as any);
  }

  async function updateSection(sectionId: string, data: Partial<NewSection>) {
    const updatedSections = currentForm.sections.map((section) =>
      section.id === sectionId ? {...section, ...data} : section
    );

    await updateForm(formId, {
      sections: updatedSections,
    } as any);
  }

  async function deleteSection(sectionId: string) {
    const updatedSections = currentForm.sections.filter(
      (section) => section.id !== sectionId
    );

    await updateForm(formId, {
      sections: updatedSections,
    } as any);
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
        {currentForm.sections.map((section) => (
          <Section
            key={section.id}
            section={section}
            onUpdate={(data) => updateSection(section.id, data)}
            onDelete={() => deleteSection(section.id)}
          />
        ))}

        <Button onClick={addSection}>Add Section</Button>
      </div>
    </div>
  );
}
