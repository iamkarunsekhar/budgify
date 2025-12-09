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
- **Python 3.11+** with FastAPI
- **AWS DynamoDB** for database (NoSQL)
- **boto3** for AWS SDK
- **PyJWT** for authentication
- **passlib** with bcrypt for password hashing

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js (v18 or higher) for frontend
- npm or yarn
- AWS Account with DynamoDB access (free tier is sufficient)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budgify
   ```

2. **Set up AWS DynamoDB**
   - Create an AWS account if you don't have one
   - Create an IAM user with DynamoDB permissions
   - Get your AWS Access Key ID and Secret Access Key
   - See `DEPLOYMENT.md` for detailed instructions

3. **Set up the backend**
   ```bash
   cd backend

   # Install Python dependencies
   pip install -r requirements.txt

   # Create .env file
   cp .env.example .env
   # Edit .env and add:
   #   - JWT_SECRET (generate with: python -c "import secrets; print(secrets.token_hex(64))")
   #   - AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
   #   - AWS_REGION (e.g., us-east-1)

   # Create DynamoDB tables
   python setup_dynamodb.py

   # Start the backend server
   uvicorn api.index:app --reload --port 8000
   ```

   The backend will run on `http://localhost:8000`

4. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install

   # Create .env.local file
   cp .env.example .env.local
   # Update NEXT_PUBLIC_API_URL=http://localhost:8000

   # Start the frontend dev server
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

### First Time Setup (For Couples)

#### Partner 1:
1. Navigate to `http://localhost:3000`
2. Click "Sign Up" to create your account
3. Set your monthly budget limit in "Budget Settings"
4. Start adding your expenses and recurring costs!

#### Partner 2:
1. Navigate to `http://localhost:3000`
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
│   ├── api/
│   │   ├── database.py           # DynamoDB database layer
│   │   ├── models.py             # Pydantic models
│   │   ├── middleware.py         # JWT authentication
│   │   ├── auth.py               # Login/register endpoints
│   │   ├── expenses.py           # Expense CRUD (user-filtered)
│   │   ├── recurring.py          # Recurring costs CRUD (user-filtered)
│   │   ├── budget.py             # Budget settings & summaries (user-filtered)
│   │   └── index.py              # FastAPI app entry point
│   ├── setup_dynamodb.py         # DynamoDB table creation script
│   ├── requirements.txt          # Python dependencies
│   ├── vercel.json               # Vercel deployment config
│   └── .env                      # Environment variables
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
- `GET /expenses` - Get all YOUR expenses
- `GET /expenses/{id}` - Get a specific expense
- `POST /expenses` - Create expense (automatically tagged with your user ID)
- `PUT /expenses/{id}` - Update YOUR expense
- `DELETE /expenses/{id}` - Delete YOUR expense

### Recurring Costs (User-Filtered)
- `GET /recurring` - Get all YOUR recurring costs
- `GET /recurring/{id}` - Get a specific recurring cost
- `POST /recurring` - Create recurring cost (automatically tagged with your user ID)
- `PUT /recurring/{id}` - Update YOUR recurring cost
- `DELETE /recurring/{id}` - Delete YOUR recurring cost

### Budget (User-Filtered)
- `GET /budget/settings` - Get YOUR budget settings
- `POST /budget/settings` - Update YOUR budget settings
- `GET /budget/spending/{year}/{month}` - Get YOUR spending summary for month

## Development

### Backend Development

```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn api.index:app --reload --port 8000

# Or use the Python uvicorn directly
python -m uvicorn api.index:app --reload --port 8000
```

### Frontend Development

```bash
cd frontend
npm run dev    # Start Next.js dev server with Turbopack
npm run build  # Build for production
npm start      # Run production build
```

## Security & Privacy

- All passwords are hashed with passlib/bcrypt before storage
- JWT tokens are used for authentication (7-day expiration)
- All DynamoDB queries filter by user ID (partition key) to ensure data isolation
- Each user can ONLY access their own data
- NoSQL injection protection via parameterized queries
- FastAPI automatic request validation with Pydantic models
- AWS IAM credentials for secure DynamoDB access

## Production Deployment

This application is designed to deploy on **Vercel** (frontend + backend) with **AWS DynamoDB** as the database.

### Quick Deployment Steps

1. **Set up AWS DynamoDB**
   - Create IAM user with DynamoDB permissions
   - Run `python setup_dynamodb.py` to create tables
   - See `DEPLOYMENT.md` for detailed instructions

2. **Deploy Backend to Vercel**
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard:
     - `JWT_SECRET` - Generate with: `python -c "import secrets; print(secrets.token_hex(64))"`
     - `AWS_ACCESS_KEY_ID` - Your AWS access key
     - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
     - `AWS_REGION` - e.g., `us-east-1`
     - `CORS_ORIGIN` - Your frontend URL (e.g., `https://your-app.vercel.app`)
     - DynamoDB table names (optional, uses defaults)
   - Deploy the `/backend` directory

3. **Deploy Frontend to Vercel**
   - Set `NEXT_PUBLIC_API_URL` to your backend URL (e.g., `https://your-backend.vercel.app/api`)
   - Deploy the `/frontend` directory

See `DEPLOYMENT.md` for comprehensive deployment instructions.

### Costs

- **DynamoDB**: Free tier covers ~25GB storage and 25 read/write units - more than enough for personal use
- **Vercel**: Free tier includes hobby projects with generous limits
- **Total**: $0/month for typical personal/couple usage

## License

ISC

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## Support

For issues or questions, please open an issue on the GitHub repository.
