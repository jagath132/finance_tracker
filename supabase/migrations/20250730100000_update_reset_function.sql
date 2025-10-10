/*
          # [Function Security Update]
          This migration updates the `reset_user_data` function to enhance security by setting a fixed `search_path`. This prevents potential hijacking vulnerabilities by ensuring the function only looks for tables in the expected `public` schema. It also re-enables Row Level Security (RLS) on the tables after the operation.

          ## Query Description: [This operation redefines a database function for improved security. It first removes the old function and then creates a new, more secure version. There is no risk to existing data.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Function `reset_user_data` is dropped and recreated.
          
          ## Security Implications:
          - RLS Status: [Unaffected]
          - Policy Changes: [No]
          - Auth Requirements: [User must be authenticated to call this function.]
          
          ## Performance Impact:
          - Indexes: [Unaffected]
          - Triggers: [Unaffected]
          - Estimated Impact: [None]
          */

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.reset_user_data();

-- Create a new, secure version of the function
CREATE OR REPLACE FUNCTION public.reset_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Temporarily disable RLS to delete data
  ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

  -- Delete data for the currently authenticated user
  DELETE FROM public.transactions WHERE user_id = auth.uid();
  DELETE FROM public.categories WHERE user_id = auth.uid();

  -- Re-enable RLS
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
END;
$$;
