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

        const {data, error: fetchError} = await supabase
          .from('forms')
          .select('*, sections(*, questions(*))')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setCurrentForm(data);
        return data;
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

        // Refresh the form data after update
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

  return {
    forms,
    currentForm,
    createForm,
    updateForm,
    deleteForm,
    publishForm,
    unpublishForm,
    getForms,
    getForm,
    isLoading,
    error,
  };
}
