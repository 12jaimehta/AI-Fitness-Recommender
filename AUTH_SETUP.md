# Authentication and Database Setup Guide

This guide will help you set up Supabase authentication and database for the diet plan application.

## 1. Supabase Project Setup

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### Step 2: Get Supabase Credentials
1. In your Supabase project, go to "Settings" > "API"
2. Copy the "Project URL" and "anon public" key
3. Add them to your `.env` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### Step 3: Set Up Database Schema
1. In your Supabase project, go to "SQL Editor"
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL script to create the necessary tables and policies

### Step 4: Configure Authentication
1. Go to "Authentication" > "Settings"
2. Under "Providers", enable "Email" authentication
3. Add your site URL and redirect URLs:
   - **Site URL**: `https://fyteAI.co.in`
   - **Redirect URLs**: 
     - `https://fyteAI.co.in`
     - `http://localhost:3000` (for development)
   - **Additional Redirect URLs**: 
     - `https://fyteAI.co.in/sign-in`
     - `https://fyteAI.co.in/sign-up`
     - `http://localhost:3000/sign-in`
     - `http://localhost:3000/sign-up`

## 3. Environment Variables

Your complete `.env` file should look like this:

```env
OPENAI_API_KEY=your_openai_key_here

# Supabase Database & Auth
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Run the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 5. Testing the Setup

### Authentication Flow
1. Click "Sign In" in the top-right corner
2. Enter your email address
3. Check your email for the magic link
4. Click the link to sign in
5. You should see your name/email in the header

### Saving Diet Plans
1. Fill out the diet plan form
2. Generate a diet plan
3. Click "Save Plan" at the bottom
4. Check "My Saved Plans" to see your saved plans

## 6. Features Available

- ✅ Magic link authentication
- ✅ User profile management
- ✅ Save diet plans to database
- ✅ View saved plans
- ✅ Delete saved plans
- ✅ Row-level security (users can only access their own data)

## 7. Troubleshooting

### Clerk Issues
- Make sure your redirect URLs match exactly
- Check that magic links are enabled in Clerk settings
- Verify environment variables are set correctly

### Supabase Issues
- Ensure the SQL schema was executed successfully
- Check that RLS policies are enabled
- Verify your API keys have the correct permissions

### General Issues
- Check the browser console for error messages
- Ensure all environment variables are set
- Restart the development server after changing environment variables

## 8. Security Note

For this implementation, we're using **application-level security** with Supabase instead of Row Level Security (RLS). This means:

- ✅ **API routes** check the Supabase authenticated user via `supabase.auth.getUser()`
- ✅ **User isolation** is enforced at the application level by always filtering queries with `user.id`
- ✅ You can optionally add RLS policies in Supabase later for an extra layer of protection
