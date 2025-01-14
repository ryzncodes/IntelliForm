'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Question} from './question';
import {useForm} from '@/lib/hooks/use-form';
import type {
  Section,
  Question as QuestionType,
  Form,
} from '@/lib/types/database';
import {Dispatch, SetStateAction} from 'react';

type FormWithSections = Form & {
  sections: (Section & {questions: QuestionType[]})[];
};

interface SectionProps {
  section: Section & {questions?: QuestionType[]};
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  setLocalForm: Dispatch<SetStateAction<FormWithSections | null>>;
}

export function Section({
  section,
  onUpdate,
  onDelete,
  setLocalForm,
}: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const {createQuestion} = useForm();

  const handleAddQuestion = async () => {
    try {
      setIsAddingQuestion(true);
      const newQuestion: QuestionType = {
        id: `temp_${crypto.randomUUID()}`, // Temporary ID for local state
        section_id: section.id,
        title: 'New Question',
        description: '',
        type: 'short_text',
        required: false,
        order: section.questions?.length || 0,
        options: {},
        validation: null,
        logic: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update local state immediately
      setLocalForm((prev) => ({
        ...prev!,
        sections: prev!.sections.map((s) => {
          if (s.id === section.id) {
            return {
              ...s,
              questions: [...(s.questions || []), newQuestion],
            };
          }
          return s;
        }),
      }));

      // Only create in database if the section is not temporary
      if (!section.id.startsWith('temp_')) {
        await createQuestion({
          section_id: section.id,
          title: newQuestion.title,
          description: newQuestion.description,
          type: newQuestion.type,
          required: newQuestion.required,
          order: newQuestion.order,
          options: newQuestion.options,
          validation: newQuestion.validation,
          logic: newQuestion.logic,
        });
      }
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleUpdateQuestion = (id: string, updates: Partial<QuestionType>) => {
    setLocalForm((prev) => ({
      ...prev!,
      sections: prev!.sections.map((s) => {
        if (s.id === section.id) {
          return {
            ...s,
            questions: s.questions.map((q) =>
              q.id === id ? {...q, ...updates} : q
            ),
          };
        }
        return s;
      }),
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    setLocalForm((prev) => ({
      ...prev!,
      sections: prev!.sections.map((s) => {
        if (s.id === section.id) {
          return {
            ...s,
            questions: s.questions.filter((q) => q.id !== id),
          };
        }
        return s;
      }),
    }));
  };

  return (
    <div className='space-y-4 p-4 border rounded-lg'>
      <div className='flex items-start justify-between gap-4'>
        {isEditing ? (
          <div className='flex-1 space-y-2'>
            <Input
              value={section.title}
              onChange={(e) => onUpdate({title: e.target.value})}
              placeholder='Section Title'
            />
            <Textarea
              value={section.description || ''}
              onChange={(e) => onUpdate({description: e.target.value})}
              placeholder='Section Description'
            />
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditing(false)}>Save</Button>
            </div>
          </div>
        ) : (
          <div className='flex-1'>
            <h3 className='text-lg font-semibold'>{section.title}</h3>
            {section.description && (
              <p className='text-sm text-gray-500 mt-1'>
                {section.description}
              </p>
            )}
          </div>
        )}
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button variant='destructive' size='sm' onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className='space-y-4'>
        {section.questions?.map((question) => (
          <Question
            key={question.id}
            question={question}
            onUpdate={(data) => handleUpdateQuestion(question.id, data)}
            onDelete={() => handleDeleteQuestion(question.id)}
          />
        ))}
        <Button
          variant='outline'
          className='w-full'
          onClick={handleAddQuestion}
          disabled={isAddingQuestion}
        >
          {isAddingQuestion ? 'Adding Question...' : 'Add Question'}
        </Button>
      </div>
    </div>
  );
}
