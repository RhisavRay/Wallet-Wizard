import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase configuration
// These should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client instance
// This client will be used throughout the application for database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names - centralized for easy maintenance
export const TABLES = {
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  ACCOUNTS: 'accounts',
  BUDGETS: 'budgets',
  USERS: 'users',
} as const

// Database schema types for better type safety
export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'income' | 'expense' | 'transfer'
          category: string
          account: string
          date: string
          note?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'income' | 'expense' | 'transfer'
          category: string
          account: string
          date: string
          note?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'income' | 'expense' | 'transfer'
          category?: string
          account?: string
          date?: string
          note?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          initial_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          initial_balance: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          initial_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          limit: number
          month: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          limit: number
          month: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          limit?: number
          month?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper function to get current user ID
// This function retrieves the authenticated user's ID for database operations
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    console.error('Error getting current user:', error)
    return null
  }
  return user.id
}

// Helper function to handle Supabase errors
// This function provides consistent error handling across the application
export function handleSupabaseError(error: any, operation: string): string {
  console.error(`Error in ${operation}:`, error)
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.details) {
    return error.details
  }
  
  return `An error occurred during ${operation}. Please try again.`
}

// Helper function to format database response
// This function standardizes the response format for consistency
export function formatResponse<T>(data: T | null, error: any): { data: T | null; error: string | null } {
  if (error) {
    return {
      data: null,
      error: typeof error === 'string' ? error : error?.message || 'An error occurred'
    }
  }
  
  return {
    data,
    error: null
  }
} 