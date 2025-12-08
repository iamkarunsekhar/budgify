# Budgify

A modern, fluid web application for tracking monthly spending and managing budgets. Built for couples and individuals who want to monitor their expenses, visualize spending patterns, and stay within their budget goals.

## Features

- **Multi-user Support**: Perfect for couples or roommates to track shared expenses
- **Expense Tracking**: Add, view, and delete expenses with categories
- **Recurring Costs**: Manage monthly and annual recurring expenses (subscriptions, rent, etc.)
- **Budget Management**: Set monthly spending limits and track progress
- **Visual Analytics**:
  - Daily spending line chart
  - Category breakdown pie chart
  - Month-over-month comparison
- **Budget Warnings**: Visual alerts when approaching or exceeding budget limits
- **Month Navigation**: Easily browse through different months
- **Modern UI**: Clean, responsive design built with Tailwind CSS

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
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
   # Edit .env and set your JWT_SECRET

   # Start the backend server
   npm run dev
   ```

   The backend will run on `http://localhost:3000`

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install

   # Create .env file
   cp .env.example .env
   # The default API URL should work if backend is on port 3000

   # Start the frontend dev server
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

### First Time Setup

1. Navigate to `http://localhost:5173`
2. Click "Sign Up" to create your account
3. Set your monthly budget limit in "Budget Settings"
4. Start adding expenses!

## Usage

### Adding Expenses

1. Click "+ Add Expense" from the dashboard
2. Enter the amount, select a category, choose a date, and optionally add a description
3. Click "Add Expense" to save

### Managing Recurring Costs

1. Go to the "Recurring Costs" tab
2. Click "+ Add Recurring Cost"
3. Enter the name (e.g., "Netflix"), amount, frequency (monthly/annual), category, and start date
4. Recurring costs are automatically factored into your monthly budget

### Setting Budget Limits

1. Click "Budget Settings" in the header
2. Enter your desired monthly spending limit
3. The dashboard will show progress and warnings based on this limit

### Understanding Budget Status

- **Green** (On Track): Less than 80% of budget used
- **Yellow** (Warning): 80-100% of budget used
- **Red** (Over Budget): Exceeded budget limit

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
│   │   │   ├── expenses.ts       # Expense CRUD
│   │   │   ├── recurring.ts      # Recurring costs CRUD
│   │   │   └── budget.ts         # Budget settings & summaries
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript types
│   │   └── index.ts              # Server entry point
│   ├── data/                     # SQLite database (auto-created)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AddExpenseModal.tsx
    │   │   ├── AddRecurringModal.tsx
    │   │   ├── BudgetSettings.tsx
    │   │   ├── CategoryChart.tsx
    │   │   ├── ExpenseList.tsx
    │   │   ├── RecurringCostsList.tsx
    │   │   └── SpendingChart.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx    # Authentication state
    │   ├── pages/
    │   │   ├── Dashboard.tsx      # Main application page
    │   │   ├── Login.tsx
    │   │   └── Register.tsx
    │   ├── services/
    │   │   └── api.ts             # API client
    │   ├── types/
    │   │   └── index.ts           # TypeScript types
    │   ├── utils/
    │   │   └── categories.ts      # Expense categories & colors
    │   ├── App.tsx                # Route configuration
    │   └── main.tsx               # App entry point
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/range?start_date=&end_date=` - Get expenses by date range
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Recurring Costs
- `GET /api/recurring` - Get all recurring costs
- `POST /api/recurring` - Create recurring cost
- `PUT /api/recurring/:id` - Update recurring cost
- `DELETE /api/recurring/:id` - Delete recurring cost

### Budget
- `GET /api/budget` - Get budget settings
- `PUT /api/budget` - Update budget settings
- `GET /api/budget/summary/:year/:month` - Get spending summary for month

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
npm run dev    # Start Vite dev server
npm run build  # Build for production
npm run preview # Preview production build
```

## Production Deployment

### Backend

1. Set environment variables:
   - `PORT`: Server port (default: 3000)
   - `JWT_SECRET`: Strong secret key for JWT tokens

2. Build and start:
   ```bash
   npm run build
   npm start
   ```

### Frontend

1. Update `.env` with production API URL
2. Build:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder to your hosting service

## License

ISC

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## Support

For issues or questions, please open an issue on the GitHub repository.
