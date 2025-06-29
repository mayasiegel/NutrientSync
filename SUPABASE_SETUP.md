# Supabase Setup Guide

## 1. Environment Variables
Create a `.env` file in your project root with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-project-url` and `your-anon-key` with the values from your Supabase project settings.

## 2. Database Schema
You'll need to create a `profiles` table in your Supabase database with the following structure:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  website TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

## 3. Usage
The Account component is now available at `src/components/Account.tsx` and can be imported into your screens.

Example usage:
```tsx
import Account from '../components/Account'

// In your component
<Account session={session} />
```

## 4. Authentication Flow
You'll need to implement authentication in your app. Consider creating an Auth component that handles sign-in/sign-up flows. 