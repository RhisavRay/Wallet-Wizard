'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Transaction } from '@/types'

// CategoryBreakdown component - shows all transactions for a selected category
// This component displays detailed transaction information when a category is clicked
interface CategoryBreakdownProps {
  category: string
  transactions: Transaction[]
  analysisType: 'income' | 'expense'
  onEditTransaction?: (transaction: Transaction) => void
  onDeleteTransaction?: (transactionId: string) => void
  showHeader?: boolean
}

export default function CategoryBreakdown({ 
  category, 
  transactions, 
  analysisType,
  onEditTransaction,
  onDeleteTransaction,
  showHeader = true
}: CategoryBreakdownProps) {
  // Local state for delete confirmation
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  // Filter transactions for the selected category and type
  const categoryTransactions = transactions.filter(t => 
    t.category === category && t.type === analysisType
  )

  // Calculate total for this category
  const categoryTotal = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)

  // Handle delete confirmation
  const handleDeleteConfirm = (transactionId: string) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(transactionId)
    }
    setTransactionToDelete(null)
  }

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setTransactionToDelete(null)
  }

  // If no transactions, show empty state
  if (categoryTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-4xl mb-2">📊</div>
        <p>No {analysisType} transactions found for {category}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary - only show if showHeader is true */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <h3 className="font-semibold text-lg">{category}</h3>
            <p className="text-sm text-muted-foreground">
              {categoryTransactions.length} transaction{categoryTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${analysisType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(categoryTotal)}
            </div>
            <div className="text-sm text-muted-foreground">
              Total {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}
            </div>
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground">Transactions</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categoryTransactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending
            .map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {transaction.note || `${analysisType} transaction`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.account} • {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 text-right">
                    <div className={`font-semibold ${analysisType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {analysisType === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  
                  {/* Actions dropdown */}
                  {(onEditTransaction || onDeleteTransaction) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEditTransaction && (
                          <DropdownMenuItem onClick={() => onEditTransaction(transaction)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDeleteTransaction && (
                          <DropdownMenuItem 
                            onClick={() => setTransactionToDelete(transaction.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4">
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
          </div>
        </div>
      )}
    </div>
  )
} 