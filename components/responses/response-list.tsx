'use client';

import {useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import type {ResponseListItem, ResponseFilters} from '@/lib/types/response';
import {format} from 'date-fns';
import {Eye, Trash2} from 'lucide-react';
import {ResponseFilters as ResponseFiltersComponent} from './response-filters';

interface ResponseListProps {
  formId: string;
  initialResponses: ResponseListItem[];
}

export function ResponseList({formId, initialResponses}: ResponseListProps) {
  const [responses, setResponses] = useState<ResponseListItem[]>(initialResponses);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = async (filters: ResponseFilters) => {
    setIsLoading(true);
    try {
      // Temporary implementation until API is ready
      const filtered = initialResponses.filter((response) => {
        if (filters.status && response.status !== filters.status) {
          return false;
        }
        if (filters.startDate && new Date(response.submitted_at) < filters.startDate) {
          return false;
        }
        if (filters.endDate && new Date(response.submitted_at) > filters.endDate) {
          return false;
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const hasMatch = response.respondent_info.name?.toLowerCase().includes(searchLower) || response.respondent_info.email?.toLowerCase().includes(searchLower);
          if (!hasMatch) return false;
        }
        return true;
      });
      setResponses(filtered);
    } catch (error) {
      console.error('Error fetching filtered responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (responseId: string) => {
    if (!window.confirm('Are you sure you want to delete this response?')) {
      return;
    }

    try {
      // TODO: Implement API call to delete response
      // await deleteResponse(responseId);
      setResponses(responses.filter((r) => r.id !== responseId));
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  return (
    <div>
      <ResponseFiltersComponent onFilterChange={handleFilterChange} />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Respondent</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center'>
                  No responses found
                </TableCell>
              </TableRow>
            ) : (
              responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>{format(new Date(response.submitted_at), 'PPp')}</TableCell>
                  <TableCell>
                    <span className={`capitalize ${response.status === 'completed' ? 'text-green-600' : response.status === 'partial' ? 'text-yellow-600' : 'text-gray-600'}`}>{response.status}</span>
                  </TableCell>
                  <TableCell>{response.respondent_info.name || response.respondent_info.email || 'Anonymous'}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button variant='ghost' size='sm' onClick={() => (window.location.href = `/dashboard/forms/${formId}/responses/${response.id}`)}>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='sm' onClick={() => handleDelete(response.id)}>
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
