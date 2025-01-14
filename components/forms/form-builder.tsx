'use client';

import {useEffect, useCallback, useState} from 'react';
import {useForm} from '@/lib/hooks/use-form';
import {Button} from '@/components/ui/button';
import {Section} from './section';
import type {
  Section as SectionType,
  FormWithSections,
  LocalSection,
} from '@/lib/types/database';

interface FormBuilderProps {
  formId: string;
}

export function FormBuilder({formId}: FormBuilderProps) {
  const {
    currentForm: initialForm,
    isLoading,
    error,
    getForm,
    updateForm,
    createSection,
    updateSection,
    deleteSection,
  } = useForm();

  // Local state for form data
  const [localForm, setLocalForm] = useState<FormWithSections | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchForm = useCallback(async () => {
    const form = await getForm(formId);
    if (form) {
      setLocalForm(form);
    }
  }, [formId, getForm]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  useEffect(() => {
    if (initialForm) {
      setLocalForm(initialForm);
    }
  }, [initialForm]);

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

  if (!localForm) {
    return <div>Form not found</div>;
  }

  async function handleSave() {
    if (!localForm) return;

    setIsSaving(true);
    try {
      // Save all sections
      for (const section of localForm.sections) {
        await updateSection(section.id, {
          title: section.title,
          description: section.description,
          order: section.order,
        });
      }
      await updateForm(formId, {
        title: localForm.title,
        description: localForm.description,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddSection() {
    if (!localForm) return;

    const newSection: LocalSection = {
      id: crypto.randomUUID(), // Temporary ID for local state
      title: 'New Section',
      description: '',
      order: localForm.sections.length,
      form_id: formId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [],
    };

    setLocalForm({
      ...localForm,
      sections: [...localForm.sections, newSection],
    });

    // Create in database
    await createSection({
      title: newSection.title,
      description: newSection.description,
      order: newSection.order,
      form_id: formId,
    });

    // Refresh to get real IDs
    await fetchForm();
  }

  function handleUpdateSection(sectionId: string, data: Partial<SectionType>) {
    if (!localForm) return;

    setLocalForm({
      ...localForm,
      sections: localForm.sections.map((section) =>
        section.id === sectionId ? {...section, ...data} : section
      ),
    });
  }

  async function handleDeleteSection(sectionId: string) {
    if (!localForm) return;

    setLocalForm({
      ...localForm,
      sections: localForm.sections.filter(
        (section) => section.id !== sectionId
      ),
    });
    await deleteSection(sectionId);
  }

  async function handlePublish() {
    if (!localForm) return;

    await handleSave();
    await updateForm(formId, {is_published: !localForm.is_published});
    await fetchForm();
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>{localForm.title}</h1>
          <p className='text-muted-foreground'>{localForm.description}</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={handlePublish}>
            {localForm.is_published ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className='space-y-4'>
        {localForm.sections.map((section) => (
          <Section
            key={section.id}
            section={section}
            onUpdate={handleUpdateSection.bind(null, section.id)}
            onDelete={() => handleDeleteSection(section.id)}
            setLocalForm={setLocalForm}
          />
        ))}

        <Button onClick={handleAddSection}>Add Section</Button>
      </div>
    </div>
  );
}
