'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp, useFilteredTransactions } from '@/context/AppContext'
import PeriodSelector from '@/components/shared/PeriodSelector'
import FilterControls from '@/components/shared/FilterControls'
import TransactionList from '@/components/transactions/TransactionList'
import TransactionDialog from '@/components/transactions/TransactionDialog'
import { formatCurrency, calculateTotalIncome, calculateTotalExpenses, calculateBalance } from '@/lib/utils'
import { Transaction } from '@/types'

// RecordsTab component - main tab for viewing and managing all transactions
// This is the heart of the application where users can view, add, edit, and delete transactions
export default function RecordsTab() {
  const { state, dispatch } = useApp()
  const filteredTransactions = useFilteredTransactions()
  
  // Local state for UI controls
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate summary values based on filtered transactions
  const totalIncome = calculateTotalIncome(filteredTransactions)
  const totalExpenses = calculateTotalExpenses(filteredTransactions)
  const balance = calculateBalance(filteredTransactions)

  // Handle search input change
  // Updates the global filter state with the search query
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    dispatch({
      type: 'SET_FILTER_STATE',
      payload: { searchQuery: value }
    })
  }

  // Handle opening the transaction dialog for adding a new transaction
  const handleAddTransaction = () => {
    setSelectedTransaction(null)
    setIsTransactionDialogOpen(true)
  }

  // Handle opening the transaction dialog for editing an existing transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsTransactionDialogOpen(true)
  }

  // Handle closing the transaction dialog
  const handleCloseDialog = () => {
    setIsTransactionDialogOpen(false)
    setSelectedTransaction(null)
  }

  // Handle saving a transaction (add or update)
  const handleSaveTransaction = (transaction: Transaction) => {
    if (selectedTransaction) {
      // Update existing transaction
      dispatch({
        type: 'UPDATE_TRANSACTION',
        payload: transaction
      })
    } else {
      // Add new transaction
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: transaction
      })
    }
    handleCloseDialog()
  }

  // Handle deleting a transaction
  const handleDeleteTransaction = (transactionId: string) => {
    dispatch({
      type: 'DELETE_TRANSACTION',
      payload: transactionId
    })
  }

  return (
    <div className="space-y-6">
      {/* Header section with summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        {/* Expense card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        {/* Balance card - only shown when Show Total is enabled */}
        {state.filterState.showTotal && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Period selector and filter controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <PeriodSelector />
          <FilterControls />
        </div>

        {/* Right side - Search and Add button */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Search input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add transaction button */}
          <Button onClick={handleAddTransaction} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Transaction list */}
      <TransactionList
        transactions={filteredTransactions}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Transaction dialog for adding/editing transactions */}
      <TransactionDialog
        open={isTransactionDialogOpen}
        transaction={selectedTransaction}
        onClose={handleCloseDialog}
        onSave={handleSaveTransaction}
      />
    </div>
  )
} 