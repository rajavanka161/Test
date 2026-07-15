export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type TodoUpdate = {
  title?: string;
  completed?: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

function buildErrorMessage(path: string, responseText: string, status: number): string {
  if (responseText.trim()) {
    return responseText;
  }

  if (status >= 500) {
    return `The server returned ${status} while requesting ${path}.`;
  }

  return `Request to ${path} failed with status ${status}.`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Unable to reach the backend at ${API_BASE || 'same-origin /api proxy'}. ${error.message}`
        : 'Unable to reach the backend. Check the frontend proxy or VITE_API_BASE_URL configuration.',
    );
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(buildErrorMessage(path, message, response.status));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function fetchTodos(): Promise<Todo[]> {
  return request<Todo[]>('/api/todos');
}

export function createTodo(title: string): Promise<Todo> {
  return request<Todo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function updateTodo(id: number, payload: TodoUpdate): Promise<Todo> {
  return request<Todo>(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteTodo(id: number): Promise<void> {
  return request<void>(`/api/todos/${id}`, {
    method: 'DELETE',
  });
}
