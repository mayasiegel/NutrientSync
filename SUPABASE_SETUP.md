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

# Supabase Setup for NutrientSync

## SQL Script for Database Schema

Run this complete SQL script in your Supabase SQL editor to set up all the necessary tables and columns:

```sql
-- 1. Enable Row Level Security (safe to run multiple times)
alter table profiles
  enable row level security;

-- 2. Drop existing policies if they exist, then re-create them
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- 3. Create or replace the trigger function for auto-creating profiles
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- 4. Drop and re-create the trigger to ensure it's attached
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Create 'avatars' storage bucket if not already present
insert into storage.buckets (id, name)
  values ('avatars', 'avatars')
  on conflict (id) do nothing;

-- 6. Set up storage access policies
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;

create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

-- 7. Add basic profile columns (if not exists)
alter table profiles add column if not exists age text;
alter table profiles add column if not exists location text;
alter table profiles add column if not exists diet text;
alter table profiles add column if not exists allergies text;
alter table profiles add column if not exists username text;

-- 8. Add nutrient calculation columns (if not exists)
alter table profiles add column if not exists gender text;
alter table profiles add column if not exists weight_lbs decimal(5,2);
alter table profiles add column if not exists height_feet integer;
alter table profiles add column if not exists height_inches integer;
alter table profiles add column if not exists bmi decimal(4,2);
alter table profiles add column if not exists sport text;
alter table profiles add column if not exists activity_level text;

-- 9. Add constraints to existing columns (only if they don't exist)
do $$
begin
  -- Add gender constraint if it doesn't exist
  if not exists (
    select 1 from information_schema.check_constraints 
    where constraint_name = 'profiles_gender_check'
  ) then
    alter table profiles add constraint profiles_gender_check 
    check (gender in ('Woman', 'Man', 'Prefer Not to Say'));
  end if;
  
  -- Add sport constraint if it doesn't exist
  if not exists (
    select 1 from information_schema.check_constraints 
    where constraint_name = 'profiles_sport_check'
  ) then
    alter table profiles add constraint profiles_sport_check 
    check (sport in ('None', 'Basketball', 'Soccer', 'Swimming', 'Running', 'Tennis'));
  end if;
  
  -- Add activity_level constraint if it doesn't exist
  if not exists (
    select 1 from information_schema.check_constraints 
    where constraint_name = 'profiles_activity_level_check'
  ) then
    alter table profiles add constraint profiles_activity_level_check 
    check (activity_level in ('Sedentary', 'Lightly Active', 'Active'));
  end if;
end $$;

-- 10. Add helpful comments
comment on column profiles.gender is 'User gender for BMR calculations';
comment on column profiles.weight_lbs is 'Weight in pounds for BMI and calorie calculations';
comment on column profiles.height_feet is 'Height feet component';
comment on column profiles.height_inches is 'Height inches component';
comment on column profiles.bmi is 'Calculated BMI value';
comment on column profiles.sport is 'Primary sport/activity for calorie burn calculations';
comment on column profiles.activity_level is 'General activity level for TDEE calculations';
```

## What This Script Does

1. **Enables Row Level Security** on the profiles table
2. **Sets up proper policies** for user data access
3. **Creates a trigger** to automatically create profile records when users sign up
4. **Sets up storage** for avatar images
5. **Adds all necessary columns** for the nutrient calculation features:
   - Basic info: username, age, location, diet, allergies
   - Health data: gender, weight, height, BMI
   - Activity data: sport, activity level
6. **Adds constraints** to ensure data integrity
7. **Adds helpful comments** for documentation

## After Running the SQL

1. The database will be ready for the nutrient calculation features
2. New users will automatically get profile records created
3. All the required fields will be available for the onboarding flow

## Troubleshooting

If you get any errors about columns already existing, that's normal - the script uses `IF NOT EXISTS` to handle this gracefully. The script is safe to run multiple times. 