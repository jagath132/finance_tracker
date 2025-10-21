# Supabase Setup Instructions for Finance Tracker

This guide will help you set up the backend for the Finance Tracker application using Supabase.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- The finance tracker project cloned locally

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in to your account
2. Click "New project"
3. Fill in your project details:
   - **Name**: `finance-tracker` (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
4. Click "Create new project"

## Step 2: Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor** tab
2. Copy the entire contents of `supabase_schema.sql` from your project root
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

This will create all necessary tables, indexes, and security policies.

## Step 3: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your application's URL:
   - For development: `http://localhost:5173` (Vite's default port)
   - For production: Your deployed app's URL
3. Under **Redirect URLs**, add the same URLs
4. (Optional) Configure additional auth providers if needed

## Step 4: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: Your anonymous/public API key

## Step 5: Configure Environment Variables

1. In your project root, create a `.env` file (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the placeholder values with your actual credentials from Step 4.

## Step 6: Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Try registering a new account or logging in
3. Create some categories and transactions to verify everything works

## Database Schema Overview

The schema includes three main tables:

### Users Table

- Extends Supabase's built-in auth.users
- Stores additional profile information

### Categories Table

- Stores income and expense categories
- User-specific with customizable icons and colors

### Transactions Table

- Stores all financial transactions
- Links to categories and users
- Supports attachments and notes

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Integrated with Supabase Auth
- **Automatic user profile creation**: Profiles are created when users sign up

## Troubleshooting

### Common Issues:

1. **Environment variables not loading**:

   - Ensure `.env` file is in the project root
   - Restart your development server after adding env vars

2. **Authentication not working**:

   - Check that Site URL and Redirect URLs are configured correctly
   - Verify your Supabase project is not paused

3. **Database errors**:
   - Ensure the SQL schema was executed successfully
   - Check the Supabase logs for any errors

### Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the browser console for error messages
- Check the Supabase dashboard logs

## Next Steps

Once setup is complete, you can:

- Start building additional features
- Set up real-time subscriptions for live updates
- Configure storage for file attachments
- Add more complex queries and analytics

The backend is now ready to support your finance tracking application!
