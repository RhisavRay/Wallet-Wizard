'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'

// MonthSelector component - specifically for Budget tab
// This component only handles monthly navigation without affecting other tabs
export default function MonthSelector() {
  const { state, dispatch } = useApp()
  
  // Format the current period as month and year
  const currentMonthText = state.currentPeriod.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  // Navigate to previous month
  const handlePreviousMonth = () => {
    const newDate = new Date(state.currentPeriod)
    newDate.setMonth(newDate.getMonth() - 1)
    dispatch({ type: 'SET_CURRENT_PERIOD', payload: newDate })
  }

  // Navigate to next month
  const handleNextMonth = () => {
    const newDate = new Date(state.currentPeriod)
    newDate.setMonth(newDate.getMonth() + 1)
    dispatch({ type: 'SET_CURRENT_PERIOD', payload: newDate })
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Previous month button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Current month display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-foreground">
          {currentMonthText}
        </span>
      </div>

      {/* Next month button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 