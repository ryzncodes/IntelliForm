'use client';

import {useCallback, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Form, NewForm, Section, Question, Json} from '@/lib/types/database';
import * as actions from '@/lib/actions/forms';

interface UseFormReturn {
  forms: Form[] | null;
  currentForm:
    | (Form & {sections: (Section & {questions: Question[]})[]})
    | null;
  isLoading: boolean;
  error: Error | null;
  createForm: (form: NewForm) => Promise<void>;
  updateForm: (id: string, form: Partial<Form>) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  getForm: (id: string) => Promise<void>;
  getForms: () => Promise<void>;
  submitFormResponse: (
    formId: string,
    answers: {questionId: string; value: Json}[]
  ) => Promise<void>;
}

export function useForm(): UseFormReturn {
  const router = useRouter();
  const [forms, setForms] = useState<Form[] | null>(null);
  const [currentForm, setCurrentForm] = useState<
    (Form & {sections: (Section & {questions: Question[]})[]}) | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getForms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const forms = await actions.getForms();
      setForms(forms);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch forms'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getForm = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const form = await actions.getForm(id);
      setCurrentForm(form);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch form'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createForm = useCallback(
    async (form: NewForm) => {
      try {
        setIsLoading(true);
        setError(null);
        const newForm = await actions.createForm(form);
        router.push(`/forms/${newForm.id}`);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to create form')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const updateForm = useCallback(
    async (id: string, form: Partial<Form>) => {
      try {
        setIsLoading(true);
        setError(null);
        await actions.updateForm(id, form);
        await getForm(id);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to update form')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [getForm]
  );

  const deleteForm = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await actions.deleteForm(id);
        router.push('/forms');
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to delete form')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const submitFormResponse = useCallback(
    async (formId: string, answers: {questionId: string; value: Json}[]) => {
      try {
        setIsLoading(true);
        setError(null);
        await actions.submitFormResponse(formId, answers);
        router.push(`/forms/${formId}/thank-you`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to submit form response')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return {
    forms,
    currentForm,
    isLoading,
    error,
    createForm,
    updateForm,
    deleteForm,
    getForm,
    getForms,
    submitFormResponse,
  };
}
