import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge Tailwind CSS classes with proper precedence
// This function combines clsx and tailwind-merge for optimal class handling
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency amounts with proper locale and currency symbol
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format percentage values with proper decimal places
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Get color for transaction type (used in UI components)
export function getTransactionTypeColor(type: 'income' | 'expense' | 'transfer'): string {
  switch (type) {
    case 'income':
      return 'text-green-600'
    case 'expense':
      return 'text-red-600'
    case 'transfer':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

// Get background color for transaction type (used in badges and cards)
export function getTransactionTypeBgColor(type: 'income' | 'expense' | 'transfer'): string {
  switch (type) {
    case 'income':
      return 'bg-green-100 text-green-800'
    case 'expense':
      return 'bg-red-100 text-red-800'
    case 'transfer':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Calculate balance from transactions
export function calculateBalance(transactions: any[]): number {
  return transactions.reduce((balance, transaction) => {
    if (transaction.type === 'income') {
      return balance + transaction.amount
    } else if (transaction.type === 'expense') {
      return balance - transaction.amount
    }
    // Transfers don't affect balance calculation
    return balance
  }, 0)
}

// Calculate total income from transactions
export function calculateTotalIncome(transactions: any[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)
}

// Calculate total expenses from transactions
export function calculateTotalExpenses(transactions: any[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)
}

// Generate unique ID for new records
export function generateId(): string {
  // Generate a proper UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date for input fields (YYYY-MM-DD)
export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

// Get date range for different period types
export function getDateRange(period: string, baseDate: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(baseDate)
  const end = new Date(baseDate)

  switch (period) {
    case 'daily':
      // Same day
      break
    case 'weekly':
      // Start of week (Sunday) to end of week (Saturday)
      const day = start.getDay()
      start.setDate(start.getDate() - day)
      end.setDate(end.getDate() + (6 - day))
      break
    case 'monthly':
      // Start of month to end of month
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
      break
    case '3months':
      // 3 months back from current date
      start.setMonth(start.getMonth() - 3)
      break
    case '4months':
      // 4 months back from current date
      start.setMonth(start.getMonth() - 4)
      break
    case 'yearly':
      // Start of year to end of year
      start.setMonth(0, 1)
      end.setMonth(11, 31)
      break
    default:
      // Default to current month
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
  }

  return { start, end }
}

// Format period for display
export function formatPeriod(period: string, date: Date = new Date()): string {
  switch (period) {
    case 'daily':
      return formatDate(date)
    case 'weekly':
      const { start, end } = getDateRange('weekly', date)
      return `${formatDate(start)} - ${formatDate(end)}`
    case 'monthly':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    case '3months':
      return 'Last 3 Months'
    case '4months':
      return 'Last 4 Months'
    case 'yearly':
      return date.getFullYear().toString()
    default:
      return formatDate(date)
  }
}

// Capitalize first letter of string
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
} 