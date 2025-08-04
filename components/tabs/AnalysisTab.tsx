'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  
  // Local state for chart interactions and analysis type selection
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('income-overview')

  // Calculate summary values based on filtered transactions
  const totalIncome = calculateTotalIncome(filteredTransactions)
  const totalExpenses = calculateTotalExpenses(filteredTransactions)
  const balance = calculateBalance(filteredTransactions)

  // Handle analysis type change
  const handleAnalysisChange = (value: string) => {
    setSelectedAnalysis(value)
    setSelectedCategory(null) // Reset category selection when changing analysis
  }

  // Render the selected analysis component
  const renderAnalysis = () => {
    switch (selectedAnalysis) {
      case 'income-overview':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Income Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseOverview 
                transactions={filteredTransactions}
                onCategoryClick={setSelectedCategory}
                analysisType="income"
              />
            </CardContent>
          </Card>
        )
      
      case 'expense-overview':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Expense Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseOverview 
                transactions={filteredTransactions}
                onCategoryClick={setSelectedCategory}
                analysisType="expense"
              />
            </CardContent>
          </Card>
        )
      
      case 'income-flow':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Income Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseFlowChart 
                transactions={filteredTransactions}
                period={state.filterState.period}
                analysisType="income"
              />
            </CardContent>
          </Card>
        )
      
      case 'expense-flow':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Expense Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseFlowChart 
                transactions={filteredTransactions}
                period={state.filterState.period}
                analysisType="expense"
              />
            </CardContent>
          </Card>
        )
      
      case 'account-analysis':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Account Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountAnalysis transactions={filteredTransactions} />
            </CardContent>
          </Card>
        )
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Income Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseOverview 
                transactions={filteredTransactions}
                onCategoryClick={setSelectedCategory}
                analysisType="income"
              />
            </CardContent>
          </Card>
        )
    }
  }

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
        <div className="flex items-center space-x-4">
          <PeriodSelector />
          <FilterControls />
        </div>

        {/* Analysis type selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">Analysis Type:</span>
          <Select value={selectedAnalysis} onValueChange={handleAnalysisChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income-overview">Income Overview</SelectItem>
              <SelectItem value="expense-overview">Expense Overview</SelectItem>
              <SelectItem value="income-flow">Income Flow</SelectItem>
              <SelectItem value="expense-flow">Expense Flow</SelectItem>
              <SelectItem value="account-analysis">Account Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected analysis chart */}
      {renderAnalysis()}

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