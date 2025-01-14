'use client';

import {useEffect} from 'react';
import {useForm} from '@/lib/hooks/use-form';
import {Button} from '@/components/ui/button';
import {Section} from './section';
import {
  NewSection,
  UpdateForm,
  Section as SectionType,
} from '@/lib/types/database';

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
    if (!currentForm) return;

    const newSection: NewSection = {
      title: 'New Section',
      description: '',
      order: currentForm.sections.length,
      form_id: formId,
    };

    const update: UpdateForm = {
      sections: [...currentForm.sections, newSection],
    };

    await updateForm(formId, update);
  }

  async function updateSection(sectionId: string, data: Partial<NewSection>) {
    if (!currentForm) return;

    const updatedSections = currentForm.sections.map((section: SectionType) =>
      section.id === sectionId ? {...section, ...data} : section
    );

    const update: UpdateForm = {
      sections: updatedSections,
    };

    await updateForm(formId, update);
  }

  async function deleteSection(sectionId: string) {
    if (!currentForm) return;

    const updatedSections = currentForm.sections.filter(
      (section: SectionType) => section.id !== sectionId
    );

    const update: UpdateForm = {
      sections: updatedSections,
    };

    await updateForm(formId, update);
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
            onUpdate={(data: Partial<NewSection>) =>
              updateSection(section.id, data)
            }
            onDelete={() => deleteSection(section.id)}
          />
        ))}

        <Button onClick={addSection}>Add Section</Button>
      </div>
    </div>
  );
}
