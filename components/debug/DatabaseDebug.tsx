'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useApp } from '@/context/AppContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatabaseDebug() {
  const { user } = useAuth()
  const { state: appState } = useApp()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runDebug = async () => {
    setIsLoading(true)
    const info: any = {}

    try {
      // Check environment variables
      info.envVars = {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      }

      // Check authentication
      info.auth = {
        user: user ? { id: user.id, email: user.email } : null,
        session: await supabase.auth.getSession(),
      }

             // Check database connection - test each table directly
       const tableTests = {}
       for (const tableName of ['transactions', 'categories', 'accounts', 'budgets']) {
         try {
           const { data, error } = await supabase
             .from(tableName)
             .select('*')
             .limit(1)
           
           tableTests[tableName] = {
             exists: !error || error.code !== 'PGRST116',
             error: error?.message || null,
             count: data?.length || 0
           }
         } catch (err) {
           tableTests[tableName] = {
             exists: false,
             error: err instanceof Error ? err.message : String(err),
             count: 0
           }
         }
       }

       info.database = {
         tables: tableTests,
       }

       // Check RLS policies by testing data access
       if (user) {
         const policyTests = {}
         for (const tableName of ['transactions', 'categories', 'accounts', 'budgets']) {
           try {
             const { data, error } = await supabase
               .from(tableName)
               .select('*')
               .limit(1)
             
             policyTests[tableName] = {
               accessible: !error || error.code !== 'PGRST116',
               error: error?.message || null,
               dataCount: data?.length || 0
             }
           } catch (err) {
             policyTests[tableName] = {
               accessible: false,
               error: err instanceof Error ? err.message : String(err),
               dataCount: 0
             }
           }
         }

         info.policies = {
           data: policyTests,
         }
       }

             // Test database operations
       if (user) {
         try {
           // Test creating a sample transaction
           const testTransaction = {
             amount: 100,
             type: 'income',
             category: 'Test',
             account: 'Test Account',
             date: new Date().toISOString().split('T')[0],
             note: 'Debug test transaction'
           }

           const { data: createData, error: createError } = await supabase
             .from('transactions')
             .insert({
               ...testTransaction,
               user_id: user.id,
               created_at: new Date().toISOString(),
               updated_at: new Date().toISOString(),
             })
             .select()
             .single()

           if (createData) {
             // Delete the test transaction
             await supabase
               .from('transactions')
               .delete()
               .eq('id', createData.id)
           }

           info.testQuery = {
             createSuccess: !createError,
             createError: createError?.message,
             testData: createData,
           }
         } catch (error) {
           info.testQuery = {
             createSuccess: false,
             createError: error instanceof Error ? error.message : String(error),
             testData: null,
           }
         }
       }

    } catch (error) {
      info.error = error instanceof Error ? error.message : String(error)
    }

    info.appState = appState
    setDebugInfo(info)
    setIsLoading(false)
  }

  useEffect(() => {
    runDebug()
  }, [user])

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Database Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runDebug} disabled={isLoading} className="mb-4">
          {isLoading ? 'Running Debug...' : 'Refresh Debug Info'}
        </Button>

                 <div className="space-y-4">
           <div>
             <h3 className="font-semibold mb-2">App State:</h3>
             <pre className="bg-gray-100 p-2 rounded text-sm">
               {JSON.stringify({
                 transactions: debugInfo.appState?.transactions?.length || 0,
                 categories: debugInfo.appState?.categories?.length || 0,
                 accounts: debugInfo.appState?.accounts?.length || 0,
                 budgets: debugInfo.appState?.budgets?.length || 0,
                 isLoading: debugInfo.appState?.isLoading,
                 errors: debugInfo.appState?.errors,
               }, null, 2)}
             </pre>
           </div>

           <div>
             <h3 className="font-semibold mb-2">Environment Variables:</h3>
             <pre className="bg-gray-100 p-2 rounded text-sm">
               {JSON.stringify(debugInfo.envVars, null, 2)}
             </pre>
           </div>

          <div>
            <h3 className="font-semibold mb-2">Authentication:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(debugInfo.auth, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Database Tables:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(debugInfo.database, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">RLS Policies:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(debugInfo.policies, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test Query:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(debugInfo.testQuery, null, 2)}
            </pre>
          </div>

          {debugInfo.error && (
            <div>
              <h3 className="font-semibold mb-2 text-red-600">Error:</h3>
              <pre className="bg-red-100 p-2 rounded text-sm text-red-800">
                {debugInfo.error}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 