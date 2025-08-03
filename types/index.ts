// Global TypeScript types for Wallet Wizard application

// Transaction types - defines the different types of financial transactions
export type TransactionType = 'income' | 'expense' | 'transfer';

// Transaction interface - represents a single financial transaction
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  account: string;
  date: string; // ISO date string
  note?: string; // Optional note for the transaction
  created_at: string;
  updated_at: string;
}

// Category interface - represents income or expense categories
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

// Account interface - represents financial accounts (bank accounts, cash, etc.)
export interface Account {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number; // Calculated from transactions
  created_at: string;
  updated_at: string;
}

// Budget interface - represents monthly budget limits for expense categories
export interface Budget {
  id: string;
  category_id: string;
  category_name: string;
  limit: number;
  spent: number; // Calculated from transactions
  remaining: number; // Calculated: limit - spent
  month: string; // Format: YYYY-MM
  created_at: string;
  updated_at: string;
}

// Period types for filtering transactions and analysis
export type PeriodType = 'daily' | 'weekly' | 'monthly' | '3months' | '4months' | 'yearly';

// Filter state interface - manages the current filter settings
export interface FilterState {
  period: PeriodType;
  startDate: string;
  endDate: string;
  showTotal: boolean;
  carryOver: boolean;
  searchQuery: string;
}

// Analysis data interfaces for charts and visualizations
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface AccountAnalysis {
  account: string;
  income: number;
  expense: number;
  balance: number;
}

// Chart data interfaces for Recharts
export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

// Form interfaces for creating/editing data
export interface TransactionFormData {
  amount: number;
  type: TransactionType;
  category: string;
  account: string;
  date: string;
  note?: string;
}

export interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
}

export interface AccountFormData {
  name: string;
  initial_balance: number;
}

export interface BudgetFormData {
  category_id: string;
  limit: number;
  month: string;
}

// API response interfaces
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

// UI state interfaces
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export interface ModalState {
  isOpen: boolean;
  type: 'transaction' | 'category' | 'account' | 'budget' | 'delete' | null;
  data?: any;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateData<T> {
  state: LoadingState;
  data: T | null;
  error: string | null;
} 