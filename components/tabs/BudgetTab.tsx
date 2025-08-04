'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useApp, useFilteredTransactions } from '@/context/AppContext'
import MonthSelector from '@/components/shared/MonthSelector'
import FilterControls from '@/components/shared/FilterControls'
import BudgetDialog from '@/components/budgets/BudgetDialog'
import { formatCurrency, calculateTotalExpenses } from '@/lib/utils'
import { Budget } from '@/types'

// BudgetTab component - manages monthly budgets for expense categories
// This tab allows users to set, track, and manage budget limits for different expense categories
export default function BudgetTab() {
  const { state, dispatch } = useApp()
  const filteredTransactions = useFilteredTransactions()
  
  // Local state for UI controls
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)

  // Calculate spent amounts for each budget based on actual transactions
  const calculateBudgetSpent = (categoryName: string) => {
    return filteredTransactions
      .filter(transaction => 
        transaction.type === 'expense' && 
        transaction.category === categoryName
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }

  // Get selected month in YYYY-MM format from the period selector
  const selectedMonth = state.currentPeriod.toISOString().slice(0, 7)
  
  // Calculate budget data with dynamic spent amounts and populate category_name
  // Only show budgets for the selected month
  const budgetsWithSpent = state.budgets
    .filter(budget => budget.month === selectedMonth)
    .map(budget => {
      const category = state.categories.find(c => c.id === budget.category_id)
      const limit = Number(budget.limit)
      const spent = calculateBudgetSpent(category?.name || '')
      return {
        ...budget,
        category_name: category?.name || '',
        limit: limit,
        spent: spent,
        remaining: limit - spent
      }
    })

  const totalBudget = budgetsWithSpent.reduce((sum, budget) => sum + Number(budget.limit), 0)
  const totalSpent = budgetsWithSpent.reduce((sum, budget) => sum + Number(budget.spent), 0)

  // Get expense categories that don't have budgets for current month
  const budgetedCategories = budgetsWithSpent.map(budget => budget.category_name).filter(Boolean)
  const unbudgetedCategories = state.categories
    .filter(category => category.type === 'expense' && !budgetedCategories.includes(category.name))

  // Handle opening budget dialog for adding a new budget
  const handleAddBudget = () => {
    setSelectedBudget(null)
    setIsBudgetDialogOpen(true)
  }

  // Handle opening budget dialog for editing an existing budget
  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget)
    setIsBudgetDialogOpen(true)
  }

  // Handle closing the budget dialog
  const handleCloseDialog = () => {
    setIsBudgetDialogOpen(false)
    setSelectedBudget(null)
  }

  // Handle saving a budget (add or update)
  const handleSaveBudget = (budget: Budget) => {
    if (selectedBudget) {
      // Update existing budget
      dispatch({
        type: 'UPDATE_BUDGET',
        payload: budget
      })
    } else {
      // Add new budget
      dispatch({
        type: 'ADD_BUDGET',
        payload: budget
      })
    }
    handleCloseDialog()
  }

  // Handle deleting a budget
  const handleDeleteBudget = (budgetId: string) => {
    dispatch({
      type: 'DELETE_BUDGET',
      payload: budgetId
    })
    setBudgetToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Header section with summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Budget card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget)}
            </div>
          </CardContent>
        </Card>

        {/* Total Spent card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <MonthSelector />
        <Button onClick={handleAddBudget} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {/* Budgeted Categories section */}
      <Card>
        <CardHeader>
          <CardTitle>Budgeted Categories for {state.currentPeriod.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetsWithSpent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">💰</div>
              <p>No budgets set. Start by adding a budget for an expense category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetsWithSpent.map((budget) => {
                const progress = Math.min((budget.spent / budget.limit) * 100, 100)
                const isOverBudget = budget.spent > budget.limit
                
                return (
                  <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{budget.category_name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditBudget(state.budgets.find(b => b.id === budget.id)!)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Change Limit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setBudgetToDelete(budget.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Budget
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Spent: {formatCurrency(budget.spent)}</span>
                          <span>Limit: {formatCurrency(budget.limit)}</span>
                        </div>
                        
                        <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${isOverBudget ? 'bg-red-200' : ''}`}>
                          <div 
                            className={`h-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Remaining: {formatCurrency(budget.remaining)}</span>
                          {isOverBudget && (
                            <span className="text-red-600 font-medium">*Limit exceeded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Not Budgeted section */}
      <Card>
        <CardHeader>
          <CardTitle>Not Budgeted</CardTitle>
        </CardHeader>
        <CardContent>
          {unbudgetedCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>All expense categories have budgets set.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unbudgetedCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{category.name}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedBudget({
                        id: '',
                        category_id: category.id,
                        category_name: '', // Will be populated by database join
                        limit: 0,
                        spent: 0,
                        remaining: 0,
                        month: new Date().toISOString().slice(0, 7),
                        created_at: '',
                        updated_at: ''
                      })
                      setIsBudgetDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Set Budget
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget dialog for adding/editing budgets */}
      <BudgetDialog
        open={isBudgetDialogOpen}
        budget={selectedBudget}
        onClose={handleCloseDialog}
        onSave={handleSaveBudget}
      />

      {/* Delete confirmation dialog */}
      {budgetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Remove Budget</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to remove this budget? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setBudgetToDelete(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteBudget(budgetToDelete)}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 