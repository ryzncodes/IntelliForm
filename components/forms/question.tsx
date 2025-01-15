'use client';

import {useState} from 'react';
import {Question as QuestionType} from '@/lib/types/database';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';

interface QuestionProps {
  question: QuestionType;
  onUpdate: (data: Partial<QuestionType>) => void;
  onDelete: () => void;
}

interface QuestionOptions {
  choices?: string[];
  maxRating?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleStep?: number;
  scaleLabels?: {
    start?: string;
    end?: string;
  };
  [key: string]: string[] | number | string | {start?: string; end?: string} | undefined;
}

type QuestionOptionValue = string | number | string[] | {start?: string; end?: string};

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
  // Temporarily hidden:
  // {value: 'file_upload', label: 'File Upload'},
] as const;

export function Question({question, onUpdate, onDelete}: QuestionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newChoice, setNewChoice] = useState('');

  const options = question.options as QuestionOptions;
  const choices = options?.choices || [];

  const handleAddChoice = () => {
    if (!newChoice.trim()) return;

    const updatedChoices = [...choices, newChoice.trim()];
    onUpdate({
      options: {
        ...(question.options as QuestionOptions),
        choices: updatedChoices,
      },
    });
    setNewChoice('');
  };

  const handleRemoveChoice = (choiceToRemove: string) => {
    const updatedChoices = choices.filter((choice) => choice !== choiceToRemove);
    onUpdate({
      options: {
        ...(question.options as QuestionOptions),
        choices: updatedChoices,
      },
    });
  };

  const handleEditChoice = (oldChoice: string, newChoiceText: string) => {
    const updatedChoices = choices.map((choice) => (choice === oldChoice ? newChoiceText : choice));
    onUpdate({
      options: {
        ...(question.options as QuestionOptions),
        choices: updatedChoices,
      },
    });
  };

  const handleOptionChange = (key: keyof QuestionOptions, value: QuestionOptionValue) => {
    onUpdate({
      options: {
        ...(question.options as QuestionOptions),
        [key]: value,
      },
    });
  };

  const renderQuestionOptions = () => {
    switch (question.type) {
      case 'single_choice':
      case 'multiple_choice':
        return (
          <div className='space-y-4 border rounded-md p-4'>
            <Label>Choices</Label>

            {/* Existing choices */}
            <div className='space-y-2'>
              {choices.map((choice, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2'
                >
                  <Input
                    value={choice}
                    onChange={(e) => handleEditChoice(choice, e.target.value)}
                    placeholder='Choice text'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => handleRemoveChoice(choice)}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-4 w-4'
                    >
                      <path d='M3 6h18' />
                      <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
                      <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new choice */}
            <div className='flex items-center gap-2'>
              <Input
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
                placeholder='Add a new choice'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChoice();
                  }
                }}
              />
              <Button
                type='button'
                variant='outline'
                onClick={handleAddChoice}
              >
                Add
              </Button>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className='space-y-4 border rounded-md p-4'>
            <Label>Rating Options</Label>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Label>Maximum Rating</Label>
                <Select
                  value={String(options.maxRating || 5)}
                  onValueChange={(value) => handleOptionChange('maxRating', parseInt(value))}
                >
                  <SelectTrigger className='w-24'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10].map((num) => (
                      <SelectItem
                        key={num}
                        value={String(num)}
                      >
                        {num} Stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'scale':
        return (
          <div className='space-y-4 border rounded-md p-4'>
            <Label>Scale Options</Label>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Minimum Value</Label>
                <Input
                  type='number'
                  value={options.scaleMin || 1}
                  onChange={(e) => handleOptionChange('scaleMin', parseInt(e.target.value))}
                  min={0}
                  max={9}
                />
              </div>
              <div className='space-y-2'>
                <Label>Maximum Value</Label>
                <Input
                  type='number'
                  value={options.scaleMax || 10}
                  onChange={(e) => handleOptionChange('scaleMax', parseInt(e.target.value))}
                  min={1}
                  max={10}
                />
              </div>
              <div className='space-y-2'>
                <Label>Step Size</Label>
                <Input
                  type='number'
                  value={options.scaleStep || 1}
                  onChange={(e) => handleOptionChange('scaleStep', parseInt(e.target.value))}
                  min={1}
                  max={5}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label>Labels (Optional)</Label>
              <div className='grid grid-cols-2 gap-4'>
                <Input
                  placeholder='Start label'
                  value={options.scaleLabels?.start || ''}
                  onChange={(e) => handleOptionChange('scaleLabels', {...options.scaleLabels, start: e.target.value})}
                />
                <Input
                  placeholder='End label'
                  value={options.scaleLabels?.end || ''}
                  onChange={(e) => handleOptionChange('scaleLabels', {...options.scaleLabels, end: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='border rounded-lg p-4 space-y-4'>
      {isEditing ? (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Question</Label>
            <Input
              value={question.title}
              onChange={(e) => onUpdate({title: e.target.value})}
              placeholder='Question Title'
              autoFocus
              onFocus={(e) => e.target.select()}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </div>

          <div className='space-y-2'>
            <Label>Description</Label>
            <Textarea
              value={question.description || ''}
              onChange={(e) => onUpdate({description: e.target.value})}
              placeholder='Question Description'
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </div>

          <div className='space-y-2'>
            <Label>Type</Label>
            <Select
              value={question.type}
              onValueChange={(value: QuestionType['type']) => onUpdate({type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderQuestionOptions()}

          <div className='flex items-center space-x-2'>
            <Switch
              checked={question.required}
              onCheckedChange={(checked: boolean) => onUpdate({required: checked})}
            />
            <Label>Required</Label>
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsEditing(false)}
            >
              Done
            </Button>
            <Button
              variant='destructive'
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className='space-y-2'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='font-medium'>{question.title}</h3>
              {question.description && <p className='text-sm text-muted-foreground'>{question.description}</p>}
              {(question.type === 'single_choice' || question.type === 'multiple_choice') && choices.length > 0 && (
                <div className='mt-2 text-sm text-muted-foreground'>
                  <p className='font-medium'>Choices:</p>
                  <ul className='list-disc list-inside'>
                    {choices.map((choice, index) => (
                      <li key={index}>{choice}</li>
                    ))}
                  </ul>
                </div>
              )}
              {question.type === 'rating' && (
                <div className='mt-2 text-sm text-muted-foreground'>
                  <p className='font-medium'>Rating: {options.maxRating || 5} stars</p>
                </div>
              )}
              {question.type === 'scale' && (
                <div className='mt-2 text-sm text-muted-foreground'>
                  <p className='font-medium'>
                    Scale: {options.scaleMin || 1} to {options.scaleMax || 10}
                    {options.scaleLabels?.start && ` (${options.scaleLabels.start} - ${options.scaleLabels.end})`}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </div>
          {question.required && <span className='text-sm text-red-500'>* Required</span>}
        </div>
      )}
    </div>
  );
}
