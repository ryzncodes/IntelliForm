'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Question} from './question';
import {
  NewQuestion,
  NewSection,
  Section as SectionType,
} from '@/lib/types/database';

interface SectionProps {
  section: SectionType;
  onUpdate: (data: Partial<NewSection>) => void;
  onDelete: () => void;
}

export function Section({section, onUpdate, onDelete}: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  async function addQuestion() {
    const newQuestion: NewQuestion = {
      title: 'New Question',
      description: '',
      type: 'short_text',
      required: false,
      order: section.questions?.length || 0,
      section_id: section.id,
      options: {},
      logic: {},
      validation: {},
    };

    onUpdate({
      questions: [...(section.questions || []), newQuestion],
    });
  }

  async function updateQuestion(
    questionId: string,
    data: Partial<NewQuestion>
  ) {
    const updatedQuestions =
      section.questions?.map((question) =>
        question.id === questionId ? {...question, ...data} : question
      ) || [];

    onUpdate({questions: updatedQuestions});
  }

  async function deleteQuestion(questionId: string) {
    const updatedQuestions =
      section.questions?.filter((question) => question.id !== questionId) || [];

    onUpdate({questions: updatedQuestions});
  }

  if (isEditing) {
    return (
      <div className='space-y-4 rounded-lg border p-4'>
        <div className='space-y-2'>
          <Input
            value={section.title}
            onChange={(e) => onUpdate({title: e.target.value})}
            placeholder='Section Title'
          />
          <Textarea
            value={section.description || ''}
            onChange={(e) => onUpdate({description: e.target.value})}
            placeholder='Section Description (optional)'
            rows={2}
          />
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setIsEditing(false)}>
            Done
          </Button>
          <Button variant='destructive' onClick={onDelete}>
            Delete Section
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 rounded-lg border p-4'>
      <div
        className='space-y-1 cursor-pointer'
        onClick={() => setIsEditing(true)}
      >
        <h3 className='text-lg font-medium'>{section.title}</h3>
        {section.description && (
          <p className='text-sm text-muted-foreground'>{section.description}</p>
        )}
      </div>

      <div className='space-y-4'>
        {section.questions?.map((question) => (
          <Question
            key={question.id}
            question={question}
            onUpdate={(data) => updateQuestion(question.id, data)}
            onDelete={() => deleteQuestion(question.id)}
          />
        ))}

        <Button onClick={addQuestion}>Add Question</Button>
      </div>
    </div>
  );
}
