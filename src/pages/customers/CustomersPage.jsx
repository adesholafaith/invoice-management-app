import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiRefreshCw, FiUsers } from 'react-icons/fi'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Skeleton } from '../../components/feedback/Skeleton'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { CustomerForm } from '../../features/customers/components/CustomerForm'
import { CustomerList } from '../../features/customers/components/CustomerList'
import { useCustomers } from '../../features/customers/hooks/useCustomers'

export function CustomersPage() {
  const { customers, deleteCustomer, error, isLoading, refetch, saveCustomer } = useCustomers()
  const [customerToDelete, setClientToDelete] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function openCreateModal() {
    setEditingClient(null)
    setIsFormOpen(true)
  }

  function openEditModal(customer) {
    setEditingClient(customer)
    setIsFormOpen(true)
  }

  function closeFormModal() {
    setIsFormOpen(false)
    setEditingClient(null)
  }

  async function handleSaveClient(values) {
    setIsSubmitting(true)

    try {
      await saveCustomer(values, editingClient?.id)
      toast.success(editingClient ? 'Client updated.' : 'Client created.')
      closeFormModal()
    } catch (saveError) {
      toast.error(saveError.message || 'Unable to save client.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteClient() {
    if (!customerToDelete) return

    setIsDeleteLoading(true)

    try {
      await deleteCustomer(customerToDelete.id)
      toast.success('Client deleted.')
      setClientToDelete(null)
    } catch (deleteError) {
      toast.error(deleteError.message || 'Unable to delete client.')
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Clients</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage billing profiles for the people and companies you invoice.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus aria-hidden="true" />
          Add client
        </Button>
      </div>

      {isLoading ? <ClientSkeleton /> : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          <h3 className="font-semibold">Unable to load clients</h3>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={refetch} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && customers.length === 0 ? (
        <EmptyState
          actionLabel="Add client"
          description="Create your first client so invoices can be attached to a billing profile."
          icon={<FiUsers aria-hidden="true" className="size-8" />}
          onAction={openCreateModal}
          title="No clients yet"
        />
      ) : null}

      {!isLoading && !error && customers.length > 0 ? (
        <CustomerList customers={customers} onDelete={setClientToDelete} onEdit={openEditModal} />
      ) : null}

      <Modal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        title={editingClient ? 'Edit client' : 'Add client'}
      >
        <CustomerForm
          customer={editingClient}
          isSubmitting={isSubmitting}
          onCancel={closeFormModal}
          onSubmit={handleSaveClient}
        />
      </Modal>

      <ConfirmDialog
        confirmLabel="Delete client"
        description={`Delete ${customerToDelete?.name || 'this client'}? This cannot be undone.`}
        isLoading={isDeleteLoading}
        isOpen={Boolean(customerToDelete)}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDeleteClient}
        title="Delete client"
      />
    </div>
  )
}

function ClientSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  )
}


