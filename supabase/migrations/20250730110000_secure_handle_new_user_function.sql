/*
# [SECURITY] Secure handle_new_user Function
This migration secures the `handle_new_user` function by setting a fixed search path. This prevents potential vulnerabilities where a malicious user could temporarily create objects (like functions or tables) in the `public` schema to hijack the function's execution.

## Query Description:
- This operation modifies the existing `handle_new_user` function.
- It adds `SET search_path = public` to ensure the function only looks for objects in the `public` schema, mitigating search path hijacking risks.
- There is no impact on existing data.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by reverting to the old function definition)

## Security Implications:
- RLS Status: Not applicable to function definition.
- Policy Changes: No.
- Auth Requirements: This function is a trigger on the `auth.users` table.
*/
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public; -- Secure the search path
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
