'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useApp } from '@/context/AppContext'
import { Transaction, TransactionFormData, Category, Account } from '@/types'
import { generateId } from '@/lib/utils'

// TransactionDialog component - modal dialog for adding and editing transactions
// This component provides a form interface for creating and modifying transaction data
interface TransactionDialogProps {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
  onSave: (transaction: Transaction) => void
}

// Inline dialog for creating new categories
function CreateCategoryDialog({ 
  open, 
  onClose, 
  onSave, 
  type 
}: { 
  open: boolean
  onClose: () => void
  onSave: (category: Category) => void
  type: 'income' | 'expense'
}) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const newCategory: Category = {
        id: generateId(),
        name: name.trim(),
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await onSave(newCategory)
      setName('')
      onClose()
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New {type.charAt(0).toUpperCase() + type.slice(1)} Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type} category name`}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Inline dialog for creating new accounts
function CreateAccountDialog({ 
  open, 
  onClose, 
  onSave 
}: { 
  open: boolean
  onClose: () => void
  onSave: (account: Account) => void
}) {
  const [name, setName] = useState('')
  const [initialBalance, setInitialBalance] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const newAccount: Account = {
        id: generateId(),
        name: name.trim(),
        initial_balance: parseFloat(initialBalance) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await onSave(newAccount)
      setName('')
      setInitialBalance('0')
      onClose()
    } catch (error) {
      console.error('Error creating account:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter account name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialBalance">Initial Balance</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TransactionDialog({
  open,
  transaction,
  onClose,
  onSave
}: TransactionDialogProps) {
  const { state, dispatch } = useApp()
  const isEditing = !!transaction

  // State for inline dialogs
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense')
  const [pendingAccountField, setPendingAccountField] = useState<'account' | 'from_account' | 'to_account' | null>(null)

  // Form setup using react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormData>()

  // Watch the transaction type to show/hide relevant fields
  const transactionType = watch('type')
  const isTransfer = transactionType === 'transfer'

  // Reset form when dialog opens/closes or transaction changes
  useEffect(() => {
    if (open) {
      if (transaction) {
        // Editing existing transaction - populate form with current data
        setValue('amount', transaction.amount)
        setValue('type', transaction.type)
        setValue('category', transaction.category)
        setValue('account', transaction.account)
        setValue('from_account', transaction.from_account || '')
        setValue('to_account', transaction.to_account || '')
        setValue('date', transaction.date)
        setValue('note', transaction.note || '')
      } else {
        // Adding new transaction - set defaults
        setValue('amount', 0)
        setValue('type', 'expense')
        setValue('category', '')
        setValue('account', '')
        setValue('from_account', '')
        setValue('to_account', '')
        setValue('date', new Date().toISOString().split('T')[0])
        setValue('note', '')
      }
    } else {
      // Reset form when dialog closes
              reset()
        setShowCreateCategory(false)
        setShowCreateAccount(false)
        setPendingAccountField(null)
    }
  }, [open, transaction, setValue, reset])

  // Handle form submission
  const onSubmit = (data: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: transaction?.id || generateId(),
      amount: data.amount,
      type: data.type,
      category: isTransfer ? 'Transfer' : data.category,
      account: isTransfer ? '' : data.account,
      from_account: isTransfer ? data.from_account : undefined,
      to_account: isTransfer ? data.to_account : undefined,
      date: data.date,
      note: data.note || undefined,
      created_at: transaction?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(newTransaction)
  }

  // Handle creating new category
  const handleCreateCategory = async (category: Category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: category })
    // Automatically select the newly created category
    setValue('category', category.name)
  }

  // Handle creating new account
  const handleCreateAccount = async (account: Account) => {
    dispatch({ type: 'ADD_ACCOUNT', payload: account })
    // Automatically select the newly created account based on which field triggered the creation
    if (pendingAccountField) {
      setValue(pendingAccountField, account.name)
      setPendingAccountField(null)
    } else {
      setValue('account', account.name)
    }
  }

  // Handle "Add New" selection for categories
  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
      setCategoryType(transactionType as 'income' | 'expense')
      setShowCreateCategory(true)
    } else {
      setValue('category', value)
    }
  }

  // Handle "Add New" selection for accounts
  const handleAccountChange = (value: string) => {
    if (value === 'add-new') {
      setPendingAccountField('account')
      setShowCreateAccount(true)
    } else {
      setValue('account', value)
    }
  }

  // Handle "Add New" selection for transfer accounts
  const handleTransferAccountChange = (field: 'from_account' | 'to_account') => (value: string) => {
    if (value === 'add-new') {
      setPendingAccountField(field)
      setShowCreateAccount(true)
    } else {
      setValue(field, value)
    }
  }

  // Get available categories and accounts for the form
  const incomeCategories = state.categories.filter(c => c.type === 'income')
  const expenseCategories = state.categories.filter(c => c.type === 'expense')
  const categories = transactionType === 'income' ? incomeCategories : expenseCategories

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Transaction' : 'Add Transaction'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount field */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount must be positive' },
                  valueAsNumber: true
                })}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            {/* Transaction type field */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setValue('type', value as 'income' | 'expense' | 'transfer')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category field - only show for income/expense */}
            {!isTransfer && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={watch('category')}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="add-new" className="text-blue-600 font-medium">
                      + Add New Category
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            )}

            {/* Account field - only show for income/expense */}
            {!isTransfer && (
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select
                  value={watch('account')}
                  onValueChange={handleAccountChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.accounts.map((account) => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="add-new" className="text-blue-600 font-medium">
                      + Add New Account
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.account && (
                  <p className="text-sm text-red-500">{errors.account.message}</p>
                )}
              </div>
            )}

            {/* Transfer account fields - only show for transfers */}
            {isTransfer && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="from_account">From Account</Label>
                  <Select
                    value={watch('from_account')}
                    onValueChange={handleTransferAccountChange('from_account')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.accounts.map((account) => (
                        <SelectItem key={account.id} value={account.name}>
                          {account.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new" className="text-blue-600 font-medium">
                        + Add New Account
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.from_account && (
                    <p className="text-sm text-red-500">{errors.from_account.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to_account">To Account</Label>
                  <Select
                    value={watch('to_account')}
                    onValueChange={handleTransferAccountChange('to_account')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.accounts.map((account) => (
                        <SelectItem key={account.id} value={account.name}>
                          {account.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new" className="text-blue-600 font-medium">
                        + Add New Account
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.to_account && (
                    <p className="text-sm text-red-500">{errors.to_account.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Date field */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { required: 'Date is required' })}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* Note field */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note about this transaction..."
                {...register('note')}
                rows={3}
              />
            </div>

            {/* Form actions */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inline dialogs for creating new items */}
      <CreateCategoryDialog
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onSave={handleCreateCategory}
        type={categoryType}
      />

      <CreateAccountDialog
        open={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
        onSave={handleCreateAccount}
      />
    </>
  )
} 