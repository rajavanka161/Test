import { LoaderCircle, Trash2 } from 'lucide-react';
import type { Todo } from '../../api-client/todos';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';

interface TodoItemProps {
  todo: Todo;
  isToggling: boolean;
  isDeleting: boolean;
  onToggle: (todo: Todo) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoItem({ todo, isToggling, isDeleting, onToggle, onDelete }: TodoItemProps) {
  const formattedDate = new Date(todo.created_at).toLocaleString();

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-surface-elevated/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <label className="mt-1 inline-flex items-center">
          <span className="sr-only">Toggle todo completion</span>
          <Checkbox
            checked={todo.completed}
            onChange={() => void onToggle(todo)}
            disabled={isToggling || isDeleting}
            aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-base font-medium ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {todo.text}
            </p>
            <Badge className={todo.completed ? 'bg-primary/15 text-primary' : ''}>
              {todo.completed ? 'Completed' : 'Open'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Created {formattedDate}</p>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${todo.text}`}
          disabled={isDeleting || isToggling}
          onClick={() => void onDelete(todo.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </article>
  );
}
