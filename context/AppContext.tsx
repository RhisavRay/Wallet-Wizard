'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Transaction, Category, Account, Budget, FilterState, PeriodType } from '@/types'
import { getDateRange, formatPeriod } from '@/lib/utils'
import {
  fetchTransactions,
  createTransaction as dbCreateTransaction,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  fetchCategories,
  createCategory as dbCreateCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  fetchAccounts,
  createAccount as dbCreateAccount,
  updateAccount as dbUpdateAccount,
  deleteAccount as dbDeleteAccount,
  fetchBudgets,
  createBudget as dbCreateBudget,
  updateBudget as dbUpdateBudget,
  deleteBudget as dbDeleteBudget,
} from '@/lib/database'

// Define the application state interface
// This includes all the data and UI state that needs to be shared across components
interface AppState {
  // Filter and view state
  filterState: FilterState
  currentPeriod: Date
  
  // Data arrays
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  budgets: Budget[]
  
  // Loading states
  isLoading: {
    transactions: boolean
    categories: boolean
    accounts: boolean
    budgets: boolean
  }
  
  // Error states
  errors: {
    transactions: string | null
    categories: string | null
    accounts: string | null
    budgets: string | null
  }
}

// Define action types for the reducer
// These actions will be dispatched to update the application state
type AppAction =
  | { type: 'SET_FILTER_STATE'; payload: Partial<FilterState> }
  | { type: 'SET_CURRENT_PERIOD'; payload: Date }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['isLoading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['errors']; value: string | null } }

// Initial state for the application
// Sets up default values for all state properties
const initialState: AppState = {
  filterState: {
    period: 'monthly',
    startDate: '',
    endDate: '',
    showTotal: true,
    carryOver: true,
    searchQuery: '',
  },
  currentPeriod: new Date(),
  transactions: [],
  categories: [],
  accounts: [],
  budgets: [],
  isLoading: {
    transactions: false,
    categories: false,
    accounts: false,
    budgets: false,
  },
  errors: {
    transactions: null,
    categories: null,
    accounts: null,
    budgets: null,
  },
}

// Reducer function to handle state updates
// This function processes actions and returns the new state
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILTER_STATE':
      return {
        ...state,
        filterState: { ...state.filterState, ...action.payload },
      }
    
    case 'SET_CURRENT_PERIOD':
      return {
        ...state,
        currentPeriod: action.payload,
      }
    
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      }
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
      }
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      }
    
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      }
    
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      }
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
      }
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
      }
    
    case 'SET_ACCOUNTS':
      return {
        ...state,
        accounts: action.payload,
      }
    
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
      }
    
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(a => 
          a.id === action.payload.id ? action.payload : a
        ),
      }
    
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(a => a.id !== action.payload),
      }
    
    case 'SET_BUDGETS':
      return {
        ...state,
        budgets: action.payload,
      }
    
    case 'ADD_BUDGET':
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
      }
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(b => 
          b.id === action.payload.id ? action.payload : b
        ),
      }
    
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload),
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [action.payload.key]: action.payload.value,
        },
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      }
    
    default:
      return state
  }
}

// Create the context with initial undefined value
// This context will provide the application state and dispatch function
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | undefined>(undefined)

// Provider component that wraps the application
// This component manages the state and provides it to all child components
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Starting to load data from database...')
      try {
        // Load transactions
        console.log('📊 Loading transactions...')
        dispatch({ type: 'SET_LOADING', payload: { key: 'transactions', value: true } })
        const { data: transactions, error: transactionsError } = await fetchTransactions()
        console.log('📊 Transactions result:', { data: transactions?.length || 0, error: transactionsError })
        if (transactionsError) {
          console.error('❌ Transactions error:', transactionsError)
          dispatch({ type: 'SET_ERROR', payload: { key: 'transactions', value: transactionsError } })
        } else if (transactions) {
          console.log('✅ Loaded transactions:', transactions.length)
          dispatch({ type: 'SET_TRANSACTIONS', payload: transactions })
        }

        // Load categories
        console.log('🏷️ Loading categories...')
        dispatch({ type: 'SET_LOADING', payload: { key: 'categories', value: true } })
        const { data: categories, error: categoriesError } = await fetchCategories()
        console.log('🏷️ Categories result:', { data: categories?.length || 0, error: categoriesError })
        if (categoriesError) {
          console.error('❌ Categories error:', categoriesError)
          dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: categoriesError } })
        } else if (categories) {
          console.log('✅ Loaded categories:', categories.length)
          dispatch({ type: 'SET_CATEGORIES', payload: categories })
        }

        // Load accounts
        console.log('💳 Loading accounts...')
        dispatch({ type: 'SET_LOADING', payload: { key: 'accounts', value: true } })
        const { data: accounts, error: accountsError } = await fetchAccounts()
        console.log('💳 Accounts result:', { data: accounts?.length || 0, error: accountsError })
        if (accountsError) {
          console.error('❌ Accounts error:', accountsError)
          dispatch({ type: 'SET_ERROR', payload: { key: 'accounts', value: accountsError } })
        } else if (accounts) {
          console.log('✅ Loaded accounts:', accounts.length)
          dispatch({ type: 'SET_ACCOUNTS', payload: accounts })
        }

        // Load budgets
        console.log('💰 Loading budgets...')
        dispatch({ type: 'SET_LOADING', payload: { key: 'budgets', value: true } })
        const { data: budgets, error: budgetsError } = await fetchBudgets()
        console.log('💰 Budgets result:', { data: budgets?.length || 0, error: budgetsError })
        if (budgetsError) {
          console.error('❌ Budgets error:', budgetsError)
          dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', value: budgetsError } })
        } else if (budgets) {
          console.log('✅ Loaded budgets:', budgets.length)
          dispatch({ type: 'SET_BUDGETS', payload: budgets })
        }
      } catch (error) {
        console.error('❌ Error loading data:', error)
      } finally {
        console.log('🏁 Finished loading data')
        dispatch({ type: 'SET_LOADING', payload: { key: 'transactions', value: false } })
        dispatch({ type: 'SET_LOADING', payload: { key: 'categories', value: false } })
        dispatch({ type: 'SET_LOADING', payload: { key: 'accounts', value: false } })
        dispatch({ type: 'SET_LOADING', payload: { key: 'budgets', value: false } })
      }
    }

    loadData()
  }, [])

  // Effect to update date range when period or current period changes
  // This ensures the filter state stays in sync with the selected period
  useEffect(() => {
    const { start, end } = getDateRange(state.filterState.period, state.currentPeriod)
    dispatch({
      type: 'SET_FILTER_STATE',
      payload: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
    })
  }, [state.filterState.period, state.currentPeriod])

  // Async action handlers for database operations
  const asyncDispatch = async (action: AppAction) => {
    // Don't dispatch immediately for database operations that need to be handled specially
    if (action.type === 'ADD_BUDGET' || action.type === 'UPDATE_BUDGET' || action.type === 'DELETE_BUDGET') {
      // Handle these in the async operations below
    } else {
      dispatch(action)
    }

    // Handle async database operations
    if (action.type === 'ADD_TRANSACTION') {
      try {
        const { data, error } = await dbCreateTransaction(action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'transactions', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'transactions', value: 'Failed to create transaction' } })
      }
    }

    if (action.type === 'UPDATE_TRANSACTION') {
      try {
        const { data, error } = await dbUpdateTransaction(action.payload.id, action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'transactions', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'transactions', value: 'Failed to update transaction' } })
      }
    }

    if (action.type === 'DELETE_TRANSACTION') {
      try {
        const { error } = await dbDeleteTransaction(action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'transactions', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'transactions', value: 'Failed to delete transaction' } })
      }
    }

    if (action.type === 'ADD_CATEGORY') {
      try {
        const { data, error } = await dbCreateCategory(action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: 'Failed to create category' } })
      }
    }

    if (action.type === 'UPDATE_CATEGORY') {
      try {
        const { data, error } = await dbUpdateCategory(action.payload.id, action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: 'Failed to update category' } })
      }
    }

    if (action.type === 'DELETE_CATEGORY') {
      try {
        const { error } = await dbDeleteCategory(action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: 'Failed to delete category' } })
      }
    }

    if (action.type === 'ADD_ACCOUNT') {
      try {
        const { data, error } = await dbCreateAccount(action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'accounts', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'accounts', value: 'Failed to create account' } })
      }
    }

    if (action.type === 'UPDATE_ACCOUNT') {
      try {
        const { data, error } = await dbUpdateAccount(action.payload.id, action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'accounts', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'accounts', value: 'Failed to update account' } })
      }
    }

    if (action.type === 'DELETE_ACCOUNT') {
      try {
        const { error } = await dbDeleteAccount(action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'accounts', value: error } })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'accounts', value: 'Failed to delete account' } })
      }
    }

    if (action.type === 'ADD_BUDGET') {
      try {
        const { data, error } = await dbCreateBudget(action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', value: error } })
        } else if (data) {
          // Update local state with the created budget from database
          dispatch({ type: 'ADD_BUDGET', payload: data })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', value: 'Failed to create budget' } })
      }
    }

    if (action.type === 'UPDATE_BUDGET') {
      try {
        const { data, error } = await dbUpdateBudget(action.payload.id, action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', value: error } })
        } else if (data) {
          // Update local state with the updated budget from database
          dispatch({ type: 'UPDATE_BUDGET', payload: data })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', value: 'Failed to update budget' } })
      }
    }

    if (action.type === 'DELETE_BUDGET') {
      try {
        const { error } = await dbDeleteBudget(action.payload)
        if (error) {
          dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', value: error } })
        } else {
          // Update local state after successful deletion
          dispatch({ type: 'DELETE_BUDGET', payload: action.payload })
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', value: 'Failed to delete budget' } })
      }
    }
  }

  return (
    <AppContext.Provider value={{ state, dispatch: asyncDispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the app context
// This hook provides easy access to the state and dispatch function
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Helper hook to get filtered transactions
// This hook returns transactions filtered by the current filter state
export function useFilteredTransactions() {
  const { state } = useApp()
  const { transactions, filterState } = state

  return transactions.filter(transaction => {
    // Filter by date range
    const transactionDate = new Date(transaction.date)
    const startDate = new Date(filterState.startDate)
    const endDate = new Date(filterState.endDate)
    
    if (transactionDate < startDate || transactionDate > endDate) {
      return false
    }

    // Filter by search query
    if (filterState.searchQuery) {
      const query = filterState.searchQuery.toLowerCase()
      const matchesNote = transaction.note?.toLowerCase().includes(query) || false
      const matchesCategory = transaction.category.toLowerCase().includes(query)
      return matchesNote || matchesCategory
    }

    return true
  })
}

// Helper hook to get current period display text
// This hook returns the formatted period text for display
export function useCurrentPeriodText() {
  const { state } = useApp()
  return formatPeriod(state.filterState.period, state.currentPeriod)
} 