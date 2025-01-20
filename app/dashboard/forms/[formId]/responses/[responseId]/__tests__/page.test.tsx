import {render, screen} from '@testing-library/react';
import ResponsePage from '../page';
import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {notFound} from 'next/navigation';

// Mock the dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

describe('ResponsePage', () => {
  const mockSupabase = {
    from: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
  };

  const mockForm = {
    id: 'form-1',
    title: 'Test Form',
    description: 'Test Description',
    created_at: new Date('2024-01-15T18:00:00Z').toISOString(),
  };

  const mockResponse = {
    id: 'response-1',
    form_id: 'form-1',
    status: 'completed',
    submitted_at: new Date('2024-01-15T18:00:00Z').toISOString(),
    completed_at: new Date('2024-01-15T18:05:00Z').toISOString(),
    respondent_info: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    response_data: {
      q1: 'Answer 1',
      q2: ['Option 1', 'Option 2'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createServerComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  it('renders response details when form and response exist', async () => {
    mockSupabase.single.mockResolvedValueOnce({data: mockForm, error: null}).mockResolvedValueOnce({data: mockResponse, error: null});

    const page = await ResponsePage({params: {formId: 'form-1', responseId: 'response-1'}});
    render(page);

    expect(screen.getByText('Response to: Test Form')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('(john@example.com)')).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });
});
