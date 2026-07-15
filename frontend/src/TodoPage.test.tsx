import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TodoPage from './pages/TodoPage';

type ApiTodo = {
  id: number;
  title: string;
  completed: boolean;
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

  it('creates and renders a todo from the API response', async () => {
    const created: ApiTodo = {
      id: 1,
      title: 'Learn testing',
      completed: false,
    };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => created })
      .mockResolvedValueOnce({ ok: true, json: async () => [created] });

    render(<TodoPage />);

    await userEvent.type(screen.getByLabelText(/add a new todo/i), 'Learn testing');
    await userEvent.click(screen.getByRole('button', { name: /create todo/i }));

    expect(await screen.findByText('Learn testing')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/todos',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Learn testing' }),
      }),
    );
  });

  it('toggles completion by sending the completed field to the API', async () => {
    const todo: ApiTodo = {
      id: 1,
      title: 'Toggle me',
      completed: false,
    };
    const toggled: ApiTodo = { ...todo, completed: true };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [todo] })
      .mockResolvedValueOnce({ ok: true, json: async () => toggled })
      .mockResolvedValueOnce({ ok: true, json: async () => [toggled] });

    render(<TodoPage />);

    await userEvent.click(await screen.findByRole('checkbox', { name: /toggle me/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/todos/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ title: 'Toggle me', completed: true }),
        }),
      );
    });

    expect(screen.getByRole('checkbox', { name: /toggle me/i })).toBeChecked();
  });

  it('edits an existing todo and sends the updated title to the API', async () => {
    const todo: ApiTodo = {
      id: 1,
      title: 'Original',
      completed: false,
    };
    const updated: ApiTodo = { ...todo, title: 'Updated' };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [todo] })
      .mockResolvedValueOnce({ ok: true, json: async () => updated })
      .mockResolvedValueOnce({ ok: true, json: async () => [updated] });

    render(<TodoPage />);

    await userEvent.click(await screen.findByRole('button', { name: /edit original/i }));
    const editInput = screen.getByDisplayValue('Original');
    await userEvent.clear(editInput);
    await userEvent.type(editInput, 'Updated');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Updated')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/todos/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated', completed: false }),
      }),
    );
  });

  it('deletes a todo after confirming the delete flow', async () => {
    const todo: ApiTodo = {
      id: 1,
      title: 'Remove me',
      completed: false,
    };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [todo] })
      .mockResolvedValueOnce({ ok: true, status: 204, text: async () => '' })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<TodoPage />);

    await userEvent.click(await screen.findByRole('button', { name: /delete remove me/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/todos/1', expect.objectContaining({ method: 'DELETE' }));
    });
    expect(await screen.findByText(/no todos yet/i)).toBeVisible();
  });

  it('shows an error state when loading fails and retries on demand', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Backend unavailable' })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<TodoPage />);

    expect(await screen.findByText(/unable to load todos/i)).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText(/no todos yet/i)).toBeVisible();
  });
});
