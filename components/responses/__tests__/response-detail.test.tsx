import {render, screen} from '@testing-library/react';
import {ResponseDetail} from '../response-detail';
import type {FormResponse} from '@/lib/types/response';

describe('ResponseDetail', () => {
  const mockResponse: FormResponse = {
    id: '1',
    form_id: 'form-1',
    submitted_at: '2024-01-15T10:00:00Z',
    completed_at: '2024-01-15T10:05:00Z',
    status: 'completed',
    respondent_info: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    response_data: {
      q1: 'Answer 1',
      q2: ['Option 1', 'Option 2'],
      q3: true,
    },
    updated_at: '2024-01-15T10:05:00Z',
    created_at: '2024-01-15T10:00:00Z',
  };

  const mockFormTitle = 'Test Form';

  it('renders form title and status', () => {
    render(<ResponseDetail response={mockResponse} formTitle={mockFormTitle} />);

    expect(screen.getByText(`Response to: ${mockFormTitle}`)).toBeInTheDocument();
    expect(screen.getByText(mockResponse.status)).toBeInTheDocument();
  });

  it('displays respondent information', () => {
    render(<ResponseDetail response={mockResponse} formTitle={mockFormTitle} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('(john@example.com)')).toBeInTheDocument();
  });

  it('shows anonymous when no respondent name is provided', () => {
    const anonymousResponse = {
      ...mockResponse,
      respondent_info: {},
    };

    render(<ResponseDetail response={anonymousResponse} formTitle={mockFormTitle} />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('renders submission and completion times', () => {
    render(<ResponseDetail response={mockResponse} formTitle={mockFormTitle} />);

    expect(screen.getByText('Jan 15, 2024, 6:00:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2024, 6:05:00 PM')).toBeInTheDocument();
  });

  it('renders different types of responses correctly', () => {
    render(<ResponseDetail response={mockResponse} formTitle={mockFormTitle} />);

    // Text response
    expect(screen.getByText('Answer 1')).toBeInTheDocument();

    // Array response
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();

    // Boolean response
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('applies correct status color', () => {
    const {rerender} = render(<ResponseDetail response={mockResponse} formTitle={mockFormTitle} />);

    expect(screen.getByText('completed')).toHaveClass('bg-green-100');

    rerender(<ResponseDetail response={{...mockResponse, status: 'partial'}} formTitle={mockFormTitle} />);

    expect(screen.getByText('partial')).toHaveClass('bg-yellow-100');
  });
});
