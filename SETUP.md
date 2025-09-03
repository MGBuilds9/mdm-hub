# Environment Setup Guide

This application requires Supabase configuration to function properly. Follow these steps to set up your environment variables.

## Quick Setup

1. **Create a Supabase Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project or use an existing one

2. **Get Your API Keys**
   - In your Supabase project dashboard, go to **Settings** → **API**
   - Copy the following values:
     - Project URL
     - Anonymous key (public)
     - Service role key (secret)

3. **Create Environment File**
   - Create a `.env.local` file in your project root
   - Add the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Restart Development Server**
   ```bash
   npm run dev
   ```

## Database Setup

After configuring your environment variables, you'll need to set up your database schema:

1. **Run the main schema**
   ```sql
   -- Execute the contents of supabase/schema.sql in your Supabase SQL editor
   ```

2. **Create user profiles**
   ```sql
   -- Execute the contents of create-user-profile.sql
   ```

3. **Apply RLS policies**
   ```sql
   -- Execute the contents of fix-rls-policies.sql
   ```

## Troubleshooting

### Missing Environment Variables
If you see errors about missing environment variables:

1. Visit `/setup` in your browser for a guided setup process
2. Ensure your `.env.local` file is in the project root
3. Restart your development server after making changes

### Invalid API Key Errors
- Verify your Supabase project URL and keys are correct
- Ensure you're using the right keys (anon key vs service role key)
- Check that your Supabase project is active and not paused

### Development vs Production
- In development: Missing env vars will redirect to `/setup`
- In production: Missing env vars will cause the application to fail immediately

## Security Notes

- Never commit your `.env.local` file to version control
- The service role key has admin privileges - keep it secret
- Use different Supabase projects for development and production
