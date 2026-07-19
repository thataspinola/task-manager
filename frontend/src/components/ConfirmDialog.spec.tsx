import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Excluir tarefa"
        message="Confirmar exclusão?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('confirms the action with custom labels', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Excluir tarefa"
        message="Confirmar exclusão?"
        confirmLabel="Confirmar exclusão"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Confirmar exclusão',
      }),
    );

    expect(onConfirm).toHaveBeenCalled();
  });

  it('cancels with Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Excluir tarefa"
        message="Confirmar exclusão?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalled();
  });

  it('ignores non-Escape keys while open', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Excluir tarefa"
        message="Confirmar exclusão?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.keyboard('{Enter}');

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels when clicking the backdrop', () => {
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Excluir tarefa"
        message="Confirmar exclusão?"
        confirmingLabel="Excluindo..."
        isConfirming
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Excluindo...' }),
    ).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('presentation'));

    expect(onCancel).toHaveBeenCalled();
  });
});
