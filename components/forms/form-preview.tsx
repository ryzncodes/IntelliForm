'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import type {FormWithSections, Question} from '@/lib/types/database';

interface FormPreviewProps {
  form: FormWithSections;
}

export function FormPreview({form}: FormPreviewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({...prev, [questionId]: value}));
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'short_text':
        return (
          <Input
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder='Your answer'
            required={question.required}
          />
        );
      case 'long_text':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder='Your answer'
            required={question.required}
          />
        );
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form answers:', answers);
  };

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold'>{form.title}</h1>
        {form.description && (
          <p className='mt-2 text-muted-foreground'>{form.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className='space-y-8'>
        {form.sections.map((section) => (
          <div
            key={section.id}
            className='space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm'
          >
            <div>
              <h2 className='text-lg font-semibold'>{section.title}</h2>
              {section.description && (
                <p className='mt-1 text-sm text-muted-foreground'>
                  {section.description}
                </p>
              )}
            </div>

            <div className='space-y-4'>
              {section.questions?.map((question) => (
                <div key={question.id} className='space-y-2'>
                  <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                    {question.title}
                    {question.required && (
                      <span className='text-destructive'> *</span>
                    )}
                  </label>
                  {question.description && (
                    <p className='text-sm text-muted-foreground'>
                      {question.description}
                    </p>
                  )}
                  {renderQuestion(question)}
                </div>
              ))}
            </div>
          </div>
        ))}

        <Button type='submit'>Submit</Button>
      </form>
    </div>
  );
}
