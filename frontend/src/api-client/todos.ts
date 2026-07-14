export type Todo = {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return (await response.json()) as T;
}

export function fetchTodos(): Promise<Todo[]> {
  return request<Todo[]>('/api/todos');
}

export function createTodo(text: string): Promise<Todo> {
  return request<Todo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function updateTodoCompletion(id: number, completed: boolean): Promise<Todo> {
  return request<Todo>(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}

export function deleteTodo(id: number): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/todos/${id}`, {
    method: 'DELETE',
  });
}
