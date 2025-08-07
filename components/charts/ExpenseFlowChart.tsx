'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

// Calendar Grid component to show daily transaction data
function CalendarGrid({ 
  transactions, 
  period, 
  currentPeriod, 
  analysisType 
}: {
  transactions: Transaction[]
  period: PeriodType
  currentPeriod: Date
  analysisType: 'income' | 'expense'
}) {
  // Only show calendar for daily, weekly, and monthly periods
  if (!['daily', 'weekly', 'monthly'].includes(period)) {
    return null
  }

  const { start, end } = getDateRange(period, currentPeriod)
  const filteredTransactions = transactions.filter(t => t.type === analysisType)
  
  // Generate calendar data
  const generateCalendarData = () => {
    const calendarData: Array<{
      day: number
      date: string
      amount: number
      hasTransaction: boolean
      isEmpty?: boolean
    }> = []
    
    if (period === 'daily') {
      // Single day
      const currentDate = new Date(start)
      const dateStr = currentDate.toISOString().split('T')[0]
      const amount = filteredTransactions
        .filter(t => t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0)
      
      calendarData.push({
        day: currentDate.getDate(),
        date: dateStr,
        amount,
        hasTransaction: amount > 0
      })
    } else if (period === 'weekly') {
      // 7 days of the week
      const currentDate = new Date(start)
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate)
        date.setDate(currentDate.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        const amount = filteredTransactions
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0)
        
        calendarData.push({
          day: date.getDate(),
          date: dateStr,
          amount,
          hasTransaction: amount > 0
        })
      }
    } else if (period === 'monthly') {
      // All days of the month with proper alignment
      const currentDate = new Date(start)
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      // Add empty cells for days before the first day of the month
      const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
      for (let i = 0; i < firstDayWeekday; i++) {
        calendarData.push({
          day: 0,
          date: '',
          amount: 0,
          hasTransaction: false,
          isEmpty: true
        })
      }
      
      // Add all days of the month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
        const dateStr = date.toISOString().split('T')[0]
        const amount = filteredTransactions
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0)
        
        calendarData.push({
          day: i,
          date: dateStr,
          amount,
          hasTransaction: amount > 0
        })
      }
    }
    
    return calendarData
  }

  const calendarData = generateCalendarData()
  
  if (calendarData.length === 0) {
    return null
  }

  // Get month name for header
  const monthName = new Date(start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // For weekly view, show day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="mt-6">
      <div className="w-full">
        {/* Day names for all views */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day, index) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className={`grid ${
          period === 'daily' ? 'grid-cols-1' : 
          period === 'weekly' ? 'grid-cols-7' : 
          'grid-cols-7' // Monthly view - 7 columns
        } border border-gray-300 divide-x divide-gray-300`}>
          {calendarData.map((item, index) => {
            // Determine background styling based on transaction types
            let bgClass = 'bg-muted/30' // Default for no transactions
            let diagonalClass = ''
            
            if (!item.isEmpty && item.hasTransaction) {
              bgClass = analysisType === 'income' ? 'bg-green-100' : 'bg-red-100'
            } else if (item.isEmpty) {
              bgClass = 'bg-gray-50'
            }
            
            return (
              <div
                key={item.date || `empty-${index}`}
                className={`
                  h-16 p-2 text-center relative
                  ${bgClass}
                  ${diagonalClass}
                  ${index >= 7 ? 'border-t border-gray-300' : ''}
                `}
              >
                {!item.isEmpty && (
                  <>
                    <div className="text-sm font-medium">
                      {item.day}
                    </div>
                    {item.hasTransaction && (
                      <div className="text-xs font-medium mt-1">
                        <span className={`
                          ${analysisType === 'income' ? 'text-green-700' : ''}
                          ${analysisType === 'expense' ? 'text-red-700' : ''}
                        `}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
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
    <div>
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
      
      {/* Calendar Grid */}
      <CalendarGrid 
        transactions={transactions}
        period={period}
        currentPeriod={currentPeriod}
        analysisType={analysisType}
      />
    </div>
  )
} 