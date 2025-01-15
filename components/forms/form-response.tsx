'use client';

import {useState, useCallback} from 'react';
import {useFormResponse} from '@/lib/hooks/use-form-response';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Label} from '@/components/ui/label';
import type {FormWithSections, Question, QuestionValue} from '@/lib/types/database';

interface QuestionOptions {
  choices?: string[];
}

interface FormResponseProps {
  form: FormWithSections;
  onSubmitSuccess?: () => void;
}

export function FormResponse({form, onSubmitSuccess}: FormResponseProps) {
  const {submitResponse, validateResponse, isSubmitting, error} = useFormResponse(form.id);
  const [responses, setResponses] = useState<{[key: string]: QuestionValue}>({});
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleInputChange = useCallback(
    (question: Question, value: QuestionValue) => {
      setResponses((prev) => ({...prev, [question.id]: value}));

      // Clear validation error when user starts typing
      const error = validateResponse(question, value);
      setValidationErrors((prev) => ({
        ...prev,
        [question.id]: error || '',
      }));
    },
    [validateResponse]
  );

  const handleSubmit = async () => {
    // Validate all responses
    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    form.sections.forEach((section) => {
      section.questions.forEach((question) => {
        const value = responses[question.id];
        const error = validateResponse(question, value);
        if (error) {
          errors[question.id] = error;
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    try {
      await submitResponse(responses);
      onSubmitSuccess?.();
    } catch (error) {
      // Error is handled by the hook and available in the error state
      console.error('Failed to submit form:', error);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const value = responses[question.id] || '';
    const error = validationErrors[question.id];
    const options = (question.options as QuestionOptions)?.choices || [];

    switch (question.type) {
      case 'short_text':
        return (
          <Input
            value={value as string}
            onChange={(e) => handleInputChange(question, e.target.value)}
            placeholder='Your answer'
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'long_text':
        return (
          <Textarea
            value={value as string}
            onChange={(e) => handleInputChange(question, e.target.value)}
            placeholder='Your answer'
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'single_choice':
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(value) => handleInputChange(question, value)}
          >
            {options.map((option: string) => (
              <div
                key={option}
                className='flex items-center space-x-2'
              >
                <RadioGroupItem
                  value={option}
                  id={`${question.id}-${option}`}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_choice':
        const selectedOptions = (value as string[]) || [];
        return (
          <div className='space-y-2'>
            {options.map((option: string) => (
              <div
                key={option}
                className='flex items-center space-x-2'
              >
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValue = checked ? [...selectedOptions, option] : selectedOptions.filter((o) => o !== option);
                    handleInputChange(question, newValue);
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'email':
        return (
          <Input
            type='email'
            value={value as string}
            onChange={(e) => handleInputChange(question, e.target.value)}
            placeholder='your@email.com'
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'number':
        return (
          <Input
            type='number'
            value={value as number}
            onChange={(e) => handleInputChange(question, parseFloat(e.target.value))}
            placeholder='0'
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'date':
        return (
          <Input
            type='date'
            value={value as string}
            onChange={(e) => handleInputChange(question, e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'time':
        return (
          <Input
            type='time'
            value={value as string}
            onChange={(e) => handleInputChange(question, e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className='space-y-8'>
      <div className='space-y-4'>
        <h1 className='text-2xl font-bold'>{form.title}</h1>
        {form.description && <p className='text-muted-foreground'>{form.description}</p>}
      </div>

      {form.sections.map((section) => (
        <div
          key={section.id}
          className='space-y-6'
        >
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold'>{section.title}</h2>
            {section.description && <p className='text-muted-foreground'>{section.description}</p>}
          </div>

          <div className='space-y-4'>
            {section.questions.map((question) => (
              <div
                key={question.id}
                className='space-y-2'
              >
                <Label>
                  {question.title}
                  {question.required && <span className='text-red-500 ml-1'>*</span>}
                </Label>
                {question.description && <p className='text-sm text-muted-foreground'>{question.description}</p>}
                {renderQuestionInput(question)}
                {validationErrors[question.id] && <p className='text-sm text-red-500'>{validationErrors[question.id]}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {error && <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600'>Error: {error.message}</div>}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </div>
  );
}
