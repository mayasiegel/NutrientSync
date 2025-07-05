# Database Setup Guide

## Step 1: Create the Inventory Table

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `inventory_table.sql`
4. Run the query

## Step 2: Create the Daily Log Table

1. In the same SQL Editor
2. Copy and paste the contents of `daily_log_table.sql`
3. Run the query

## Step 3: Test the Setup

After running both SQL scripts, you should have:

- An `inventory` table with user-specific food items
- A `daily_log` table to track what users eat
- Proper Row Level Security (RLS) policies
- Indexes for better performance

## Step 4: Add Some Test Data (Optional)

You can add test inventory items through the Supabase dashboard:

1. Go to Table Editor
2. Select the `inventory` table
3. Click "Insert row"
4. Add a test item like:
   - name: "Apple"
   - category: "Fruits"
   - quantity: 5
   - unit: "piece"
   - calories: 95
   - protein: 0.5
   - carbs: 25
   - fat: 0.3

## What This Enables

✅ **Inventory-to-Daily Flow**: Foods in inventory show up on Daily page
✅ **Automatic Removal**: When you eat food, it's removed from inventory
✅ **Quantity Tracking**: Supports multiple quantities of the same food
✅ **Nutrition Tracking**: All macro/micronutrients are tracked
✅ **User Isolation**: Each user only sees their own inventory and logs
✅ **Real-time Updates**: Changes sync immediately across the app

## Next Steps

1. Run the SQL scripts in Supabase
2. Test the app - you should now see your inventory items on the Daily page
3. Try adding foods to your daily log - they should disappear from inventory 