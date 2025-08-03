'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useApp } from '@/context/AppContext'
import CategoryDialog from '@/components/categories/CategoryDialog'
import { Category } from '@/types'

// CategoriesTab component - manages income and expense categories
// This tab allows users to add, edit, and delete categories for organizing transactions
export default function CategoriesTab() {
  const { state, dispatch } = useApp()
  
  // Local state for UI controls
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  // Separate categories by type
  const incomeCategories = state.categories.filter(c => c.type === 'income')
  const expenseCategories = state.categories.filter(c => c.type === 'expense')

  // Handle opening category dialog for adding a new category
  const handleAddCategory = () => {
    setSelectedCategory(null)
    setIsCategoryDialogOpen(true)
  }

  // Handle opening category dialog for editing an existing category
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsCategoryDialogOpen(true)
  }

  // Handle closing the category dialog
  const handleCloseDialog = () => {
    setIsCategoryDialogOpen(false)
    setSelectedCategory(null)
  }

  // Handle saving a category (add or update)
  const handleSaveCategory = (category: Category) => {
    if (selectedCategory) {
      // Update existing category
      dispatch({
        type: 'UPDATE_CATEGORY',
        payload: category
      })
    } else {
      // Add new category
      dispatch({
        type: 'ADD_CATEGORY',
        payload: category
      })
    }
    handleCloseDialog()
  }

  // Handle deleting a category
  const handleDeleteCategory = (categoryId: string) => {
    dispatch({
      type: 'DELETE_CATEGORY',
      payload: categoryId
    })
    setCategoryToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Controls section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Manage your income and expense categories for better organization
        </div>
        <Button onClick={handleAddCategory} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Income Categories section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Income Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {incomeCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">💰</div>
              <p>No income categories found. Start by adding your first income category.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {incomeCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{category.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setCategoryToDelete(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Categories section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">💸</div>
              <p>No expense categories found. Start by adding your first expense category.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenseCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{category.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setCategoryToDelete(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category dialog for adding/editing categories */}
      <CategoryDialog
        open={isCategoryDialogOpen}
        category={selectedCategory}
        onClose={handleCloseDialog}
        onSave={handleSaveCategory}
      />

      {/* Delete confirmation dialog */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delete Category</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteCategory(categoryToDelete)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 