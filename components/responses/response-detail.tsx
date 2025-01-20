'use client';

import {format} from 'date-fns';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import type {FormResponse} from '@/lib/types/response';

interface ResponseDetailProps {
  response: FormResponse;
  formTitle: string;
}

export function ResponseDetail({response, formTitle}: ResponseDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-xl font-bold'>Response to: {formTitle}</CardTitle>
            <Badge className={getStatusColor(response.status)}>{response.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Submitted</dt>
              <dd className='mt-1 text-sm text-gray-900'>{format(new Date(response.submitted_at), 'PPpp')}</dd>
            </div>
            {response.completed_at && (
              <div>
                <dt className='text-sm font-medium text-gray-500'>Completed</dt>
                <dd className='mt-1 text-sm text-gray-900'>{format(new Date(response.completed_at), 'PPpp')}</dd>
              </div>
            )}
            <div className='sm:col-span-2'>
              <dt className='text-sm font-medium text-gray-500'>Respondent</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {response.respondent_info.name || 'Anonymous'} {response.respondent_info.email && <span className='text-gray-500'>({response.respondent_info.email})</span>}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {Object.entries(response.response_data).map(([questionId, value]) => (
              <div key={questionId} className='border-b pb-4 last:border-0'>
                <dt className='text-sm font-medium text-gray-500 mb-2'>Question {questionId}</dt>
                <dd className='text-sm text-gray-900'>
                  {Array.isArray(value) ? (
                    <ul className='list-disc list-inside'>
                      {value.map((item, index) => (
                        <li key={index}>{String(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    String(value)
                  )}
                </dd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
