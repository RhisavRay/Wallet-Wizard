'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate, getTransactionTypeColor, getTransactionTypeBgColor } from '@/lib/utils'
import { Transaction } from '@/types'

// TransactionList component - displays all transactions in a list format
// Each transaction shows amount, type, category, account, date, and note
interface TransactionListProps {
  transactions: Transaction[]
  onEditTransaction: (transaction: Transaction) => void
  onDeleteTransaction: (transactionId: string) => void
}

export default function TransactionList({ 
  transactions, 
  onEditTransaction, 
  onDeleteTransaction 
}: TransactionListProps) {
  // Local state for confirmation dialog
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  // Handle delete confirmation
  const handleDeleteConfirm = (transactionId: string) => {
    onDeleteTransaction(transactionId)
    setTransactionToDelete(null)
  }

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setTransactionToDelete(null)
  }

  // If no transactions, show empty state
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No transactions found
            </h3>
            <p className="text-muted-foreground">
              Start by adding your first transaction to track your finances.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {/* Transaction list header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
        <div className="col-span-3">Description</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">Account</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Transaction items */}
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Description and amount */}
              <div className="col-span-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {transaction.note || `${transaction.type} transaction`}
                    </div>
                    <div className={`text-lg font-bold ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction type */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeBgColor(transaction.type)}`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </div>

              {/* Category */}
              <div className="col-span-2">
                <span className="text-sm text-foreground">
                  {transaction.category}
                </span>
              </div>

              {/* Account */}
              <div className="col-span-2">
                <span className="text-sm text-foreground">
                  {transaction.account}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-2">
                <span className="text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditTransaction(transaction)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTransactionToDelete(transaction.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete confirmation dialog */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delete Transaction</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleDeleteCancel}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteConfirm(transactionToDelete)}
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