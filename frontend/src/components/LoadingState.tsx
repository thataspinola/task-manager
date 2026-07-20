/** Spinner enquanto o GET /tasks está carregando pela primeira vez. */
export function LoadingState() {
  return (
    <div className="state-message" role="status">
      <div className="spinner" />
      <p>Carregando tarefas...</p>
    </div>
  );
}
