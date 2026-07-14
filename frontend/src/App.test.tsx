import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

type MockTodo = {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
};

describe('App', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders todos from the API and creates a new todo', async () => {
    const initialTodos: MockTodo[] = [
      {
        id: 1,
        text: 'Existing task',
        completed: false,
        created_at: '2024-01-01T10:00:00Z',
      },
    ];

    const createdTodo: MockTodo = {
      id: 2,
      text: 'New task',
      completed: false,
      created_at: '2024-01-02T10:00:00Z',
    };

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialTodos,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => createdTodo,
      });

    render(<App />);

    expect(await screen.findByText('Existing task')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Add a new todo'), 'New task');
    await userEvent.click(screen.getByRole('button', { name: /create todo/i }));

    expect(await screen.findByText('New task')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/todos', expect.objectContaining({ method: 'POST' }));
    });
  });
});
