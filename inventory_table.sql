-- Create inventory table for NutrientSync
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'piece',
  calories INTEGER,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  iron DECIMAL(5,2),
  calcium DECIMAL(5,2),
  vitamin_c DECIMAL(5,2),
  expiration_date DATE,
  fdc_id TEXT, -- USDA Food Data Central ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view own inventory" ON inventory 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" ON inventory 
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

-- Add helpful comments
COMMENT ON TABLE inventory IS 'User food inventory for tracking available foods';
COMMENT ON COLUMN inventory.user_id IS 'Reference to the user who owns this inventory item';
COMMENT ON COLUMN inventory.name IS 'Name of the food item';
COMMENT ON COLUMN inventory.category IS 'Food category (Fruits, Vegetables, Dairy, Meat, etc.)';
COMMENT ON COLUMN inventory.quantity IS 'Number of units available';
COMMENT ON COLUMN inventory.unit IS 'Unit of measurement (piece, cup, gram, etc.)';
COMMENT ON COLUMN inventory.calories IS 'Calories per unit';
COMMENT ON COLUMN inventory.protein IS 'Protein in grams per unit';
COMMENT ON COLUMN inventory.carbs IS 'Carbohydrates in grams per unit';
COMMENT ON COLUMN inventory.fat IS 'Fat in grams per unit';
COMMENT ON COLUMN inventory.expiration_date IS 'When the food expires';
COMMENT ON COLUMN inventory.fdc_id IS 'USDA Food Data Central ID for reference'; 