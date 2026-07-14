import { useCallback, useEffect, useState } from 'react';
import { createTodo, deleteTodo, fetchTodos, type Todo, updateTodo } from '../api-client/todos';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextTodos = await fetchTodos();
      setTodos(nextTodos);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Something went wrong while loading todos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  const refreshTodos = useCallback(async () => {
    const nextTodos = await fetchTodos();
    setTodos(nextTodos);
  }, []);

  const handleCreate = useCallback(async (text: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createTodo(text);
      await refreshTodos();
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : 'Unable to create todo.';
      setError(message);
      throw createError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshTodos]);

  const handleUpdate = useCallback(async (todo: Todo, nextText: string, nextCompleted: boolean) => {
    setPendingUpdateId(todo.id);
    setError(null);
    try {
      const payload: { text?: string; completed?: boolean } = {};
      if (nextText !== todo.text) {
        payload.text = nextText;
      }
      if (nextCompleted !== todo.completed) {
        payload.completed = nextCompleted;
      }
      if (Object.keys(payload).length === 0) {
        return;
      }
      await updateTodo(todo.id, payload);
      await refreshTodos();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update todo.');
    } finally {
      setPendingUpdateId(null);
    }
  }, [refreshTodos]);

  const handleDelete = useCallback(async (id: number) => {
    setPendingDeleteId(id);
    setError(null);
    try {
      await deleteTodo(id);
      await refreshTodos();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete todo.');
    } finally {
      setPendingDeleteId(null);
    }
  }, [refreshTodos]);

  return {
    todos,
    isLoading,
    error,
    isSubmitting,
    pendingUpdateId,
    pendingDeleteId,
    loadTodos,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
