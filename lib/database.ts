import { supabase, TABLES, getCurrentUserId, handleSupabaseError, formatResponse } from './supabase'
import { Transaction, Category, Account, Budget } from '@/types'

// Database service functions for Wallet Wizard application
// These functions handle all CRUD operations with Supabase

// ===== TRANSACTION OPERATIONS =====

export async function fetchTransactions(): Promise<{ data: Transaction[] | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'fetching transactions'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'fetching transactions'))
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .insert({
        ...transaction,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'creating transaction'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'creating transaction'))
  }
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<{ data: Transaction | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'updating transaction'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'updating transaction'))
  }
}

export async function deleteTransaction(id: string): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { error: handleSupabaseError(error, 'deleting transaction') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'deleting transaction') }
  }
}

// ===== CATEGORY OPERATIONS =====

export async function fetchCategories(): Promise<{ data: Category[] | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'fetching categories'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'fetching categories'))
  }
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Category | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .insert({
        ...category,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'creating category'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'creating category'))
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<{ data: Category | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'updating category'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'updating category'))
  }
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from(TABLES.CATEGORIES)
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { error: handleSupabaseError(error, 'deleting category') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'deleting category') }
  }
}

// ===== ACCOUNT OPERATIONS =====

export async function fetchAccounts(): Promise<{ data: Account[] | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.ACCOUNTS)
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'fetching accounts'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'fetching accounts'))
  }
}

export async function createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Account | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.ACCOUNTS)
      .insert({
        ...account,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'creating account'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'creating account'))
  }
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<{ data: Account | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.ACCOUNTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'updating account'))
    }

    return formatResponse(data, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'updating account'))
  }
}

export async function deleteAccount(id: string): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from(TABLES.ACCOUNTS)
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { error: handleSupabaseError(error, 'deleting account') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'deleting account') }
  }
}

// ===== BUDGET OPERATIONS =====

export async function fetchBudgets(): Promise<{ data: Budget[] | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.BUDGETS)
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'fetching budgets'))
    }

    // Map budget_limit back to limit and add category_name
    const mappedData = data?.map(budget => ({
      ...budget,
      category_name: '', // Will be populated by frontend logic
      limit: budget.budget_limit,
      spent: budget.spent || 0,
      remaining: (budget.budget_limit || 0) - (budget.spent || 0)
    })) || null

    return formatResponse(mappedData, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'fetching budgets'))
  }
}

export async function createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Budget | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const { data, error } = await supabase
      .from(TABLES.BUDGETS)
      .insert({
        category_id: budget.category_id,
        budget_limit: budget.limit, // Map the limit field to budget_limit
        month: budget.month,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle()

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'creating budget'))
    }

    // Map budget_limit back to limit
    const mappedData = data ? {
      ...data,
      limit: data.budget_limit,
      spent: data.spent || 0,
      remaining: (data.budget_limit || 0) - (data.spent || 0)
    } : null

    return formatResponse(mappedData, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'creating budget'))
  }
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<{ data: Budget | null; error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return formatResponse(null, 'User not authenticated')
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    // Map the limit field to budget_limit if it exists
    if (updates.limit !== undefined) {
      updateData.budget_limit = updates.limit
    }
    
    // Add other fields that exist in the database
    if (updates.category_id !== undefined) {
      updateData.category_id = updates.category_id
    }
    if (updates.month !== undefined) {
      updateData.month = updates.month
    }

    const { data, error } = await supabase
      .from(TABLES.BUDGETS)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle()

    if (error) {
      return formatResponse(null, handleSupabaseError(error, 'updating budget'))
    }

    // Map budget_limit back to limit
    const mappedData = data ? {
      ...data,
      limit: data.budget_limit,
      spent: data.spent || 0,
      remaining: (data.budget_limit || 0) - (data.spent || 0)
    } : null

    return formatResponse(mappedData, null)
  } catch (error) {
    return formatResponse(null, handleSupabaseError(error, 'updating budget'))
  }
}

export async function deleteBudget(id: string): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from(TABLES.BUDGETS)
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { error: handleSupabaseError(error, 'deleting budget') }
    }

    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'deleting budget') }
  }
} 