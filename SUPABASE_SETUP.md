# Supabase Setup Guide for GigaSwap

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `gigaswap`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API"
4. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 3. Set Up Environment Variables

1. Copy `env.template` to `.env` in your project root
2. Replace the placeholder values:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- `profiles` table for user data
- `conversations` table for chat history
- `messages` table for individual messages
- `user_transactions` table for Solana transactions
- `user_holdings` table for portfolio tracking
- Row Level Security policies
- Indexes for performance

## 5. Configure Authentication

1. Go to "Authentication" in your Supabase dashboard
2. Click on "Settings"
3. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/**`
   - **Email Templates**: Customize if desired

## 6. Test the Setup

1. Start your React app: `npm start`
2. The Supabase client should now be connected
3. Check the browser console for any connection errors

## 7. Next Steps

After completing this setup, you can:
- Implement user authentication
- Create user profile components
- Set up chat persistence
- Integrate AI chat system
- Add Solana wallet integration

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your site URL is correctly configured in Supabase
2. **RLS Errors**: Ensure Row Level Security policies are properly set up
3. **Connection Errors**: Verify your environment variables are correct
4. **Schema Errors**: Make sure the SQL schema ran without errors

### Useful Supabase Dashboard Sections:

- **Table Editor**: View and edit your data
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users and auth settings
- **API**: View your API documentation
- **Logs**: Debug issues and monitor activity
