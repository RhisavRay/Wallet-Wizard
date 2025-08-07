'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { Transaction } from '@/types'

// AccountAnalysis component - bar chart showing account contributions
// This chart visualizes how each account contributes to total income and expenses
interface AccountAnalysisProps {
  transactions: Transaction[]
  accounts: Array<{ id: string; name: string; initial_balance: number }>
}

export default function AccountAnalysis({ transactions, accounts }: AccountAnalysisProps) {
  // Group transactions by account and calculate totals
  const accountData = transactions.reduce((acc, transaction) => {
    const account = transaction.account
    if (!acc[account]) {
      acc[account] = { account, income: 0, expense: 0 }
    }
    
    if (transaction.type === 'income') {
      acc[account].income += transaction.amount
    } else if (transaction.type === 'expense') {
      acc[account].expense += transaction.amount
    }
    
    return acc
  }, {} as Record<string, { account: string; income: number; expense: number }>)

  // Create chart data for all accounts, including those with no transactions
  const chartData = accounts.map(account => ({
    account: account.name,
    income: accountData[account.name]?.income || 0,
    expense: accountData[account.name]?.expense || 0
  })).sort((a, b) => (b.income + b.expense) - (a.income + a.expense))

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => [
    formatCurrency(value),
    name.charAt(0).toUpperCase() + name.slice(1)
  ]

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">🏦</div>
          <p>No account data available for this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="account" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip formatter={formatTooltip} />
          <Legend />
          <Bar 
            dataKey="income" 
            fill="#22c55e" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="expense" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 