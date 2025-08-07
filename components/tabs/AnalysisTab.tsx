'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp, useFilteredTransactions } from '@/context/AppContext'
import PeriodSelector from '@/components/shared/PeriodSelector'
import FilterControls from '@/components/shared/FilterControls'
import { formatCurrency, calculateTotalIncome, calculateTotalExpenses, calculateBalance } from '@/lib/utils'
import IncomeExpenseOverview from '@/components/charts/IncomeExpenseOverview'
import ExpenseFlowChart from '@/components/charts/ExpenseFlowChart'
import AccountAnalysis from '@/components/charts/AccountAnalysis'
import CategoryBreakdown from '@/components/charts/CategoryBreakdown'

// AnalysisTab component - provides charts and visualizations for financial analysis
// This tab shows various breakdowns and trends of income, expenses, and account data
export default function AnalysisTab() {
  const { state, dispatch } = useApp()
  const filteredTransactions = useFilteredTransactions()
  
  // Local state for chart interactions and analysis type selection
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('expense-overview')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Refs for scrolling to category breakdowns
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Calculate summary values based on filtered transactions
  const totalIncome = calculateTotalIncome(filteredTransactions)
  const totalExpenses = calculateTotalExpenses(filteredTransactions)
  const balance = calculateBalance(filteredTransactions)

  // Handle analysis type change
  const handleAnalysisChange = (value: string) => {
    setSelectedAnalysis(value)
    setSelectedCategory(null) // Reset category selection when changing analysis
    setExpandedCategories(new Set()) // Reset expanded categories
  }

  // Handle editing a transaction
  const handleEditTransaction = (transaction: any) => {
    // For now, we'll just dispatch an action to open the transaction dialog
    // This would need to be connected to the transaction dialog in the parent component
    console.log('Edit transaction:', transaction)
    // You can implement the actual edit functionality here
  }

  // Handle deleting a transaction
  const handleDeleteTransaction = (transactionId: string) => {
    dispatch({
      type: 'DELETE_TRANSACTION',
      payload: transactionId
    })
  }

  // Handle category expansion toggle
  const handleCategoryToggle = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Handle pie chart category click - scroll to and expand the category
  const handlePieChartCategoryClick = (category: string) => {
    // Expand the category if it's not already expanded
    if (!expandedCategories.has(category)) {
      const newExpanded = new Set(expandedCategories)
      newExpanded.add(category)
      setExpandedCategories(newExpanded)
    }

    // Scroll to the category breakdown after a short delay to allow for expansion animation
    setTimeout(() => {
      const categoryElement = categoryRefs.current[category]
      if (categoryElement) {
        // Add a temporary highlight effect
        categoryElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
        
        // Scroll to the element
        categoryElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        
        // Remove the highlight after a few seconds
        setTimeout(() => {
          categoryElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
        }, 2000)
      }
    }, 100) // Small delay to ensure expansion animation starts
  }

  // Get all categories for the current analysis type
  const getCategoriesForAnalysis = () => {
    const analysisType = selectedAnalysis.includes('income') ? 'income' : 'expense'
    const categoryTransactions = filteredTransactions.filter(t => t.type === analysisType)
    
    // Group by category and calculate totals
    const categoryData = categoryTransactions.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = { name: category, total: 0, count: 0 }
      }
      acc[category].total += transaction.amount
      acc[category].count += 1
      return acc
    }, {} as Record<string, { name: string; total: number; count: number }>)

    return Object.values(categoryData)
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total) // Sort by total descending
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
                onCategoryClick={handlePieChartCategoryClick}
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
                onCategoryClick={handlePieChartCategoryClick}
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
                onCategoryClick={handlePieChartCategoryClick}
                analysisType="income"
              />
            </CardContent>
          </Card>
        )
    }
  }

  // Render category breakdowns for overview charts
  const renderCategoryBreakdowns = () => {
    if (!selectedAnalysis.includes('overview')) {
      return null
    }

    const categories = getCategoriesForAnalysis()
    const analysisType = selectedAnalysis.includes('income') ? 'income' : 'expense'

    if (categories.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdowns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <p>No {analysisType} categories found for this period</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdowns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div 
                key={category.name} 
                className="border rounded-lg"
                ref={(el) => {
                  categoryRefs.current[category.name] = el
                }}
              >
                {/* Category header - clickable to expand/collapse */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCategoryToggle(category.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.count} transaction{category.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`font-semibold ${analysisType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(category.total)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}
                      </div>
                    </div>
                    <div className={`text-muted-foreground transition-transform duration-300 ease-in-out ${
                      expandedCategories.has(category.name) ? 'rotate-180' : 'rotate-0'
                    }`}>
                      ▼
                    </div>
                  </div>
                </div>
                
                {/* Expanded content with animation */}
                <div 
                  className={`border-t bg-muted/30 overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedCategories.has(category.name) 
                      ? 'max-h-screen opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-4">
                    <CategoryBreakdown 
                      category={category.name}
                      transactions={filteredTransactions}
                      analysisType={analysisType}
                      onEditTransaction={handleEditTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                      showHeader={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
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

      {/* Category breakdowns for overview charts */}
      {renderCategoryBreakdowns()}
    </div>
  )
} 