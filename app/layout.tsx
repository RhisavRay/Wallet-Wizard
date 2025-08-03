import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Import Inter font from Google Fonts for consistent typography
const inter = Inter({ subsets: ['latin'] })

// Metadata for the Wallet Wizard application
// This includes SEO-friendly title, description, and other meta tags
export const metadata: Metadata = {
  title: 'Wallet Wizard - Personal Finance Tracker',
  description: 'A comprehensive personal finance tracker to manage your income, expenses, budgets, and financial goals.',
  keywords: 'finance, budget, expense tracker, personal finance, money management',
  authors: [{ name: 'Wallet Wizard Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

// Root layout component that wraps all pages
// This component provides the basic HTML structure and global styles
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Main application container */}
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
} 