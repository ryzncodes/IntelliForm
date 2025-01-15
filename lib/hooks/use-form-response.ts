'use client';

import {useState, useCallback} from 'react';
import {createClient} from '@/lib/supabase/client';
import type {Question, QuestionValue} from '@/lib/types/database';

interface FormResponse {
  [questionId: string]: QuestionValue;
}

interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'email' | 'options';
  value: string | number | string[];
  message: string;
}

export function useFormResponse(formId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const submitResponse = useCallback(
    async (responses: FormResponse) => {
      try {
        setIsSubmitting(true);
        setError(null);

        // Create the response record
        const {data: responseData, error: responseError} = await supabase
          .from('responses')
          .insert({
            form_id: formId,
          })
          .select()
          .single();

        if (responseError) throw responseError;

        // Create response items for each question
        const responseItems = Object.entries(responses).map(([questionId, value]) => ({
          response_id: responseData.id,
          question_id: questionId,
          value,
        }));

        const {error: itemsError} = await supabase.from('response_items').insert(responseItems);

        if (itemsError) throw itemsError;

        return responseData;
      } catch (e) {
        console.error('Error submitting form response:', e);
        setError(e instanceof Error ? e : new Error('Failed to submit response'));
        throw e;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formId, supabase]
  );

  const validateResponse = useCallback((question: Question, value: QuestionValue): string | null => {
    // Required field validation
    if (question.required && !value) {
      return 'This field is required';
    }

    // Custom validation if specified
    if (question.validation) {
      const validation = question.validation as unknown as ValidationRule;

      switch (validation.type) {
        case 'min':
          if (typeof value === 'string' && value.length < Number(validation.value)) {
            return validation.message;
          }
          if (typeof value === 'number' && value < Number(validation.value)) {
            return validation.message;
          }
          break;

        case 'max':
          if (typeof value === 'string' && value.length > Number(validation.value)) {
            return validation.message;
          }
          if (typeof value === 'number' && value > Number(validation.value)) {
            return validation.message;
          }
          break;

        case 'pattern':
          if (typeof value === 'string' && typeof validation.value === 'string' && !new RegExp(validation.value).test(value)) {
            return validation.message;
          }
          break;

        case 'email':
          if (typeof value === 'string' && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
            return validation.message;
          }
          break;

        case 'options':
          if (Array.isArray(validation.value)) {
            const options = validation.value;
            if (Array.isArray(value)) {
              // For multiple choice questions
              if (!value.every((v) => typeof v === 'string' && options.includes(v))) {
                return validation.message;
              }
            } else if (typeof value === 'string') {
              // For single choice questions
              if (!options.includes(value)) {
                return validation.message;
              }
            }
          }
          break;
      }
    }

    // Type-specific validation
    switch (question.type) {
      case 'email':
        if (typeof value === 'string' && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (typeof value === 'string' && !/^\+?[\d\s-]{10,}$/.test(value)) {
          return 'Please enter a valid phone number';
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return 'Please enter a valid number';
        }
        break;

      case 'date':
        if (typeof value === 'string' && isNaN(Date.parse(value))) {
          return 'Please enter a valid date';
        }
        break;
    }

    return null;
  }, []);

  const validateAllResponses = useCallback(
    (questions: Question[], responses: FormResponse): string[] => {
      const errors: string[] = [];

      questions.forEach((question) => {
        const value = responses[question.id];
        const error = validateResponse(question, value);
        if (error) {
          errors.push(`${question.title}: ${error}`);
        }
      });

      return errors;
    },
    [validateResponse]
  );

  return {
    submitResponse,
    validateResponse,
    validateAllResponses,
    isSubmitting,
    error,
  };
}
