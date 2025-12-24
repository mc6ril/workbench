# Supabase Project Setup Guide

This guide explains how to set up a Supabase project for Workbench and configure environment variables.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Access to create projects in your Supabase organization

## Step 1: Create Supabase Project

1. **Log in to Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Sign in or create an account

2. **Create a New Project**
   - Click "New Project" or "+ New Project"
   - Select your organization (or create one if needed)
   - Fill in project details:
     - **Name**: `workbench` (or your preferred name)
     - **Database Password**: Create a strong password (save it securely)
     - **Region**: Choose the closest region to your users
     - **Pricing Plan**: Select appropriate plan (Free tier is sufficient for development)

3. **Wait for Project Initialization**
   - This usually takes 1-2 minutes
   - The project will be ready when you see the dashboard

## Step 2: Get Project Credentials

1. **Navigate to Project Settings**
   - In your project dashboard, go to **Settings** (gear icon) → **API**

2. **Copy Project URL**
   - Find the **Project URL** field
   - Copy the full URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)

3. **Copy Publishable Key (default)**
   - Find the **Project API keys** section
   - Copy the **`publishable_default`** key (the publishable key)
   - ⚠️ **Important**: Use the `publishable_default` key, not the `service_role` key (which should remain secret)

## Step 3: Configure Environment Variables

1. **Create `.env.local` file**

   ```bash
   cp .env.local.example .env.local
   ```

2. **Update `.env.local` with your credentials**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key-here
   ```

3. **Verify the file is ignored by Git**
   - `.env.local` should be in `.gitignore` (it already is)
   - Never commit `.env.local` to version control

## Step 4: Review Dashboard Settings

### Authentication Settings

1. **Navigate to Authentication → Settings**
   - For MVP, authentication is optional (single-user app)
   - If enabling auth later, configure providers as needed

### Row Level Security (RLS)

1. **Navigate to Authentication → Policies**
   - RLS policies will be configured in later tickets
   - For now, default RLS settings are acceptable

2. **Important Notes**:
   - RLS is enabled by default on all tables in Supabase
   - We'll configure policies in Sub-Ticket 15.2 (Database Schema Design)

### Database Settings

1. **Navigate to Settings → Database**
   - Review connection pooling settings (if needed)
   - Connection string information is available here (for future migrations)

## Step 5: Verify Configuration

1. **Check Environment Variables are Loaded**
   - Restart your Next.js dev server: `yarn dev`
   - The Supabase client will validate environment variables on startup
   - If variables are missing, you'll see a clear error message

2. **Test Connection (Optional)**
   - Once repositories are implemented (Sub-Ticket 15.5), you can test the connection
   - For now, verify the dev server starts without errors

## Troubleshooting

### Error: "Missing required environment variable(s)"

**Solution**: Ensure `.env.local` exists and contains both:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### Error: "Invalid API key"

**Solution**:

- Verify you copied the `publishable_default` key, not the `service_role` key
- Ensure there are no extra spaces or characters
- Check the key is correctly formatted in `.env.local`

### Environment Variables Not Loading

**Solution**:

- Restart the Next.js dev server (`yarn dev`)
- Ensure the file is named `.env.local` (not `.env`)
- Check the file is in the project root directory

## Next Steps

After completing this setup:

1. **Sub-Ticket 15.2**: Database Schema Design
   - Design tables for Project, Ticket, Epic, Board, Column

2. **Sub-Ticket 15.3**: Migration System
   - Set up migrations to create database schema

3. **Sub-Ticket 15.4**: Seed Data
   - Create seed data for default project and board

4. **Sub-Ticket 15.5**: Repository Implementation
   - Implement repositories to interact with Supabase

## Security Notes

- ✅ **Safe to expose**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - These are client-side keys protected by RLS policies
  - They can be included in client-side code

- ❌ **Never expose**: `service_role` key
  - This key bypasses RLS policies
  - Only use in server-side code (not needed for this MVP)

- 🔒 **Best Practices**:
  - Keep `.env.local` in `.gitignore`
  - Never commit secrets to version control
  - Use different projects for development and production
  - Rotate keys if they are accidentally exposed

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
