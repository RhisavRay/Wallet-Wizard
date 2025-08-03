# Wallet Wizard - Personal Finance Tracker

A comprehensive desktop-focused personal finance tracker built with Next.js, TypeScript, and TailwindCSS. Track your income, expenses, budgets, and financial goals with an intuitive and modern interface.

## 🚀 Features

### 📊 Records Tab
- **Transaction Management**: Add, edit, and delete income, expense, and transfer transactions
- **Smart Filtering**: Filter by date range, period (daily, weekly, monthly, etc.), and search by notes/categories
- **Real-time Calculations**: Automatic calculation of income, expenses, and balance
- **Period Navigation**: Navigate between different time periods with ease
- **Search Functionality**: Search through transactions by notes and categories

### 📈 Analysis Tab
- **Income/Expense Overview**: Pie chart showing the proportion of income vs expenses
- **Expense Flow Chart**: Line chart tracking income and expenses over time
- **Account Analysis**: Bar chart comparing how each account contributes to finances
- **Interactive Charts**: Click on chart elements for detailed breakdowns

### 💰 Budget Tab
- **Monthly Budgets**: Set budget limits for expense categories
- **Progress Tracking**: Visual progress bars showing budget usage
- **Over-budget Alerts**: Clear indicators when spending exceeds limits
- **Budget Management**: Add, edit, and remove budgets with ease

### 🏦 Accounts Tab
- **Account Management**: Add, edit, and delete financial accounts
- **Balance Tracking**: Real-time calculation of account balances from transactions
- **Account Overview**: View initial balance, current balance, and transaction history

### 🏷️ Categories Tab
- **Category Management**: Organize transactions with custom income and expense categories
- **Type Separation**: Separate management of income and expense categories
- **Flexible Organization**: Create categories that match your financial habits

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: TailwindCSS with shadcn/ui components
- **Language**: TypeScript for type safety
- **State Management**: React Context API with useReducer
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Forms**: React Hook Form with validation
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Database**: Supabase (PostgreSQL + Auth)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wallet-wizard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Set up the following tables in your database:
     - `transactions` (id, user_id, amount, type, category, account, date, note, created_at, updated_at)
     - `categories` (id, user_id, name, type, created_at, updated_at)
     - `accounts` (id, user_id, name, initial_balance, created_at, updated_at)
     - `budgets` (id, user_id, category_id, limit, month, created_at, updated_at)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
wallet-wizard/
├── app/                    # Next.js app router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── tabs/             # Main tab components
│   ├── charts/           # Chart components
│   ├── transactions/     # Transaction-related components
│   ├── budgets/          # Budget-related components
│   ├── accounts/         # Account-related components
│   ├── categories/       # Category-related components
│   └── shared/           # Shared components
├── context/              # React Context for state management
├── lib/                  # Utility functions and configurations
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🎯 Key Features

### State Management
- **Global Context**: Centralized state management using React Context API
- **Reducer Pattern**: Predictable state updates with useReducer
- **Real-time Updates**: Immediate UI updates when data changes

### Data Visualization
- **Interactive Charts**: Clickable charts with detailed tooltips
- **Responsive Design**: Charts adapt to different screen sizes
- **Color Coding**: Consistent color scheme for income (green) and expenses (red)

### User Experience
- **Desktop-Focused**: Optimized for desktop use with responsive design
- **Intuitive Navigation**: Clear tab-based navigation
- **Form Validation**: Comprehensive form validation with error messages
- **Loading States**: Smooth loading indicators and empty states

### Data Management
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Search & Filter**: Advanced filtering and search capabilities
- **Period Management**: Flexible period selection and navigation

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Database Schema
The application expects the following database structure:

```sql
-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
  category TEXT NOT NULL,
  account TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  initial_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES categories(id),
  limit DECIMAL(10,2) NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Recharts](https://recharts.org/) for the chart library
- [Lucide](https://lucide.dev/) for the icon library
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

If you have any questions or need help with the application, please open an issue on GitHub or contact the development team.

---

**Wallet Wizard** - Your personal finance companion for better financial management and insights. 