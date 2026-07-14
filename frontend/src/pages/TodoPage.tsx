import { ListTodo, RefreshCcw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createTodo, deleteTodo, fetchTodos, type Todo, updateTodo } from '../api-client/todos';
import { TodoForm } from '../components/features/TodoForm';
import { TodoList } from '../components/features/TodoList';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  async function loadTodos() {
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
  }

  useEffect(() => {
    void loadTodos();
  }, []);

  async function refreshTodos() {
    const nextTodos = await fetchTodos();
    setTodos(nextTodos);
  }

  async function handleCreate(text: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      await createTodo(text);
      await refreshTodos();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create todo.');
      throw createError;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(todo: Todo, nextText: string, nextCompleted: boolean) {
    setPendingUpdateId(todo.id);
    setError(null);
    try {
      await updateTodo(todo.id, {
        text: nextText,
        completed: nextCompleted,
      });
      await refreshTodos();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update todo.');
    } finally {
      setPendingUpdateId(null);
    }
  }

  async function handleDelete(id: number) {
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
  }

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary">Focused execution</Badge>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <ListTodo className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Stay on top of every todo</h2>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Create, edit, complete, and clear tasks with a calm workspace designed for fast daily planning.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface-secondary/70 px-4 py-3 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Synced with the backend todo API
              </div>
              <Button variant="outline" onClick={() => void loadTodos()} disabled={isLoading}>
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Reload
              </Button>
            </div>
          </div>
          <TodoForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>

      {error && !isLoading ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <TodoList
        todos={todos}
        isLoading={isLoading}
        error={error && todos.length === 0 ? error : null}
        pendingUpdateId={pendingUpdateId}
        pendingDeleteId={pendingDeleteId}
        onRetry={loadTodos}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </section>
  );
}
