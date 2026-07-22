import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { IconButton } from './IconButton'

export function Modal({ children, isOpen, onClose, title }) {
  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(20,24,31,0.56)] px-4 py-6 backdrop-blur-sm"
      role="dialog"
    >
      <div className="animate-ledgerly-pop w-full max-w-2xl overflow-hidden rounded-lg border border-[var(--paper-line)] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--paper-line)] bg-white px-5 py-4">
          <h2 className="text-lg font-semibold text-[var(--text)]" id="modal-title">
            {title}
          </h2>
          <IconButton aria-label="Close modal" icon={<FiX aria-hidden="true" />} onClick={onClose} />
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
