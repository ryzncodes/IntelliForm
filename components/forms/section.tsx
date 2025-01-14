'use client';

import {useState} from 'react';
import {
  Section as SectionType,
  Question,
  NewQuestion,
} from '@/lib/types/database';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Question as QuestionComponent} from './question';

interface SectionProps {
  section: SectionType & {questions: Question[]};
  onUpdate: (data: Partial<SectionType>) => void;
  onDelete: () => void;
}

export function Section({section, onUpdate, onDelete}: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  function addQuestion() {
    const newQuestion: NewQuestion = {
      title: 'New Question',
      description: '',
      type: 'short_text',
      required: false,
      order: section.questions.length,
      section_id: section.id,
      logic: null,
      options: null,
      validation: null,
    };

    onUpdate({
      questions: [...section.questions, newQuestion],
    } as any); // TODO: Fix type
  }

  function updateQuestion(questionId: string, data: Partial<Question>) {
    const updatedQuestions = section.questions.map((question) =>
      question.id === questionId ? {...question, ...data} : question
    );

    onUpdate({
      questions: updatedQuestions,
    } as any); // TODO: Fix type
  }

  function deleteQuestion(questionId: string) {
    const updatedQuestions = section.questions.filter(
      (question) => question.id !== questionId
    );

    onUpdate({
      questions: updatedQuestions,
    } as any); // TODO: Fix type
  }

  return (
    <div className='border rounded-lg p-4 space-y-4'>
      {isEditing ? (
        <div className='space-y-2'>
          <Input
            value={section.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({title: e.target.value})
            }
            placeholder='Section Title'
          />
          <Textarea
            value={section.description || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onUpdate({description: e.target.value})
            }
            placeholder='Section Description'
          />
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setIsEditing(false)}>
              Done
            </Button>
            <Button variant='destructive' onClick={onDelete}>
              Delete Section
            </Button>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>{section.title}</h2>
            {section.description && (
              <p className='text-muted-foreground'>{section.description}</p>
            )}
          </div>
          <Button variant='outline' onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      )}

      <div className='space-y-4 pl-4'>
        {section.questions.map((question) => (
          <QuestionComponent
            key={question.id}
            question={question}
            onUpdate={(data) => updateQuestion(question.id, data)}
            onDelete={() => deleteQuestion(question.id)}
          />
        ))}

        <Button variant='outline' onClick={addQuestion}>
          Add Question
        </Button>
      </div>
    </div>
  );
}
