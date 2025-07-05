-- Create daily_log table for tracking what users eat
CREATE TABLE IF NOT EXISTS daily_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'piece',
  calories INTEGER,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  iron DECIMAL(5,2),
  calcium DECIMAL(5,2),
  vitamin_c DECIMAL(5,2),
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  log_date DATE DEFAULT CURRENT_DATE,
  inventory_item_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE daily_log ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view own daily log" ON daily_log 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily log" ON daily_log 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily log" ON daily_log 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily log" ON daily_log 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_log_user_id ON daily_log(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_log_date ON daily_log(log_date);
CREATE INDEX IF NOT EXISTS idx_daily_log_consumed_at ON daily_log(consumed_at);

-- Add helpful comments
COMMENT ON TABLE daily_log IS 'Daily food consumption log for tracking nutrition';
COMMENT ON COLUMN daily_log.user_id IS 'Reference to the user who consumed this food';
COMMENT ON COLUMN daily_log.food_name IS 'Name of the consumed food';
COMMENT ON COLUMN daily_log.quantity IS 'Number of units consumed';
COMMENT ON COLUMN daily_log.unit IS 'Unit of measurement consumed';
COMMENT ON COLUMN daily_log.consumed_at IS 'When the food was consumed';
COMMENT ON COLUMN daily_log.log_date IS 'Date of consumption (for easy querying)';
COMMENT ON COLUMN daily_log.inventory_item_id IS 'Reference to the inventory item that was consumed (if applicable)'; 