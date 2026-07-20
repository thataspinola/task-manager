/**
 * Shell da UI: compõe o board a partir de `useTaskBoard` (sem HTTP direto).
 */
import { ConfirmDialog } from './components/ConfirmDialog';
import { EmptyState } from './components/EmptyState';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingState } from './components/LoadingState';
import { Pagination } from './components/Pagination';
import { TaskCard } from './components/TaskCard';
import { TaskFilters } from './components/TaskFilters';
import { TaskForm } from './components/TaskForm';
import { useTaskBoard } from './hooks/use-task-board';

function App() {
  const board = useTaskBoard();

  return (
    <>
      <header className="app-header">
        <div className="app-header-content">
          <div>
            <span className="eyebrow">Task Manager</span>
            <h1>Organize seu trabalho</h1>
            <p>Frontend React integrado ao NestJS BFF.</p>
          </div>

          <div className="header-summary">
            <span>Total</span>
            <strong>{board.meta?.total ?? 0}</strong>
            <small>tarefas encontradas</small>
          </div>
        </div>
      </header>

      <main className="app-layout">
        <TaskForm
          key={board.editingTask?.id ?? 'create'}
          task={board.editingTask}
          isSubmitting={board.isFormSubmitting}
          onSubmit={board.submitTask}
          onCancelEdit={board.cancelEdit}
        />

        <section className="tasks-section">
          <div className="section-header">
            <div>
              <span className="eyebrow">Visão geral</span>
              <h2>Suas tarefas</h2>
            </div>
          </div>

          <TaskFilters
            search={board.search}
            status={board.status}
            onSearchChange={board.applySearch}
            onStatusChange={board.applyStatusFilter}
            onClear={board.clearFilters}
          />

          {board.mutationError ? (
            <ErrorMessage error={board.mutationError} />
          ) : null}

          {board.tasksQuery.isError && (
            <ErrorMessage
              error={board.tasksQuery.error}
              title="Não foi possível carregar as tarefas"
            />
          )}

          {board.tasksQuery.isLoading ? (
            <LoadingState />
          ) : board.tasks.length === 0 ? (
            <EmptyState hasFilters={board.hasFilters} />
          ) : (
            <div className="task-grid">
              {board.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDeleting={
                    board.deleteMutation.isPending &&
                    board.taskPendingDeletion?.id === task.id
                  }
                  isUpdating={board.updatingTaskId === task.id}
                  onEdit={board.startEdit}
                  onDelete={board.requestDelete}
                  onStatusChange={board.changeTaskStatus}
                />
              ))}
            </div>
          )}

          {board.meta && (
            <Pagination
              meta={board.meta}
              disabled={board.tasksQuery.isFetching}
              onPageChange={board.setPage}
            />
          )}
        </section>
      </main>

      <ConfirmDialog
        open={board.taskPendingDeletion !== null}
        title="Excluir tarefa"
        message={
          board.taskPendingDeletion
            ? `Deseja excluir a tarefa “${board.taskPendingDeletion.title}”? Esta ação não poderá ser desfeita.`
            : ''
        }
        confirmLabel="Confirmar exclusão"
        confirmingLabel="Excluindo..."
        isConfirming={board.deleteMutation.isPending}
        onConfirm={() => {
          void board.confirmDelete();
        }}
        onCancel={board.cancelDelete}
      />
    </>
  );
}

export default App;
