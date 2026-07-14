import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TodoPage from './pages/TodoPage';

type ApiTodo = {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

describe('TodoPage', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  // AC-1: The frontend allows a user to create a todo item and see it appear in the todo list.
  it('creates and renders a todo from the API response', async () => {
    const todos: ApiTodo[] = [];
    const created: ApiTodo = {
      id: 1,
      text: 'Learn testing',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => todos })
      .mockResolvedValueOnce({ ok: true, json: async () => created })
      .mockResolvedValueOnce({ ok: true, json: async () => [created] });

    render(<TodoPage />);

    await userEvent.type(screen.getByLabelText(/add a new todo/i), 'Learn testing');
    await userEvent.click(screen.getByRole('button', { name: /create todo/i }));

    expect(await screen.findByText('Learn testing')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith('/api/todos', expect.objectContaining({ method: 'POST' }));
  });

  // AC-2: The frontend allows a user to mark an existing todo item as completed or not completed.
  it('toggles completion by sending the completed field to the API', async () => {
    const todo: ApiTodo = {
      id: 1,
      text: 'Toggle me',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const toggled: ApiTodo = { ...todo, completed: true, updated_at: '2024-01-01T00:01:00Z' };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [todo] })
      .mockResolvedValueOnce({ ok: true, json: async () => toggled })
      .mockResolvedValueOnce({ ok: true, json: async () => [toggled] });

    render(<TodoPage />);

    await userEvent.click(await screen.findByRole('checkbox', { name: /toggle me/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/todos/1', expect.objectContaining({ method: 'PATCH' }));
    });
    expect(screen.getByRole('checkbox', { name: /toggle me/i })).toBeChecked();
  });

  // AC-3: The frontend allows a user to edit an existing todo item's content.
  it('edits an existing todo and sends the updated text to the API', async () => {
    const todo: ApiTodo = {
      id: 1,
      text: 'Original',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const updated: ApiTodo = { ...todo, text: 'Updated' };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [todo] })
      .mockResolvedValueOnce({ ok: true, json: async () => updated })
      .mockResolvedValueOnce({ ok: true, json: async () => [updated] });

    render(<TodoPage />);

    await userEvent.click(await screen.findByRole('button', { name: /edit original/i }));
    await userEvent.clear(screen.getByDisplayValue('Original'));
    await userEvent.type(screen.getByDisplayValue('Updated'), 'Updated');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Updated')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith('/api/todos/1', expect.objectContaining({ method: 'PATCH' }));
  });

  // AC-4: The frontend allows a user to delete an existing todo item from the list.
  it('deletes a todo after confirming the delete flow', async () => {
    const todo: ApiTodo = {
      id: 1,
      text: 'Remove me',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [todo] })
      .mockResolvedValueOnce({ ok: true, status: 204, json: async () => undefined })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<TodoPage />);

    await userEvent.click(await screen.findByRole('button', { name: /delete remove me/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }));

    expect(screen.queryByText('Remove me')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/todos/1', expect.objectContaining({ method: 'DELETE' }));
  });
});
