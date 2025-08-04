'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Wallet, BarChart3, PiggyBank, CreditCard, Tag, LogOut } from 'lucide-react'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider, useAuth, LoginForm } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import DatabaseDebug from '@/components/debug/DatabaseDebug'

// Import the main tab components
import RecordsTab from '@/components/tabs/RecordsTab'
import AnalysisTab from '@/components/tabs/AnalysisTab'
import BudgetTab from '@/components/tabs/BudgetTab'
import AccountsTab from '@/components/tabs/AccountsTab'
import CategoriesTab from '@/components/tabs/CategoriesTab'

// Main page component - entry point for the Wallet Wizard application
// This component sets up the main navigation tabs and renders the appropriate content
function AppContent() {
  const [activeTab, setActiveTab] = useState('records')
  const { user, signOut } = useAuth()

  if (!user) {
    return <LoginForm />
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        {/* Header section with application title and branding */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Wallet Wizard</h1>
                  <p className="text-sm text-muted-foreground">Personal Finance Tracker</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area with tab navigation */}
        <main className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab navigation list */}
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="records" className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Records</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center space-x-2">
                <PiggyBank className="h-4 w-4" />
                <span className="hidden sm:inline">Budget</span>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Accounts</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Categories</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab content areas */}
            <TabsContent value="records" className="space-y-6">
              <RecordsTab />
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <AnalysisTab />
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <BudgetTab />
            </TabsContent>

            <TabsContent value="accounts" className="space-y-6">
              <AccountsTab />
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <CategoriesTab />
            </TabsContent>
          </Tabs>

          {/* Debug component for troubleshooting */}
          <div className="mt-8">
            <DatabaseDebug />
          </div>
        </main>
      </div>
    </AppProvider>
  )
}

export default function HomePage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
} 