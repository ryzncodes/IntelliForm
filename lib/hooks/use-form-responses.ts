'use client';

import {useState, useCallback, useEffect} from 'react';
import {createClient} from '@/lib/supabase/client';
import type {ResponseWithItems} from '@/lib/types/database';

export function useFormResponses(formId: string) {
  const [responses, setResponses] = useState<ResponseWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchResponses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch responses for the form
      const {data: responsesData, error: responsesError} = await supabase.from('responses').select('*').eq('form_id', formId).order('submitted_at', {ascending: false});

      if (responsesError) throw responsesError;

      // Fetch response items for all responses
      const {data: itemsData, error: itemsError} = await supabase
        .from('response_items')
        .select('*')
        .in(
          'response_id',
          responsesData.map((r) => r.id)
        );

      if (itemsError) throw itemsError;

      // Combine responses with their items
      const responsesWithItems = responsesData.map((response) => ({
        ...response,
        items: itemsData.filter((item) => item.response_id === response.id),
      }));

      setResponses(responsesWithItems);
    } catch (e) {
      console.error('Error fetching responses:', e);
      setError(e instanceof Error ? e : new Error('Failed to fetch responses'));
    } finally {
      setIsLoading(false);
    }
  }, [formId, supabase]);

  // Fetch responses on mount and when formId changes
  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const getResponseAnalytics = useCallback(() => {
    if (!responses.length) return null;

    return {
      totalResponses: responses.length,
      averageResponseTime: calculateAverageResponseTime(responses),
      completionRate: calculateCompletionRate(responses),
      questionAnalytics: calculateQuestionAnalytics(responses),
    };
  }, [responses]);

  return {
    responses,
    isLoading,
    error,
    fetchResponses,
    getResponseAnalytics,
  };
}

// Helper functions for analytics
function calculateAverageResponseTime(responses: ResponseWithItems[]): number {
  if (!responses.length) return 0;

  const totalTime = responses.reduce((sum, response) => {
    const submittedAt = new Date(response.submitted_at);
    const createdAt = new Date(response.created_at);
    return sum + (submittedAt.getTime() - createdAt.getTime());
  }, 0);

  return totalTime / responses.length / 1000; // Convert to seconds
}

function calculateCompletionRate(responses: ResponseWithItems[]): number {
  if (!responses.length) return 0;

  const completedResponses = responses.filter((response) => new Date(response.submitted_at) > new Date(response.created_at));

  return (completedResponses.length / responses.length) * 100;
}

interface QuestionAnalytics {
  [questionId: string]: {
    totalAnswers: number;
    answerDistribution: {[value: string]: number};
  };
}

function calculateQuestionAnalytics(responses: ResponseWithItems[]): QuestionAnalytics {
  const analytics: QuestionAnalytics = {};

  responses.forEach((response) => {
    response.items.forEach((item) => {
      if (!analytics[item.question_id]) {
        analytics[item.question_id] = {
          totalAnswers: 0,
          answerDistribution: {},
        };
      }

      analytics[item.question_id].totalAnswers++;

      const value = JSON.stringify(item.value);
      analytics[item.question_id].answerDistribution[value] = (analytics[item.question_id].answerDistribution[value] || 0) + 1;
    });
  });

  return analytics;
}
