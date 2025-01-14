'use client';

import {useRouter} from 'next/navigation';
import {useState, useCallback} from 'react';
import {createClient} from '@/lib/supabase/client';
import {
  Form,
  NewForm,
  UpdateForm,
  Section,
  Question,
  NewSection,
  NewQuestion,
} from '@/lib/types/database';

type FormWithSections = Form & {
  sections: (Section & {questions: Question[]})[];
};

export function useForm() {
  const [forms, setForms] = useState<Form[] | null>(null);
  const [currentForm, setCurrentForm] = useState<FormWithSections | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const getForms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {data, error: fetchError} = await supabase
        .from('forms')
        .select('*')
        .order('created_at', {ascending: false});

      if (fetchError) throw fetchError;
      setForms(data);
    } catch (e) {
      console.error('Error fetching forms:', e);
      setError(e instanceof Error ? e : new Error('Failed to fetch forms'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const getForm = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // First get the form
        const {data: formData, error: formError} = await supabase
          .from('forms')
          .select('*')
          .eq('id', id)
          .single();

        if (formError) throw formError;

        // Then get the sections with proper ordering
        const {data: sections, error: sectionsError} = await supabase
          .from('sections')
          .select('*')
          .eq('form_id', id)
          .order('order', {ascending: true});

        if (sectionsError) throw sectionsError;

        // Then get the questions for each section
        const sectionsWithQuestions = await Promise.all(
          (sections || []).map(async (section: Section) => {
            const {data: questions, error: questionsError} = await supabase
              .from('questions')
              .select('*')
              .eq('section_id', section.id)
              .order('order', {ascending: true});

            if (questionsError) throw questionsError;

            return {
              ...section,
              questions: questions || [],
            };
          })
        );

        const fullForm = {
          ...formData,
          sections: sectionsWithQuestions,
        };

        setCurrentForm(fullForm);
        return fullForm;
      } catch (e) {
        console.error('Error fetching form:', e);
        setError(e instanceof Error ? e : new Error('Failed to fetch form'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  const createForm = useCallback(
    async (form: NewForm) => {
      try {
        setIsLoading(true);
        setError(null);

        const {data, error: createError} = await supabase
          .from('forms')
          .insert(form)
          .select()
          .single();

        if (createError) throw createError;

        router.push(`/forms/${data.id}/edit`);
        router.refresh();
      } catch (e) {
        console.error('Error creating form:', e);
        setError(e instanceof Error ? e : new Error('Failed to create form'));
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router]
  );

  const updateForm = useCallback(
    async (id: string, updates: Partial<UpdateForm>) => {
      try {
        setIsLoading(true);
        setError(null);

        const {error: updateError} = await supabase
          .from('forms')
          .update(updates)
          .eq('id', id);

        if (updateError) throw updateError;

        await getForm(id);
        router.refresh();
      } catch (e) {
        console.error('Error updating form:', e);
        setError(e instanceof Error ? e : new Error('Failed to update form'));
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router, getForm]
  );

  const createSection = useCallback(
    async (section: NewSection) => {
      try {
        setIsLoading(true);
        setError(null);

        const {error: createError} = await supabase
          .from('sections')
          .insert(section);

        if (createError) throw createError;

        await getForm(section.form_id);
      } catch (e) {
        console.error('Error creating section:', e);
        setError(
          e instanceof Error ? e : new Error('Failed to create section')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, getForm]
  );

  const updateSection = useCallback(
    async (id: string, updates: Partial<Section>) => {
      try {
        setIsLoading(true);
        setError(null);

        const {error: updateError} = await supabase
          .from('sections')
          .update(updates)
          .eq('id', id);

        if (updateError) throw updateError;

        if (currentForm) {
          await getForm(currentForm.id);
        }
      } catch (e) {
        console.error('Error updating section:', e);
        setError(
          e instanceof Error ? e : new Error('Failed to update section')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, getForm, currentForm]
  );

  const deleteSection = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const {error: deleteError} = await supabase
          .from('sections')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        if (currentForm) {
          await getForm(currentForm.id);
        }
      } catch (e) {
        console.error('Error deleting section:', e);
        setError(
          e instanceof Error ? e : new Error('Failed to delete section')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, getForm, currentForm]
  );

  const deleteForm = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const {error: deleteError} = await supabase
          .from('forms')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        router.refresh();
      } catch (e) {
        console.error('Error deleting form:', e);
        setError(e instanceof Error ? e : new Error('Failed to delete form'));
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router]
  );

  const publishForm = useCallback(
    async (id: string) => {
      return updateForm(id, {is_published: true});
    },
    [updateForm]
  );

  const unpublishForm = useCallback(
    async (id: string) => {
      return updateForm(id, {is_published: false});
    },
    [updateForm]
  );

  const createQuestion = useCallback(
    async (question: NewQuestion) => {
      try {
        setIsLoading(true);
        setError(null);

        const {error: createError} = await supabase
          .from('questions')
          .insert(question);

        if (createError) throw createError;

        if (currentForm) {
          await getForm(currentForm.id);
        }
      } catch (e) {
        console.error('Error creating question:', e);
        setError(
          e instanceof Error ? e : new Error('Failed to create question')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, getForm, currentForm]
  );

  const updateQuestion = useCallback(
    async (id: string, updates: Partial<Question>) => {
      try {
        setIsLoading(true);
        setError(null);

        const {error: updateError} = await supabase
          .from('questions')
          .update(updates)
          .eq('id', id);

        if (updateError) throw updateError;

        if (currentForm) {
          await getForm(currentForm.id);
        }
      } catch (e) {
        console.error('Error updating question:', e);
        setError(
          e instanceof Error ? e : new Error('Failed to update question')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, getForm, currentForm]
  );

  const deleteQuestion = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const {error: deleteError} = await supabase
          .from('questions')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        if (currentForm) {
          await getForm(currentForm.id);
        }
      } catch (e) {
        console.error('Error deleting question:', e);
        setError(
          e instanceof Error ? e : new Error('Failed to delete question')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, getForm, currentForm]
  );

  return {
    forms,
    currentForm,
    createForm,
    updateForm,
    deleteForm,
    publishForm,
    unpublishForm,
    createSection,
    updateSection,
    deleteSection,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getForms,
    getForm,
    isLoading,
    error,
  };
}
