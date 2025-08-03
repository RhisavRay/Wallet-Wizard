'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Transaction, Category, Account, Budget, FilterState, PeriodType } from '@/types'
import { getDateRange, formatPeriod } from '@/lib/utils'

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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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