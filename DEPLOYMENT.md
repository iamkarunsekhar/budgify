# Budgify Deployment Guide (DynamoDB + Vercel)

This guide will help you deploy Budgify using **AWS DynamoDB** and **Vercel** - the simplest and most cost-effective deployment!

## 🎉 Why This Architecture is Perfect

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────┐
│   Frontend      │       │  Backend API     │       │  Database   │
│   (Vercel)      │──────▶│  (Vercel)        │──────▶│  DynamoDB   │
│   Next.js App   │ HTTPS │  Serverless      │       │  (AWS)      │
└─────────────────┘       └──────────────────┘       └─────────────┘
```

**Benefits:**
- ✅ **Everything on Vercel** - No separate backend hosting needed!
- ✅ **DynamoDB Free Tier** - 25GB storage, always free
- ✅ **Auto-scaling** - Handles any traffic
- ✅ **Global performance** - AWS + Vercel CDN
- ✅ **$0/month** - Both services have generous free tiers

## 💰 Cost Breakdown

**AWS DynamoDB Free Tier (Forever):**
- 25 GB storage
- 25 WCU (write capacity units)
- 25 RCU (read capacity units)
- More than enough for personal/couple use!

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions included

**Total: $0/month** 🎉

## 📋 Prerequisites

1. **AWS Account** - You already have one!
2. **GitHub Account** - For Vercel deployment
3. **AWS Access Keys** - We'll create these

## 🚀 Step-by-Step Deployment

### Step 1: Create AWS Access Keys (IAM)

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create User**
3. User name: `budgify-app`
4. Click **Next**
5. Select **Attach policies directly**
6. Search for and select **AmazonDynamoDBFullAccess**
7. Click **Next** → **Create User**
8. Click on the user you just created
9. Go to **Security credentials** tab
10. Click **Create access key**
11. Select **Application running outside AWS**
12. Click **Next** → **Create access key**
13. **IMPORTANT:** Copy both:
    - Access key ID
    - Secret access key
14. Store them safely - you'll need them!

### Step 2: Set Up DynamoDB Tables

1. **Clone your repository** (if not already):
   ```bash
   git clone <your-repo-url>
   cd budgify/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your AWS credentials:
   ```bash
   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key-id-here
   AWS_SECRET_ACCESS_KEY=your-secret-access-key-here

   # JWT Secret (generate this!)
   JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   ```

5. **Run the DynamoDB setup script**:
   ```bash
   npm run setup-dynamodb
   ```

   You should see:
   ```
   🚀 Setting up DynamoDB tables...
   ✅ Created table budgify-users
   ✅ Created table budgify-expenses
   ✅ Created table budgify-recurring-costs
   ✅ Created table budgify-budget-settings
   ✅ All tables created successfully!
   ```

6. **Verify in AWS Console**:
   - Go to [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
   - You should see 4 tables created
   - All tables should show "Active" status

### Step 3: Deploy Backend to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. Sign up/login with GitHub
3. Click **Add New** → **Project**
4. Import your `budgify` repository
5. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. **Add Environment Variables** (click "Environment Variables"):
   ```
   JWT_SECRET=<your-generated-jwt-secret>
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=<your-aws-access-key>
   AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
   DYNAMODB_USERS_TABLE=budgify-users
   DYNAMODB_EXPENSES_TABLE=budgify-expenses
   DYNAMODB_RECURRING_TABLE=budgify-recurring-costs
   DYNAMODB_BUDGET_TABLE=budgify-budget-settings
   NODE_ENV=production
   ```

7. Click **Deploy**
8. Wait 2-3 minutes for deployment
9. Copy your backend URL (e.g., `https://budgify-backend.vercel.app`)

### Step 4: Deploy Frontend to Vercel

1. In Vercel dashboard, click **Add New** → **Project**
2. Select your `budgify` repository again
3. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Add Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```
   ⚠️ Replace with your actual backend URL from Step 3!

5. Click **Deploy**
6. Wait 2-3 minutes
7. Copy your frontend URL (e.g., `https://budgify.vercel.app`)

### Step 5: Update Backend CORS

**IMPORTANT:** Go back to your backend project in Vercel:

1. Click on your backend project
2. Go to **Settings** → **Environment Variables**
3. Add new variable:
   ```
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
   ⚠️ Replace with your actual frontend URL from Step 4!

4. Go to **Deployments** tab
5. Click the three dots on the latest deployment → **Redeploy**
6. Select **Use existing Build Cache** → **Redeploy**

## ✅ Testing Your Deployment

### 1. Test Backend Health

Visit: `https://your-backend-url.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "Budgify API is running"
}
```

### 2. Test Frontend

1. Visit your frontend URL: `https://your-frontend-url.vercel.app`
2. Click **Sign Up**
3. Create an account
4. Set your budget limit
5. Add an expense
6. Verify everything works!

### 3. Test Partner Access

1. Open frontend in incognito/private window
2. Sign up with a different email
3. Verify data is completely separate

## 🔒 Security Best Practices

### 1. JWT Secret

**Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use this value for `JWT_SECRET` in Vercel environment variables.

### 2. AWS Access Keys

**Best practice - Use IAM role with minimal permissions:**

Create a custom policy with only these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/budgify-*"
      ]
    }
  ]
}
```

### 3. Environment Variables

**Never commit these to Git:**
- ✅ Use Vercel environment variables
- ✅ Store secrets in `.env` (gitignored)
- ❌ Never push AWS keys to GitHub

## 🛠️ Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your AWS credentials
npm run dev
```

Runs on `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
# Edit .env.local with: NEXT_PUBLIC_API_URL=http://localhost:3000/api
npm run dev
```

Runs on `http://localhost:3001`

## 🔄 Updating Your Deployment

**Any changes to your code:**

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. Vercel automatically detects changes and redeploys!
   - Check deployment status in Vercel dashboard
   - Both frontend and backend redeploy automatically

## 🐛 Troubleshooting

### "Network Error" or Can't Connect

**Problem:** Frontend can't reach backend

**Solutions:**
1. Verify `NEXT_PUBLIC_API_URL` in frontend Vercel settings
2. Check `CORS_ORIGIN` in backend Vercel settings
3. Ensure URLs don't have trailing slashes
4. Test backend health endpoint directly

### "Invalid Token" or Authentication Errors

**Problem:** JWT authentication failing

**Solutions:**
1. Verify `JWT_SECRET` is the same in backend
2. Clear browser localStorage and re-login
3. Check browser console for errors

### DynamoDB Errors

**Problem:** Can't read/write to DynamoDB

**Solutions:**
1. Verify AWS credentials in Vercel are correct
2. Check IAM user has DynamoDB permissions
3. Verify table names match in environment variables
4. Check DynamoDB console - tables should be "Active"

### Deployment Fails

**Problem:** Vercel deployment failing

**Backend deployment fails:**
- Check build logs in Vercel
- Verify `package.json` has correct build script
- Ensure all dependencies are listed
- Check TypeScript compiles: `npm run build`

**Frontend deployment fails:**
- Verify Next.js builds locally: `npm run build`
- Check for TypeScript errors
- Ensure environment variables are set

## 📊 Monitoring

### Vercel Analytics

1. Go to your project in Vercel
2. Click **Analytics** tab
3. View:
   - Page views
   - API calls
   - Performance metrics
   - Error rates

### AWS DynamoDB Metrics

1. Go to [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Select a table
3. Click **Metrics** tab
4. Monitor:
   - Read/write capacity usage
   - Storage usage
   - Request latency

### Check Costs

1. [AWS Billing Dashboard](https://console.aws.amazon.com/billing/)
2. Should see **$0.00** if within free tier
3. Set up billing alerts if desired

## 🚀 Performance Optimization

### DynamoDB

**If you exceed free tier:**
- Tables use provisioned capacity (5 RCU/WCU)
- Can switch to on-demand pricing
- Or optimize queries to use less capacity

**Optimization tips:**
- Expenses are partitioned by user_id (efficient!)
- Queries use partition key (fast!)
- No table scans (good for costs!)

### Vercel

**Automatic optimizations:**
- Edge caching
- Compression
- Image optimization (Next.js)
- Serverless function caching

## 📚 Additional Resources

- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 Need Help?

Common issues:
1. **Can't create tables** → Check AWS IAM permissions
2. **Backend 500 errors** → Check Vercel function logs
3. **CORS errors** → Verify CORS_ORIGIN matches frontend URL
4. **Auth not working** → Verify JWT_SECRET is set

---

**Congratulations!** 🎉 Your budget tracker is now live and accessible from anywhere!

Both you and your partner can access it 24/7, with completely separate and private budgets.
