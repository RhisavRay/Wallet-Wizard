'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import { Budget, Category } from '@/types'
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
  const { state, dispatch } = useApp()
  const isEditing = !!budget?.id

  // State for inline category creation
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

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
    
    // Check for existing budget for this category and month
    const existingBudget = state.budgets.find(b => 
      b.category_id === data.category_id && b.month === data.month
    )
    
    if (existingBudget && !budget?.id) {
      // Show error for duplicate budget
      alert(`A budget for ${category?.name} in ${data.month} already exists.`)
      return
    }
    
    // Create budget object without category_name (will be added by database join)
    const newBudget: Omit<Budget, 'category_name' | 'spent' | 'remaining'> = {
      id: budget?.id || generateId(),
      category_id: data.category_id,
      limit: data.limit,
      month: data.month,
      created_at: budget?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(newBudget as Budget)
  }

  // Handle creating new category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setIsCreatingCategory(true)
    try {
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
        type: 'expense', // Budgets are only for expense categories
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory })
      
      // Automatically select the newly created category
      setValue('category_id', newCategory.id)
      
      setNewCategoryName('')
      setShowCreateCategory(false)
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setIsCreatingCategory(false)
    }
  }

  // Handle "Add New" selection for categories
  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
      setShowCreateCategory(true)
    } else {
      setValue('category_id', value)
    }
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
              onValueChange={handleCategoryChange}
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
                <SelectItem value="add-new" className="text-blue-600 font-medium">
                  + Add New Category
                </SelectItem>
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

      {/* Inline dialog for creating new category */}
      <Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Expense Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter expense category name"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateCategory(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingCategory || !newCategoryName.trim()}>
                {isCreatingCategory ? 'Creating...' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
} 