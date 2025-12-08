# Budgify

A modern, fluid web application for tracking monthly spending and managing budgets. Built for couples and individuals who want to independently monitor their expenses, visualize spending patterns, and stay within their budget goals.

## Features

- **Independent User Tracking**: Each user tracks their own budget completely separately - perfect for couples who want to maintain financial independence while living together
- **Secure Authentication**: JWT-based authentication ensures your data is private and secure
- **Expense Tracking**: Add, view, and delete expenses with categories
- **Recurring Costs**: Manage monthly and annual recurring expenses (subscriptions, rent, insurance, etc.)
- **Budget Management**: Set monthly spending limits and track progress independently
- **Visual Analytics**:
  - Daily spending line chart
  - Category breakdown pie chart
  - Month-over-month navigation and comparison
- **Budget Warnings**: Visual alerts when approaching or exceeding budget limits
  - Green: On track (< 80% of budget used)
  - Yellow: Warning (80-100% of budget used)
  - Red: Over budget
- **Modern UI**: Clean, responsive design built with Next.js and Tailwind CSS

## How Independent Tracking Works

Each user creates their own account with a unique email and password. When you log in:
- You only see YOUR expenses, recurring costs, and budget settings
- Your partner's financial data is completely separate and private
- Each person can set their own budget limits
- All data is filtered by user ID at the database level for security

This makes Budgify perfect for couples who want to:
- Maintain financial independence
- Track personal spending without combining accounts
- Keep their budgets private while living together
- Each manage their own subscriptions and recurring costs

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **date-fns** for date manipulation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** (better-sqlite3) for database
- **JWT** for authentication
- **bcryptjs** for password hashing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budgify
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env and set your JWT_SECRET to a strong random string

   # Start the backend server
   npm run dev
   ```

   The backend will run on `http://localhost:3000`

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install

   # Create .env.local file
   cp .env.example .env.local
   # The default API URL should work if backend is on port 3000

   # Start the frontend dev server
   npm run dev
   ```

   The frontend will run on `http://localhost:3001`

### First Time Setup (For Couples)

#### Partner 1:
1. Navigate to `http://localhost:3001`
2. Click "Sign Up" to create your account
3. Set your monthly budget limit in "Budget Settings"
4. Start adding your expenses and recurring costs!

#### Partner 2:
1. Navigate to `http://localhost:3001`
2. Click "Sign Up" to create a separate account (use a different email)
3. Set your own monthly budget limit in "Budget Settings"
4. Start tracking your own expenses independently!

Each of you will have completely separate budgets and data.

## Usage

### Adding Expenses

1. Click "+ Add Expense" from the dashboard
2. Enter the amount, select a category, choose a date, and optionally add a description
3. Click "Add Expense" to save
4. Only you can see this expense - it's private to your account

### Managing Recurring Costs

1. Go to the "Recurring Costs" tab
2. Click "+ Add Recurring Cost"
3. Enter the name (e.g., "Netflix"), amount, frequency (monthly/annual), category, and start date
4. Recurring costs are automatically factored into your monthly budget calculations
5. Annual costs are prorated (divided by 12) for monthly impact

### Setting Budget Limits

1. Click "Budget Settings" in the header
2. Enter your desired monthly spending limit
3. The dashboard will show your progress and warnings based on this limit
4. This is YOUR budget limit - your partner's limit is set separately in their account

### Understanding Budget Status

- **Green** (On Track): Less than 80% of budget used
- **Yellow** (Warning): 80-100% of budget used
- **Red** (Over Budget): Exceeded budget limit

### Viewing Month-by-Month Trends

Use the month navigation buttons to:
- View previous months' spending patterns
- Compare spending across different months
- See how your habits change over time

## Project Structure

```
budgify/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts       # Database initialization
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.ts           # Login/register endpoints
│   │   │   ├── expenses.ts       # Expense CRUD (user-filtered)
│   │   │   ├── recurring.ts      # Recurring costs CRUD (user-filtered)
│   │   │   └── budget.ts         # Budget settings & summaries (user-filtered)
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript types
│   │   └── index.ts              # Server entry point
│   ├── data/                     # SQLite database (auto-created)
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── dashboard/
    │   │   └── page.tsx          # Main dashboard page
    │   ├── login/
    │   │   └── page.tsx          # Login page
    │   ├── register/
    │   │   └── page.tsx          # Registration page
    │   ├── layout.tsx            # Root layout with AuthProvider
    │   └── page.tsx              # Home page (redirects)
    ├── components/
    │   ├── dashboard/
    │   │   ├── CategoryChart.tsx
    │   │   ├── ExpenseList.tsx
    │   │   ├── RecurringCostsList.tsx
    │   │   └── SpendingChart.tsx
    │   └── ui/
    │       ├── AddExpenseModal.tsx
    │       ├── AddRecurringModal.tsx
    │       └── BudgetSettings.tsx
    ├── contexts/
    │   └── AuthContext.tsx       # Authentication state
    ├── lib/
    │   └── api.ts                # API client
    ├── types/
    │   └── index.ts              # TypeScript types
    ├── utils/
    │   └── categories.ts         # Expense categories & colors
    └── package.json
```

## API Endpoints

All endpoints (except auth) require JWT authentication and automatically filter by logged-in user.

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login

### Expenses (User-Filtered)
- `GET /api/expenses` - Get all YOUR expenses
- `GET /api/expenses/range?start_date=&end_date=` - Get YOUR expenses by date range
- `POST /api/expenses` - Create expense (automatically tagged with your user ID)
- `PUT /api/expenses/:id` - Update YOUR expense
- `DELETE /api/expenses/:id` - Delete YOUR expense

### Recurring Costs (User-Filtered)
- `GET /api/recurring` - Get all YOUR recurring costs
- `POST /api/recurring` - Create recurring cost (automatically tagged with your user ID)
- `PUT /api/recurring/:id` - Update YOUR recurring cost
- `DELETE /api/recurring/:id` - Delete YOUR recurring cost

### Budget (User-Filtered)
- `GET /api/budget` - Get YOUR budget settings
- `PUT /api/budget` - Update YOUR budget settings
- `GET /api/budget/summary/:year/:month` - Get YOUR spending summary for month

## Development

### Backend Development

```bash
cd backend
npm run dev    # Start with nodemon (auto-reload)
npm run build  # Compile TypeScript
npm start      # Run compiled code
```

### Frontend Development

```bash
cd frontend
npm run dev    # Start Next.js dev server with Turbopack
npm run build  # Build for production
npm start      # Run production build
```

## Security & Privacy

- All passwords are hashed with bcryptjs before storage
- JWT tokens are used for authentication (7-day expiration)
- All database queries filter by user ID to ensure data isolation
- Each user can ONLY access their own data
- SQL injection protection via prepared statements
- Foreign key constraints ensure data integrity

## Production Deployment

### Backend

1. Set environment variables:
   - `PORT`: Server port (default: 3000)
   - `JWT_SECRET`: Strong secret key for JWT tokens (REQUIRED - use a random 64+ character string)

2. Build and start:
   ```bash
   npm run build
   npm start
   ```

### Frontend

1. Update `.env.local` with production API URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Start production server:
   ```bash
   npm start
   ```

   Or deploy to Vercel/Netlify for automatic deployment.

## License

ISC

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## Support

For issues or questions, please open an issue on the GitHub repository.
