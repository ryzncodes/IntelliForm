'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Question} from './question';
import type {Section, Question as QuestionType} from '@/lib/types/database';

type SectionWithQuestions = Section & {questions: QuestionType[]};

interface SectionProps {
  section: SectionWithQuestions;
  onUpdate: (updates: Partial<SectionWithQuestions>) => void;
  onDelete: () => void;
  onDeleteQuestion: (questionId: string) => void;
}

export function Section({section, onUpdate, onDelete, onDeleteQuestion}: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

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
        order: section.questions.length,
        options: {},
        validation: null,
        logic: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update through parent's onUpdate to track history
      onUpdate({
        ...section,
        questions: [...section.questions, newQuestion],
      });
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleUpdateQuestion = (id: string, updates: Partial<QuestionType>) => {
    // Update through parent's onUpdate to track history
    onUpdate({
      ...section,
      questions: section.questions.map((q) => (q.id === id ? {...q, ...updates} : q)),
    });
  };

  const handleDeleteQuestion = (id: string) => {
    onDeleteQuestion(id);
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
              autoFocus
              onFocus={(e) => e.target.select()}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <Textarea
              value={section.description || ''}
              onChange={(e) => onUpdate({description: e.target.value})}
              placeholder='Section Description'
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsEditing(false)}>Save</Button>
            </div>
          </div>
        ) : (
          <div className='flex-1'>
            <h3 className='text-lg font-semibold'>{section.title}</h3>
            {section.description && <p className='text-sm text-gray-500 mt-1'>{section.description}</p>}
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
          <Button
            variant='destructive'
            size='sm'
            onClick={onDelete}
          >
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
