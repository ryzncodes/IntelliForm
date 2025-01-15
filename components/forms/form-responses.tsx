'use client';

import {useFormResponses} from '@/lib/hooks/use-form-responses';
import {Question} from '@/types';
import {ResponseItem, ResponseWithItems} from '@/lib/types/database';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

interface FormResponsesProps {
  formId: string;
  questions: Question[];
}

export function FormResponses({formId, questions}: FormResponsesProps) {
  const {responses, isLoading, error} = useFormResponses(formId);

  if (isLoading) {
    return <div>Loading responses...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error instanceof Error ? error.message : 'Failed to load responses'}</div>;
  }

  if (!responses.length) {
    return <div>No responses yet</div>;
  }

  const formatValue = (value: ResponseItem['value']) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Form Responses</h2>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted At</TableHead>
              {questions.map((question) => (
                <TableHead key={question.id}>{question.text}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response: ResponseWithItems) => (
              <TableRow key={response.id}>
                <TableCell>{new Date(response.submitted_at).toLocaleDateString()}</TableCell>
                {questions.map((question) => {
                  const responseItem = response.items.find((item: ResponseItem) => item.question_id === question.id);
                  const value = responseItem?.value;
                  return <TableCell key={question.id}>{value ? formatValue(value) : ''}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
