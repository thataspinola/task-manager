import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import type { CreateTaskInput, Task } from "../types/task";
import { TaskStatus } from "../types/task";

type TaskFormProps = {
  task?: Task | null;
  isSubmitting: boolean;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancelEdit: () => void;
};

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
};

const initialState: FormState = {
  title: "",
  description: "",
  status: TaskStatus.PENDING,
};

export function TaskForm({
  task,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: TaskFormProps) {
  const [form, setForm] = useState<FormState>(initialState);

  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditing = Boolean(task);

  useEffect(() => {
    if (!task) {
      setForm(initialState);
      return;
    }

    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
    });
  }, [task]);

  function handleChange(
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();

    if (title.length < 3) {
      setValidationError("O título deve possuir pelo menos 3 caracteres.");

      return;
    }

    setValidationError(null);

    await onSubmit({
      title,
      description: form.description.trim() || undefined,
      status: form.status,
    });

    if (!isEditing) {
      setForm(initialState);
    }
  }

  function handleCancel() {
    setValidationError(null);
    setForm(initialState);
    onCancelEdit();
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">
            {isEditing ? "Edição" : "Nova tarefa"}
          </span>

          <h2>{isEditing ? "Editar tarefa" : "Adicionar tarefa"}</h2>
        </div>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Título</label>

          <input
            id="title"
            name="title"
            value={form.title}
            minLength={3}
            maxLength={120}
            disabled={isSubmitting}
            placeholder="Ex.: Criar testes do frontend"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Descrição</label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            maxLength={500}
            disabled={isSubmitting}
            placeholder="Detalhes opcionais da tarefa"
            rows={5}
            onChange={handleChange}
          />

          <small>{form.description.length}/500</small>
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>

          <select
            id="status"
            name="status"
            value={form.status}
            disabled={isSubmitting}
            onChange={handleChange}
          >
            <option value={TaskStatus.PENDING}>Pendente</option>

            <option value={TaskStatus.IN_PROGRESS}>Em andamento</option>

            <option value={TaskStatus.COMPLETED}>Concluída</option>
          </select>
        </div>

        {validationError && (
          <div className="field-error" role="alert">
            {validationError}
          </div>
        )}

        <div className="form-actions">
          <button
            className="button button-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Criar tarefa"}
          </button>

          {isEditing && (
            <button
              className="button button-secondary"
              type="button"
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
