import { Check, LoaderCircle, Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Todo } from '../../api-client/todos';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface TodoItemProps {
  todo: Todo;
  isUpdating: boolean;
  isDeleting: boolean;
  onUpdate: (todo: Todo, nextText: string, nextCompleted: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoItem({ todo, isUpdating, isDeleting, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);

  useEffect(() => {
    setDraftText(todo.text);
  }, [todo.text]);

  async function handleToggle() {
    await onUpdate(todo, todo.text, !todo.completed);
  }

  async function handleSave() {
    const trimmed = draftText.trim();
    if (!trimmed) {
      return;
    }

    await onUpdate(todo, trimmed, todo.completed);
    setIsEditing(false);
  }

  async function handleEditKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      await handleSave();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  }

  function handleCancel() {
    setDraftText(todo.text);
    setIsEditing(false);
  }

  async function handleConfirmDelete() {
    await onDelete(todo.id);
    setIsConfirmingDelete(false);
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-surface-elevated/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-1 items-start gap-3">
        <label className="mt-1 inline-flex items-center">
          <span className="sr-only">Toggle todo completion</span>
          <Checkbox
            checked={todo.completed}
            onChange={() => void handleToggle()}
            disabled={isUpdating || isDeleting}
            aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
        </label>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={todo.completed ? 'bg-primary/15 text-primary' : ''}>
              {todo.completed ? 'Completed' : 'Open'}
            </Badge>
            {isUpdating ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Saving
              </span>
            ) : null}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor={`todo-edit-${todo.id}`} className="mb-2 block">
                  Edit todo
                </Label>
                <Input
                  id={`todo-edit-${todo.id}`}
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  onKeyDown={(event) => void handleEditKeyDown(event)}
                  onFocus={(event) => {
                    if (event.currentTarget.value.length > 0) {
                      event.currentTarget.select();
                    }
                  }}
                  disabled={isUpdating || isDeleting}
                  aria-required="true"
                  required
                  data-testid={`todo-edit-input-${todo.id}`}
                />
                <span className="sr-only" aria-hidden="true">
                  {draftText}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void handleSave()} disabled={isUpdating || isDeleting || draftText.trim().length === 0}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isUpdating || isDeleting}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className={`text-base font-medium ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {todo.text}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${todo.text}`}
            disabled={isDeleting || isUpdating}
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : null}
        {isConfirmingDelete ? (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              aria-label="Confirm delete"
              disabled={isDeleting || isUpdating}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Confirm delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting || isUpdating}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${todo.text}`}
            disabled={isDeleting || isUpdating}
            onClick={() => setIsConfirmingDelete(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        {todo.completed && !isEditing ? (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </article>
  );
}
