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
import { Transaction, TransactionFormData } from '@/types'
import { generateId } from '@/lib/utils'

// TransactionDialog component - modal dialog for adding and editing transactions
// This component provides a form interface for creating and modifying transaction data
interface TransactionDialogProps {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
  onSave: (transaction: Transaction) => void
}

export default function TransactionDialog({
  open,
  transaction,
  onClose,
  onSave
}: TransactionDialogProps) {
  const { state } = useApp()
  const isEditing = !!transaction

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

  // Reset form when dialog opens/closes or transaction changes
  useEffect(() => {
    if (open) {
      if (transaction) {
        // Editing existing transaction - populate form with current data
        setValue('amount', transaction.amount)
        setValue('type', transaction.type)
        setValue('category', transaction.category)
        setValue('account', transaction.account)
        setValue('date', transaction.date)
        setValue('note', transaction.note || '')
      } else {
        // Adding new transaction - set defaults
        setValue('amount', 0)
        setValue('type', 'expense')
        setValue('category', '')
        setValue('account', '')
        setValue('date', new Date().toISOString().split('T')[0])
        setValue('note', '')
      }
    } else {
      // Reset form when dialog closes
      reset()
    }
  }, [open, transaction, setValue, reset])

  // Handle form submission
  const onSubmit = (data: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: transaction?.id || generateId(),
      amount: data.amount,
      type: data.type,
      category: data.category,
      account: data.account,
      date: data.date,
      note: data.note || undefined,
      created_at: transaction?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(newTransaction)
  }

  // Get available categories and accounts for the form
  const incomeCategories = state.categories.filter(c => c.type === 'income')
  const expenseCategories = state.categories.filter(c => c.type === 'expense')
  const categories = transactionType === 'income' ? incomeCategories : expenseCategories

  return (
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
                min: { value: 0, message: 'Amount must be positive' }
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

          {/* Category field */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
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
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Account field */}
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select
              value={watch('account')}
              onValueChange={(value) => setValue('account', value)}
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
              </SelectContent>
            </Select>
            {errors.account && (
              <p className="text-sm text-red-500">{errors.account.message}</p>
            )}
          </div>

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
  )
} 