'use client';

import {useState} from 'react';
import {Calendar} from '@/components/ui/calendar';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import type {ResponseFilters, ResponseStatus} from '@/lib/types/response';
import {format} from 'date-fns';
import {Calendar as CalendarIcon, Search} from 'lucide-react';

interface ResponseFiltersProps {
  onFilterChange: (filters: ResponseFilters) => void;
}

export function ResponseFilters({onFilterChange}: ResponseFiltersProps) {
  const [filters, setFilters] = useState<ResponseFilters>({});

  const handleFilterChange = (newFilters: Partial<ResponseFilters>) => {
    const updatedFilters = {...filters, ...newFilters};
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className='flex flex-wrap gap-4 mb-6'>
      <div className='flex items-center gap-2'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' className='flex items-center gap-2'>
              <CalendarIcon className='h-4 w-4' />
              {filters.startDate ? format(filters.startDate, 'PP') : 'Start Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar mode='single' selected={filters.startDate} onSelect={(date: Date | undefined) => handleFilterChange({startDate: date})} initialFocus />
          </PopoverContent>
        </Popover>
        <span>to</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' className='flex items-center gap-2'>
              <CalendarIcon className='h-4 w-4' />
              {filters.endDate ? format(filters.endDate, 'PP') : 'End Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar mode='single' selected={filters.endDate} onSelect={(date: Date | undefined) => handleFilterChange({endDate: date})} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <Select value={filters.status} onValueChange={(value: ResponseStatus) => handleFilterChange({status: value})}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Filter by status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='completed'>Completed</SelectItem>
          <SelectItem value='partial'>Partial</SelectItem>
          <SelectItem value='started'>Started</SelectItem>
        </SelectContent>
      </Select>

      <div className='flex-1'>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search responses...' className='pl-8' value={filters.search || ''} onChange={(e) => handleFilterChange({search: e.target.value})} />
        </div>
      </div>
    </div>
  );
}
