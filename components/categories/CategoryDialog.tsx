'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Category } from '@/types'
import { generateId } from '@/lib/utils'

// CategoryDialog component - modal dialog for adding and editing categories
// This component provides a form interface for creating and modifying category data
interface CategoryDialogProps {
  open: boolean
  category: Category | null
  onClose: () => void
  onSave: (category: Category) => void
}

export default function CategoryDialog({
  open,
  category,
  onClose,
  onSave
}: CategoryDialogProps) {
  const isEditing = !!category?.id

  // Form setup using react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<{ name: string; type: 'income' | 'expense' }>()

  // Watch the selected type
  const selectedType = watch('type')

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        // Editing existing category - populate form with current data
        setValue('name', category.name)
        setValue('type', category.type)
      } else {
        // Adding new category - set defaults
        setValue('name', '')
        setValue('type', 'expense')
      }
    } else {
      // Reset form when dialog closes
      reset()
    }
  }, [open, category, setValue, reset])

  // Handle form submission
  const onSubmit = (data: { name: string; type: 'income' | 'expense' }) => {
    const newCategory: Category = {
      id: category?.id || generateId(),
      name: data.name,
      type: data.type,
      created_at: category?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(newCategory)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Add Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="e.g., Groceries, Salary, Entertainment"
              {...register('name', { 
                required: 'Category name is required',
                minLength: { value: 2, message: 'Category name must be at least 2 characters' }
              })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Category type field */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as 'income' | 'expense')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
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