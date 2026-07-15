import { AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react';
import type { Todo } from '../../api-client/todos';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  pendingUpdateId: number | null;
  pendingDeleteId: number | null;
  onRetry: () => Promise<void>;
  onUpdate: (todo: Todo, nextText: string, nextCompleted: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function TodoSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border/70 bg-surface-elevated/60 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-5 w-5 rounded bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function TodoList({
  todos,
  isLoading,
  error,
  pendingUpdateId,
  pendingDeleteId,
  onRetry,
  onUpdate,
  onDelete,
}: TodoListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <TodoSkeleton />
          <TodoSkeleton />
          <TodoSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Unable to load todos</h3>
            <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => void onRetry()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No todos yet</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Create your first todo to start tracking what matters most today.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          {todos.filter((todo) => todo.completed).length} of {todos.length} tasks completed
        </div>
        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isUpdating={pendingUpdateId === todo.id}
              isDeleting={pendingDeleteId === todo.id}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
