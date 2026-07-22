import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function ConfirmDialog({
  confirmLabel = 'Confirm',
  description,
  isLoading = false,
  isOpen,
  onClose,
  onConfirm,
  title,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button disabled={isLoading} onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isLoading} onClick={onConfirm} variant="danger">
          {isLoading ? 'Deleting...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
