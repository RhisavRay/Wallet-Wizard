'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { Transaction } from '@/types'

// IncomeExpenseOverview component - pie chart showing income or expense breakdown
// This chart visualizes the proportion of income or expenses by category in the selected period
interface IncomeExpenseOverviewProps {
  transactions: Transaction[]
  onCategoryClick?: (category: string) => void
  analysisType?: 'income' | 'expense'
}

export default function IncomeExpenseOverview({ 
  transactions, 
  onCategoryClick,
  analysisType = 'income'
}: IncomeExpenseOverviewProps) {
  // Filter transactions by type
  const filteredTransactions = transactions.filter(t => t.type === analysisType)
  
  // Group transactions by category
  const categoryData = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += transaction.amount
    return acc
  }, {} as Record<string, number>)

  // Prepare data for the pie chart
  const data = Object.entries(categoryData)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      color: analysisType === 'income' ? '#22c55e' : '#ef4444' // green for income, red for expense
    }))
    .filter(item => item.value > 0) // Only show non-zero values
    .sort((a, b) => b.value - a.value) // Sort by amount descending

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
          <p>No {analysisType} data available for this period</p>
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
          <span>Total {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}: {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}</span>
        </div>
      </div>
    </div>
  )
} 