import { LoaderCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface TodoFormProps {
  onSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
}

export function TodoForm({ onSubmit, isSubmitting }: TodoFormProps) {
  const [text, setText] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    await onSubmit(trimmed);
    setText('');
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <div className="flex-1">
        <Label className="mb-2 block" htmlFor="todo-text">
          Add a new todo
        </Label>
        <Input
          id="todo-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write your next task..."
          aria-required="true"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || text.trim().length === 0}>
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create todo
        </Button>
      </div>
    </form>
  );
}
