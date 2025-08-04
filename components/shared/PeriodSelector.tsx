'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp, useCurrentPeriodText } from '@/context/AppContext'
import { PeriodType } from '@/types'

// PeriodSelector component - allows users to select different time periods and navigate between them
// This component is used across multiple tabs (Records, Analysis) for consistent period selection
export default function PeriodSelector() {
  const { state, dispatch } = useApp()
  const currentPeriodText = useCurrentPeriodText()
  
  // Local state for the period selector dropdown
  const [isPeriodOpen, setIsPeriodOpen] = useState(false)

  // Handle period type change (daily, weekly, monthly, etc.)
  const handlePeriodChange = (period: string) => {
    dispatch({
      type: 'SET_FILTER_STATE',
      payload: { period: period as PeriodType }
    })
  }

  // Navigate to previous period
  const handlePreviousPeriod = () => {
    const newDate = new Date(state.currentPeriod)
    switch (state.filterState.period) {
      case 'daily':
        newDate.setDate(newDate.getDate() - 1)
        break
      case 'weekly':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'monthly':
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case '3months':
        newDate.setMonth(newDate.getMonth() - 3)
        break
      case '4months':
        newDate.setMonth(newDate.getMonth() - 4)
        break
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() - 1)
        break
    }
    dispatch({ type: 'SET_CURRENT_PERIOD', payload: newDate })
  }

  // Navigate to next period
  const handleNextPeriod = () => {
    const newDate = new Date(state.currentPeriod)
    switch (state.filterState.period) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1)
        break
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case '3months':
        newDate.setMonth(newDate.getMonth() + 3)
        break
      case '4months':
        newDate.setMonth(newDate.getMonth() + 4)
        break
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + 1)
        break
    }
    dispatch({ type: 'SET_CURRENT_PERIOD', payload: newDate })
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Previous period button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousPeriod}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Current period display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-foreground">
          {currentPeriodText}
        </span>
      </div>

      {/* Period type selector */}
      <Select
        value={state.filterState.period}
        onValueChange={handlePeriodChange}
        open={isPeriodOpen}
        onOpenChange={setIsPeriodOpen}
      >
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="3months">3 Months</SelectItem>
          <SelectItem value="4months">4 Months</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>

      {/* Next period button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextPeriod}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 