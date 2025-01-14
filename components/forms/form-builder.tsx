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
    createQuestion,
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
      // Create or update all sections and their questions
      for (const section of localForm.sections) {
        if (section.id.startsWith('temp_')) {
          // This is a new section that needs to be created
          await createSection({
            title: section.title,
            description: section.description,
            order: section.order,
            form_id: formId,
          });

          // Get the updated form to get the new section's real ID
          const updatedForm = await getForm(formId);
          if (!updatedForm) throw new Error('Failed to get updated form');

          // Find the newly created section
          const newSection = updatedForm.sections.find(
            (s: LocalSection) =>
              s.title === section.title && s.order === section.order
          );
          if (!newSection) throw new Error('Failed to find new section');

          // Create all questions for this new section
          for (const question of section.questions) {
            await createQuestion({
              section_id: newSection.id,
              title: question.title,
              description: question.description,
              type: question.type,
              required: question.required,
              order: question.order,
              options: question.options,
              validation: question.validation,
              logic: question.logic,
            });
          }
        } else {
          // This is an existing section that needs to be updated
          await updateSection(section.id, {
            title: section.title,
            description: section.description,
            order: section.order,
          });

          // Create any new questions for this existing section
          for (const question of section.questions) {
            if (question.id.startsWith('temp_')) {
              await createQuestion({
                section_id: section.id,
                title: question.title,
                description: question.description,
                type: question.type,
                required: question.required,
                order: question.order,
                options: question.options,
                validation: question.validation,
                logic: question.logic,
              });
            }
          }
        }
      }

      await updateForm(formId, {
        title: localForm.title,
        description: localForm.description,
      });

      // Refresh to get real IDs
      await fetchForm();
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddSection() {
    if (!localForm) return;

    const newSection: LocalSection = {
      id: `temp_${crypto.randomUUID()}`, // Temporary ID for local state
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

    // If it's not a temporary section, delete it from the database
    if (!sectionId.startsWith('temp_')) {
      await deleteSection(sectionId);
    }
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
