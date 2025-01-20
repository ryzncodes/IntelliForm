import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import {ResponseList} from '../response-list';
import type {ResponseListItem} from '@/lib/types/response';

describe('ResponseList', () => {
  const mockResponses: ResponseListItem[] = [
    {
      id: '1',
      status: 'completed',
      submitted_at: new Date('2024-01-15T18:00:00Z').toISOString(),
      respondent_info: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      form_title: 'Test Form',
    },
    {
      id: '2',
      status: 'partial',
      submitted_at: new Date('2024-01-15T19:00:00Z').toISOString(),
      respondent_info: {
        email: 'jane@example.com',
      },
      form_title: 'Test Form',
    },
  ];

  const mockFormId = 'form-1';

  it('renders the response list with initial data', () => {
    render(<ResponseList formId={mockFormId} initialResponses={mockResponses} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // Including header row
  });

  it('filters responses by search term', async () => {
    render(<ResponseList formId={mockFormId} initialResponses={mockResponses} />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Search responses...'), {
        target: {value: 'john'},
      });
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no responses match filters', async () => {
    render(<ResponseList formId={mockFormId} initialResponses={mockResponses} />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Search responses...'), {
        target: {value: 'nonexistent'},
      });
    });

    await waitFor(() => {
      expect(screen.getByText('No responses found')).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog when deleting a response', async () => {
    const mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => true);

    render(<ResponseList formId={mockFormId} initialResponses={mockResponses} />);

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((button) => button.querySelector('svg.lucide-trash2'));

    expect(deleteButton).toBeTruthy();
    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });
    }

    expect(mockConfirm).toHaveBeenCalled();
    mockConfirm.mockRestore();
  });

  it('removes response from list after deletion', async () => {
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<ResponseList formId={mockFormId} initialResponses={mockResponses} />);

    // Initial count
    expect(screen.getAllByRole('row')).toHaveLength(3);

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((button) => button.querySelector('svg.lucide-trash2'));

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });
    }

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(2);
    });
  });
});
