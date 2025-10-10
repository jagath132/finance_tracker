/*
          # Initial Schema Setup
          This script establishes the core database structure for the PTrack application, including tables for user profiles, transaction categories, and financial transactions. It also configures Row Level Security (RLS) to ensure users can only access their own data and sets up a trigger to automatically create a user profile upon registration.

          ## Query Description: This is a foundational script and is safe to run on a new project. It creates new tables and does not modify or delete existing data. However, it's always best practice to have a backup before making any schema changes.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables Created: `profiles`, `categories`, `transactions`
          - Triggers Created: `on_auth_user_created`
          - Functions Created: `public.handle_new_user()`
          - RLS Policies: Enabled for all three new tables with policies for SELECT, INSERT, UPDATE, DELETE.
          
          ## Security Implications:
          - RLS Status: Enabled on `profiles`, `categories`, `transactions`.
          - Policy Changes: No, new policies are created.
          - Auth Requirements: Policies are based on `auth.uid()`, linking data to the logged-in user.
          
          ## Performance Impact:
          - Indexes: Primary keys and foreign keys are indexed by default.
          - Triggers: A trigger is added to `auth.users` which fires once per user creation.
          - Estimated Impact: Low performance impact, standard for new table creation.
          */

-- Create a table for public user profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  updated_at TIMESTAMPTZ
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Create ENUM type for transaction types
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

-- Create a table for categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type transaction_type NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- Set up Row Level Security (RLS) for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories." ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories." ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories." ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories." ON public.categories
  FOR DELETE USING (auth.uid() = user_id);


-- Create a table for transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  type transaction_type NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Set up Row Level Security (RLS) for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions." ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions." ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions." ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions." ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update `updated_at` timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update `updated_at` on transactions change
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();
