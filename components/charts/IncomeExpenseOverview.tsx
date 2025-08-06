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

// Predefined color palette for categories
const CATEGORY_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#F97316', // orange-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
  '#F43F5E', // rose-500
  '#A855F7', // purple-500
  '#EAB308', // yellow-500
  '#22D3EE', // light-blue-500
  '#4ADE80', // light-green-500
  '#FB7185', // light-pink-500
  '#FBBF24', // light-yellow-500
  '#34D399', // light-emerald-500
  '#60A5FA', // light-blue-400
]

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

  // Prepare data for the pie chart - sorted by amount descending
  const data = Object.entries(categoryData)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
    .filter(item => item.value > 0) // Only show non-zero values
    .sort((a, b) => b.value - a.value) // Sort by amount descending

  // Assign colors based on sorted order (highest amount gets first color)
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }))

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
  if (dataWithColors.length === 0) {
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
    <div>
      <div className="flex items-start space-x-4">
        {/* Pie chart on the left */}
        <div className="flex-1 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithColors}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                onClick={handlePieClick}
                style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
              >
                {dataWithColors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend on the right */}
        <div className="flex-shrink-0 w-48 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {dataWithColors.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{entry.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatCurrency(entry.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Summary text */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <div className="flex justify-center space-x-4">
          <span>Total {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}: {formatCurrency(dataWithColors.reduce((sum, item) => sum + item.value, 0))}</span>
        </div>
      </div>
    </div>
  )
} 