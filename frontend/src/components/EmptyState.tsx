type EmptyStateProps = {
  hasFilters: boolean;
};

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">✓</span>

      <h2>
        {hasFilters ? "Nenhuma tarefa encontrada" : "Sua lista está vazia"}
      </h2>

      <p>
        {hasFilters
          ? "Altere os filtros para encontrar outras tarefas."
          : "Crie sua primeira tarefa para começar."}
      </p>
    </div>
  );
}
