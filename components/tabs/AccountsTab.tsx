'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useApp, useFilteredTransactions } from '@/context/AppContext'
import AccountDialog from '@/components/accounts/AccountDialog'
import { formatCurrency, calculateTotalIncome, calculateTotalExpenses, calculateBalance } from '@/lib/utils'
import { Account } from '@/types'

// AccountsTab component - manages financial accounts and their balances
// This tab allows users to add, edit, and delete accounts, and view account balances
export default function AccountsTab() {
  const { state, dispatch } = useApp()
  const allTransactions = useFilteredTransactions()
  
  // Local state for UI controls
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)

  // Calculate account balances from transactions
  const accountsWithBalances = state.accounts.map(account => {
    const accountTransactions = allTransactions.filter(t => t.account === account.name)
    const balance = account.initial_balance + calculateBalance(accountTransactions)
    
    return {
      ...account,
      current_balance: balance
    }
  })

  // Calculate summary values
  const totalBalance = accountsWithBalances.reduce((sum, account) => sum + account.current_balance, 0)
  const totalIncome = calculateTotalIncome(allTransactions)
  const totalExpenses = calculateTotalExpenses(allTransactions)

  // Handle opening account dialog for adding a new account
  const handleAddAccount = () => {
    setSelectedAccount(null)
    setIsAccountDialogOpen(true)
  }

  // Handle opening account dialog for editing an existing account
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setIsAccountDialogOpen(true)
  }

  // Handle closing the account dialog
  const handleCloseDialog = () => {
    setIsAccountDialogOpen(false)
    setSelectedAccount(null)
  }

  // Handle saving an account (add or update)
  const handleSaveAccount = (account: Account) => {
    if (selectedAccount) {
      // Update existing account
      dispatch({
        type: 'UPDATE_ACCOUNT',
        payload: account
      })
    } else {
      // Add new account
      dispatch({
        type: 'ADD_ACCOUNT',
        payload: account
      })
    }
    handleCloseDialog()
  }

  // Handle deleting an account
  const handleDeleteAccount = (accountId: string) => {
    dispatch({
      type: 'DELETE_ACCOUNT',
      payload: accountId
    })
    setAccountToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Header section with summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>

        {/* Total Income card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        {/* Total Expense card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Total Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Manage your financial accounts and track their balances
        </div>
        <Button onClick={handleAddAccount} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Accounts list */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accountsWithBalances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">🏦</div>
              <p>No accounts found. Start by adding your first account.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accountsWithBalances.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{account.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setAccountToDelete(account.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Initial Balance:</span>
                        <span>{formatCurrency(account.initial_balance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current Balance:</span>
                        <span className={`font-medium ${account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.current_balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account dialog for adding/editing accounts */}
      <AccountDialog
        open={isAccountDialogOpen}
        account={selectedAccount}
        onClose={handleCloseDialog}
        onSave={handleSaveAccount}
      />

      {/* Delete confirmation dialog */}
      {accountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delete Account</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this account? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAccountToDelete(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteAccount(accountToDelete)}
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