'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Account } from '@/types'
import { generateId } from '@/lib/utils'

// AccountDialog component - modal dialog for adding and editing financial accounts
// This component provides a form interface for creating and modifying account data
interface AccountDialogProps {
  open: boolean
  account: Account | null
  onClose: () => void
  onSave: (account: Account) => void
}

export default function AccountDialog({
  open,
  account,
  onClose,
  onSave
}: AccountDialogProps) {
  const isEditing = !!account?.id

  // Form setup using react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<{ name: string; initial_balance: number }>()

  // Reset form when dialog opens/closes or account changes
  useEffect(() => {
    if (open) {
      if (account) {
        // Editing existing account - populate form with current data
        setValue('name', account.name)
        setValue('initial_balance', account.initial_balance)
      } else {
        // Adding new account - set defaults
        setValue('name', '')
        setValue('initial_balance', 0)
      }
    } else {
      // Reset form when dialog closes
      reset()
    }
  }, [open, account, setValue, reset])

  // Handle form submission
  const onSubmit = (data: { name: string; initial_balance: number }) => {
    const newAccount: Account = {
      id: account?.id || generateId(),
      name: data.name,
      initial_balance: data.initial_balance,
      current_balance: account?.current_balance || data.initial_balance,
      created_at: account?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(newAccount)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Account' : 'Add Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Account name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Chase Bank, Cash, Credit Card"
              {...register('name', { 
                required: 'Account name is required',
                minLength: { value: 2, message: 'Account name must be at least 2 characters' }
              })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Initial balance field */}
          <div className="space-y-2">
            <Label htmlFor="initial_balance">Initial Balance</Label>
            <Input
              id="initial_balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('initial_balance', { 
                required: 'Initial balance is required',
                valueAsNumber: true
              })}
              className={errors.initial_balance ? 'border-red-500' : ''}
            />
            {errors.initial_balance && (
              <p className="text-sm text-red-500">{errors.initial_balance.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the current balance of this account
            </p>
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