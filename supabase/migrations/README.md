# Supabase Migrations

This directory contains database migrations for the NutrientSync project.

## Current Migration

### `20241201000000_add_rls_policies.sql`
This migration ensures all tables have proper Row Level Security (RLS) policies and includes:

- **RLS Policies**: Proper user isolation for all tables (profiles, inventory, daily_log)
- **Storage Policies**: Avatar image access policies
- **User Triggers**: Automatic profile creation for new users
- **Data Integrity**: Constraints and indexes for better performance
- **Missing Columns**: Adds any missing profile columns for the app

## How to Apply

### Option 1: Using Supabase CLI (Recommended)
If you have the Supabase CLI installed:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link your project (you'll need your project ref and access token)
supabase link --project-ref bbpvflablmgilhewtoos

# Apply the migration
supabase db push
```

### Option 2: Manual Application
1. Go to your Supabase dashboard: https://app.supabase.com/project/bbpvflablmgilhewtoos
2. Navigate to the SQL Editor
3. Copy and paste the contents of `20241201000000_add_rls_policies.sql`
4. Run the query

### Option 3: Using the Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to Database → Migrations
3. Upload the migration file or copy-paste the SQL

## What This Fixes

- ✅ Ensures all tables have RLS enabled
- ✅ Creates proper user isolation policies
- ✅ Sets up storage access for avatars
- ✅ Adds missing profile columns
- ✅ Creates performance indexes
- ✅ Adds data integrity constraints

## Verification

After running the migration, you can verify it worked by:

1. Going to Database → Tables in your Supabase dashboard
2. Checking that RLS is enabled on all tables
3. Going to Database → Policies to see the created policies
4. Testing your app to ensure user data is properly isolated

## Troubleshooting

If you get any errors:
- The migration uses `IF NOT EXISTS` and `DROP POLICY IF EXISTS` to handle existing objects
- It's safe to run multiple times
- If you get permission errors, make sure you're using the correct database role 