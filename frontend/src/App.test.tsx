import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

type MockTodo = {
  id: number;
  title: string;
  completed: boolean;
};

describe('App', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders todos from the API, toggles theme, and refreshes after creating a new todo', async () => {
    const initialTodos: MockTodo[] = [
      {
        id: 1,
        title: 'Existing task',
        completed: false,
      },
    ];

    const createdTodo: MockTodo = {
      id: 2,
      title: 'New task',
      completed: false,
    };

    const refreshedTodos: MockTodo[] = [...initialTodos, createdTodo];

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialTodos,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => createdTodo,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => refreshedTodos,
      });

    render(<App />);

    expect(await screen.findByText('Existing task')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await userEvent.type(screen.getByLabelText(/add a new todo/i), 'New task');
    await userEvent.click(screen.getByRole('button', { name: /create todo/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/todos',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New task' }),
        }),
      );
    });

    expect(await screen.findByText('New task')).toBeInTheDocument();
  });
});
