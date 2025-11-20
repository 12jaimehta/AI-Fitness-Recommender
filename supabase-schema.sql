-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diet plans table
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  form_data JSONB NOT NULL,
  diet_plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_created_at ON diet_plans(created_at DESC);

-- Note: RLS disabled for now, using application-level security
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_plans_updated_at 
  BEFORE UPDATE ON diet_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
