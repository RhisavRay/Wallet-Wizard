'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate, getDateRange } from '@/lib/utils'
import { Transaction, PeriodType } from '@/types'

// ExpenseFlowChart component - line chart showing income or expenses over time
// This chart visualizes how income or expenses change across the selected period
interface ExpenseFlowChartProps {
  transactions: Transaction[]
  period: PeriodType
  currentPeriod: Date
  analysisType?: 'income' | 'expense'
}

export default function ExpenseFlowChart({ 
  transactions, 
  period,
  currentPeriod,
  analysisType = 'expense'
}: ExpenseFlowChartProps) {
  // Filter transactions by type
  const filteredTransactions = transactions.filter(t => t.type === analysisType)
  
  // Get the date range for the current period using the selected period date
  const { start, end } = getDateRange(period, currentPeriod)
  
  // Generate data points based on period type
  const generateDataPoints = () => {
    const dataPoints: Array<{ date: string; amount: number; displayDate: string }> = []
    
    if (period === 'daily') {
      // Single day - just show the current date
      const currentDate = new Date()
      const dateStr = currentDate.toISOString().split('T')[0]
      const amount = filteredTransactions
        .filter(t => t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0)
      
      dataPoints.push({
        date: dateStr,
        amount,
        displayDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    } else if (period === 'weekly') {
      // Generate data for all 7 days of the week
      const currentDate = new Date(start)
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate)
        date.setDate(currentDate.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        const amount = filteredTransactions
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0)
        
        dataPoints.push({
          date: dateStr,
          amount,
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })
      }
    } else if (period === 'monthly') {
      // Generate data for every day of the month
      const currentDate = new Date(start)
      const lastDay = new Date(end).getDate()
      
      for (let i = 1; i <= lastDay; i++) {
        const date = new Date(currentDate)
        date.setDate(i)
        const dateStr = date.toISOString().split('T')[0]
        const amount = filteredTransactions
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0)
        
        dataPoints.push({
          date: dateStr,
          amount,
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })
      }
    } else {
      // For 3months, 4months, yearly - show monthly data with year
      const currentDate = new Date(start)
      const endDate = new Date(end)
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        const amount = filteredTransactions
          .filter(t => {
            const transactionDate = new Date(t.date)
            return transactionDate >= monthStart && transactionDate <= monthEnd
          })
          .reduce((sum, t) => sum + t.amount, 0)
        
        dataPoints.push({
          date: dateStr,
          amount,
          displayDate: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        })
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }
    
    return dataPoints
  }

  const chartData = generateDataPoints().map(item => ({
    ...item,
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
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            minTickGap={5}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip formatter={formatTooltip} />
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
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 