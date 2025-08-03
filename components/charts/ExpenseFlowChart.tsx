'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Transaction, PeriodType } from '@/types'

// ExpenseFlowChart component - line chart showing income and expenses over time
// This chart visualizes how income and expenses change across the selected period
interface ExpenseFlowChartProps {
  transactions: Transaction[]
  period: PeriodType
}

export default function ExpenseFlowChart({ 
  transactions, 
  period 
}: ExpenseFlowChartProps) {
  // Group transactions by date and calculate daily totals
  const groupedData = transactions.reduce((acc, transaction) => {
    const date = transaction.date
    if (!acc[date]) {
      acc[date] = { date, income: 0, expense: 0, balance: 0 }
    }
    
    if (transaction.type === 'income') {
      acc[date].income += transaction.amount
    } else if (transaction.type === 'expense') {
      acc[date].expense += transaction.amount
    }
    
    acc[date].balance = acc[date].income - acc[date].expense
    return acc
  }, {} as Record<string, { date: string; income: number; expense: number; balance: number }>)

  // Convert to array and sort by date
  const chartData = Object.values(groupedData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      date: formatDate(item.date)
    }))

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
          <div className="text-4xl mb-2">📈</div>
          <p>No data available for this period</p>
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
            dataKey="income" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 