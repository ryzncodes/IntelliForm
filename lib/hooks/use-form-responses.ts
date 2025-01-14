'use client';

import {useCallback, useState} from 'react';
import {Response, Answer, Question, Json} from '@/lib/types/database';
import * as actions from '@/lib/actions/forms';

interface UseFormResponsesReturn {
  responses: (Response & {answers: (Answer & {question: Question})[]})[] | null;
  isLoading: boolean;
  error: Error | null;
  getResponses: (formId: string) => Promise<void>;
  submitResponse: (
    formId: string,
    answers: {questionId: string; value: Json}[]
  ) => Promise<void>;
}

export function useFormResponses(): UseFormResponsesReturn {
  const [responses, setResponses] = useState<
    (Response & {answers: (Answer & {question: Question})[]})[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getResponses = useCallback(async (formId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const responses = await actions.getFormResponses(formId);
      setResponses(responses);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch responses')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitResponse = useCallback(
    async (formId: string, answers: {questionId: string; value: Json}[]) => {
      try {
        setIsLoading(true);
        setError(null);
        await actions.submitFormResponse(formId, answers);
        await getResponses(formId);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to submit response')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [getResponses]
  );

  return {
    responses,
    isLoading,
    error,
    getResponses,
    submitResponse,
  };
}
