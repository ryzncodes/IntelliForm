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
  NewQuestion,
} from '@/lib/types/database';

interface SectionProps {
  section: Section & {questions?: QuestionType[]};
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
}

export function Section({section, onUpdate, onDelete}: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const {createQuestion, updateQuestion, deleteQuestion} = useForm();

  const handleAddQuestion = async () => {
    const newQuestion: NewQuestion = {
      section_id: section.id,
      title: 'New Question',
      description: '',
      type: 'short_text',
      required: false,
      order: section.questions?.length || 0,
      options: [],
      validation: null,
      logic: null,
    };

    await createQuestion(newQuestion);
  };

  const handleUpdateQuestion = async (
    id: string,
    updates: Partial<QuestionType>
  ) => {
    await updateQuestion(id, updates);
  };

  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion(id);
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
        >
          Add Question
        </Button>
      </div>
    </div>
  );
}
