'use client';

import {useState} from 'react';
import {Question as QuestionType} from '@/lib/types/database';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';

interface QuestionProps {
  question: QuestionType;
  onUpdate: (data: Partial<QuestionType>) => void;
  onDelete: () => void;
}

const QUESTION_TYPES = [
  {value: 'short_text', label: 'Short Text'},
  {value: 'long_text', label: 'Long Text'},
  {value: 'single_choice', label: 'Single Choice'},
  {value: 'multiple_choice', label: 'Multiple Choice'},
  {value: 'rating', label: 'Rating'},
  {value: 'scale', label: 'Scale'},
  {value: 'date', label: 'Date'},
  {value: 'time', label: 'Time'},
  {value: 'email', label: 'Email'},
  {value: 'phone', label: 'Phone'},
  {value: 'number', label: 'Number'},
  {value: 'file_upload', label: 'File Upload'},
] as const;

export function Question({question, onUpdate, onDelete}: QuestionProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className='border rounded-lg p-4 space-y-4'>
      {isEditing ? (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Question</Label>
            <Input
              value={question.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate({title: e.target.value})
              }
              placeholder='Question Text'
            />
          </div>

          <div className='space-y-2'>
            <Label>Description</Label>
            <Textarea
              value={question.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onUpdate({description: e.target.value})
              }
              placeholder='Question Description'
            />
          </div>

          <div className='space-y-2'>
            <Label>Type</Label>
            <Select
              value={question.type}
              onValueChange={(value: QuestionType['type']) =>
                onUpdate({type: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              checked={question.required}
              onCheckedChange={(checked: boolean) =>
                onUpdate({required: checked})
              }
            />
            <Label>Required</Label>
          </div>

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setIsEditing(false)}>
              Done
            </Button>
            <Button variant='destructive' onClick={onDelete}>
              Delete Question
            </Button>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='font-medium'>{question.title}</h3>
              {question.required && (
                <span className='text-sm text-red-500'>*</span>
              )}
            </div>
            {question.description && (
              <p className='text-sm text-muted-foreground'>
                {question.description}
              </p>
            )}
          </div>
          <Button variant='outline' onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}
