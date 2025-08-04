'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Transaction, PeriodType } from '@/types'

// ExpenseFlowChart component - line chart showing income or expenses over time
// This chart visualizes how income or expenses change across the selected period
interface ExpenseFlowChartProps {
  transactions: Transaction[]
  period: PeriodType
  analysisType?: 'income' | 'expense'
}

export default function ExpenseFlowChart({ 
  transactions, 
  period,
  analysisType = 'expense'
}: ExpenseFlowChartProps) {
  // Filter transactions by type
  const filteredTransactions = transactions.filter(t => t.type === analysisType)
  
  // Group transactions by date and calculate daily totals
  const groupedData = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.date
    if (!acc[date]) {
      acc[date] = { date, amount: 0 }
    }
    
    acc[date].amount += transaction.amount
    return acc
  }, {} as Record<string, { date: string; amount: number }>)

  // Convert to array and sort by date
  const chartData = Object.values(groupedData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      date: formatDate(item.date),
      [analysisType]: item.amount
    }))

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => [
    formatCurrency(value),
    analysisType.charAt(0).toUpperCase() + analysisType.slice(1)
  ]

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No {analysisType} data available for this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
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
          <Line 
            type="monotone" 
            dataKey={analysisType}
            stroke={analysisType === 'income' ? '#22c55e' : '#ef4444'} // green for income, red for expense
            strokeWidth={2}
            dot={{ 
              fill: analysisType === 'income' ? '#22c55e' : '#ef4444', 
              strokeWidth: 2, 
              r: 4 
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 