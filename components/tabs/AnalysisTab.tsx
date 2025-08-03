'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp, useFilteredTransactions } from '@/context/AppContext'
import PeriodSelector from '@/components/shared/PeriodSelector'
import FilterControls from '@/components/shared/FilterControls'
import { formatCurrency, calculateTotalIncome, calculateTotalExpenses, calculateBalance } from '@/lib/utils'
import IncomeExpenseOverview from '@/components/charts/IncomeExpenseOverview'
import ExpenseFlowChart from '@/components/charts/ExpenseFlowChart'
import AccountAnalysis from '@/components/charts/AccountAnalysis'

// AnalysisTab component - provides charts and visualizations for financial analysis
// This tab shows various breakdowns and trends of income, expenses, and account data
export default function AnalysisTab() {
  const { state } = useApp()
  const filteredTransactions = useFilteredTransactions()
  
  // Local state for chart interactions
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Calculate summary values based on filtered transactions
  const totalIncome = calculateTotalIncome(filteredTransactions)
  const totalExpenses = calculateTotalExpenses(filteredTransactions)
  const balance = calculateBalance(filteredTransactions)

  return (
    <div className="space-y-6">
      {/* Header section with summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        {/* Expense card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        {/* Balance card - only shown when Show Total is enabled */}
        {state.filterState.showTotal && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PeriodSelector />
        <FilterControls />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income/Expense Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income/Expense Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseOverview 
              transactions={filteredTransactions}
              onCategoryClick={setSelectedCategory}
            />
          </CardContent>
        </Card>

        {/* Account Analysis Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Account Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountAnalysis transactions={filteredTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Expense Flow Chart - Full width */}
      <Card>
        <CardHeader>
          <CardTitle>Expense/Income Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseFlowChart 
            transactions={filteredTransactions}
            period={state.filterState.period}
          />
        </CardContent>
      </Card>

      {/* Category breakdown when a category is selected */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown: {selectedCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Detailed breakdown for {selectedCategory} will be implemented here.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 