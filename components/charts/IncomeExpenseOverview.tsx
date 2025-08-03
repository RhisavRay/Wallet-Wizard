'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { Transaction } from '@/types'

// IncomeExpenseOverview component - pie chart showing income vs expenses
// This chart visualizes the proportion of income to expenses in the selected period
interface IncomeExpenseOverviewProps {
  transactions: Transaction[]
  onCategoryClick?: (category: string) => void
}

export default function IncomeExpenseOverview({ 
  transactions, 
  onCategoryClick 
}: IncomeExpenseOverviewProps) {
  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Prepare data for the pie chart
  const data = [
    {
      name: 'Income',
      value: totalIncome,
      color: '#22c55e' // green-500
    },
    {
      name: 'Expenses',
      value: totalExpenses,
      color: '#ef4444' // red-500
    }
  ].filter(item => item.value > 0) // Only show non-zero values

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => [
    formatCurrency(value),
    name
  ]

  // Handle pie segment click
  const handlePieClick = (data: any) => {
    if (onCategoryClick && data.name) {
      onCategoryClick(data.name)
    }
  }

  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available for this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            onClick={handlePieClick}
            style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={formatTooltip} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary text */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <div className="flex justify-center space-x-4">
          <span>Income: {formatCurrency(totalIncome)}</span>
          <span>Expenses: {formatCurrency(totalExpenses)}</span>
        </div>
      </div>
    </div>
  )
} 