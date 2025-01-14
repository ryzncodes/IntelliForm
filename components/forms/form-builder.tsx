'use client';

import {useEffect, useCallback, useState} from 'react';
import {useForm} from '@/lib/hooks/use-form';
import {Button} from '@/components/ui/button';
import {Section} from './section';
import {useRouter} from 'next/navigation';
import {UnsavedChangesModal} from '@/components/ui/unsaved-changes-modal';
import type {
  Section as SectionType,
  FormWithSections,
  LocalSection,
} from '@/lib/types/database';

interface FormBuilderProps {
  formId: string;
}

export function FormBuilder({formId}: FormBuilderProps) {
  const router = useRouter();
  const {
    currentForm: initialForm,
    isLoading,
    error,
    getForm,
    updateForm,
    deleteSection,
    createSection,
    updateSection,
    createQuestion,
    publishForm,
  } = useForm();

  // Local state for form data
  const [localForm, setLocalForm] = useState<FormWithSections | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    'preview' | 'publish' | null
  >(null);

  const fetchForm = useCallback(async () => {
    const form = await getForm(formId);
    if (form) {
      setLocalForm(form);
      setHasUnsavedChanges(false);
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

  // Update hasUnsavedChanges when localForm changes
  useEffect(() => {
    if (initialForm && localForm) {
      const hasChanges =
        JSON.stringify(initialForm) !== JSON.stringify(localForm);
      setHasUnsavedChanges(hasChanges);
    }
  }, [initialForm, localForm]);

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

    try {
      setIsSaving(true);

      // Group sections by whether they're new or existing
      const newSections = localForm.sections.filter((s) =>
        s.id.startsWith('temp_')
      );
      const existingSections = localForm.sections.filter(
        (s) => !s.id.startsWith('temp_')
      );

      // Create all new sections in parallel
      const newSectionPromises = newSections.map((section) =>
        createSection({
          title: section.title,
          description: section.description,
          order: section.order,
          form_id: formId,
        })
      );
      await Promise.all(newSectionPromises);

      // Get updated form to get new section IDs
      const updatedForm = await getForm(formId);
      if (!updatedForm) throw new Error('Failed to get updated form');

      // Map temporary IDs to real IDs for new sections
      const tempToRealIds = new Map();
      newSections.forEach((tempSection) => {
        const realSection = updatedForm.sections.find(
          (s: SectionType) =>
            s.title === tempSection.title && s.order === tempSection.order
        );
        if (realSection) {
          tempToRealIds.set(tempSection.id, realSection.id);
        }
      });

      // Create all questions for new sections in parallel
      const newQuestionPromises = newSections.flatMap((section) => {
        const realSectionId = tempToRealIds.get(section.id);
        if (!realSectionId) return [];

        return section.questions.map((question) =>
          createQuestion({
            section_id: realSectionId,
            title: question.title,
            description: question.description,
            type: question.type,
            required: question.required,
            order: question.order,
            options: question.options,
            validation: question.validation,
            logic: question.logic,
          })
        );
      });

      // Update existing sections in parallel
      const updateSectionPromises = existingSections.map((section) =>
        updateSection(section.id, {
          title: section.title,
          description: section.description,
          order: section.order,
        })
      );

      // Create new questions for existing sections in parallel
      const newQuestionsForExistingSectionsPromises = existingSections.flatMap(
        (section) =>
          section.questions
            .filter((q) => q.id.startsWith('temp_'))
            .map((question) =>
              createQuestion({
                section_id: section.id,
                title: question.title,
                description: question.description,
                type: question.type,
                required: question.required,
                order: question.order,
                options: question.options,
                validation: question.validation,
                logic: question.logic,
              })
            )
      );

      // Execute all remaining operations in parallel
      await Promise.all([
        ...newQuestionPromises,
        ...updateSectionPromises,
        ...newQuestionsForExistingSectionsPromises,
        updateForm(formId, {
          title: localForm.title,
          description: localForm.description,
        }),
      ]);

      // Refresh to get final state
      await fetchForm();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePreview() {
    if (hasUnsavedChanges) {
      setPendingAction('preview');
      setShowUnsavedModal(true);
    } else {
      router.push(`/forms/${formId}/preview`);
    }
  }

  async function handlePublish() {
    if (hasUnsavedChanges) {
      setPendingAction('publish');
      setShowUnsavedModal(true);
    } else {
      await handlePublishAction();
    }
  }

  async function handlePublishAction() {
    if (!localForm) return;

    try {
      setIsPublishing(true);
      await publishForm(formId);
      router.push('/dashboard/forms');
    } catch (error) {
      console.error('Error publishing form:', error);
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleSaveAndContinue() {
    await handleSave();
    if (pendingAction === 'preview') {
      router.push(`/forms/${formId}/preview`);
    } else if (pendingAction === 'publish') {
      await handlePublishAction();
    }
    setShowUnsavedModal(false);
    setPendingAction(null);
  }

  function handleAddSection() {
    if (!localForm) return;

    const newSection: LocalSection = {
      id: `temp_${crypto.randomUUID()}`,
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
    setHasUnsavedChanges(true);
  }

  function handleUpdateSection(sectionId: string, data: Partial<SectionType>) {
    if (!localForm) return;

    setLocalForm({
      ...localForm,
      sections: localForm.sections.map((section) =>
        section.id === sectionId ? {...section, ...data} : section
      ),
    });
    setHasUnsavedChanges(true);
  }

  async function handleDeleteSection(sectionId: string) {
    if (!localForm) return;

    setLocalForm({
      ...localForm,
      sections: localForm.sections.filter(
        (section) => section.id !== sectionId
      ),
    });
    setHasUnsavedChanges(true);

    // If it's not a temporary section, delete it from the database
    if (!sectionId.startsWith('temp_')) {
      await deleteSection(sectionId);
    }
  }

  return (
    <>
      <div className='space-y-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>{localForm.title}</h1>
            <p className='text-muted-foreground'>{localForm.description}</p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handlePreview}
              disabled={isSaving || isPublishing}
            >
              Preview
            </Button>
            <Button
              variant='outline'
              onClick={handleSave}
              disabled={isSaving || isPublishing || !hasUnsavedChanges}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handlePublish} disabled={isSaving || isPublishing}>
              {isPublishing ? 'Publishing...' : 'Publish'}
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

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => {
          setShowUnsavedModal(false);
          setPendingAction(null);
        }}
        onContinueEditing={() => {
          setShowUnsavedModal(false);
          setPendingAction(null);
        }}
        onSaveAndContinue={handleSaveAndContinue}
        action={pendingAction || 'preview'}
      />
    </>
  );
}
