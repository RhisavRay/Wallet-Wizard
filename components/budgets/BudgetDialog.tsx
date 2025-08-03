'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import { Budget } from '@/types'
import { generateId } from '@/lib/utils'

// BudgetDialog component - modal dialog for adding and editing budget limits
// This component provides a form interface for setting monthly budget limits
interface BudgetDialogProps {
  open: boolean
  budget: Budget | null
  onClose: () => void
  onSave: (budget: Budget) => void
}

export default function BudgetDialog({
  open,
  budget,
  onClose,
  onSave
}: BudgetDialogProps) {
  const { state } = useApp()
  const isEditing = !!budget?.id

  // Form setup using react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<{ category_id: string; limit: number; month: string }>()

  // Watch the selected category
  const selectedCategoryId = watch('category_id')

  // Reset form when dialog opens/closes or budget changes
  useEffect(() => {
    if (open) {
      if (budget) {
        // Editing existing budget - populate form with current data
        setValue('category_id', budget.category_id)
        setValue('limit', budget.limit)
        setValue('month', budget.month)
      } else {
        // Adding new budget - set defaults
        setValue('category_id', '')
        setValue('limit', 0)
        setValue('month', new Date().toISOString().slice(0, 7))
      }
    } else {
      // Reset form when dialog closes
      reset()
    }
  }, [open, budget, setValue, reset])

  // Handle form submission
  const onSubmit = (data: { category_id: string; limit: number; month: string }) => {
    const category = state.categories.find(c => c.id === data.category_id)
    
    const newBudget: Budget = {
      id: budget?.id || generateId(),
      category_id: data.category_id,
      category_name: category?.name || '',
      limit: data.limit,
      spent: budget?.spent || 0,
      remaining: data.limit - (budget?.spent || 0),
      month: data.month,
      created_at: budget?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(newBudget)
  }

  // Get available expense categories for the form
  const expenseCategories = state.categories.filter(c => c.type === 'expense')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Budget' : 'Add Budget'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category field */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setValue('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-500">{errors.category_id.message}</p>
            )}
          </div>

          {/* Limit field */}
          <div className="space-y-2">
            <Label htmlFor="limit">Monthly Limit</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              min="0"
              {...register('limit', { 
                required: 'Limit is required',
                min: { value: 0, message: 'Limit must be positive' }
              })}
              className={errors.limit ? 'border-red-500' : ''}
            />
            {errors.limit && (
              <p className="text-sm text-red-500">{errors.limit.message}</p>
            )}
          </div>

          {/* Month field */}
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              {...register('month', { required: 'Month is required' })}
              className={errors.month ? 'border-red-500' : ''}
            />
            {errors.month && (
              <p className="text-sm text-red-500">{errors.month.message}</p>
            )}
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