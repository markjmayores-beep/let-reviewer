-- Add trial tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill existing users: trial starts from when their account was created
UPDATE profiles SET trial_started_at = created_at WHERE trial_started_at IS NULL;

-- Update handle_new_user trigger to set trial_started_at on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, trial_started_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Update subscriptions plan constraint: weekly | monthly (drop yearly)
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('weekly', 'monthly'));
