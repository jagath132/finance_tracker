/*
  # [SECURITY] Secure Function Search Path
  [This migration secures database functions by setting a fixed `search_path`. 
  This is a security best practice to prevent potential hijacking attacks by ensuring functions 
  only look for objects in expected schemas (`public`).]

  ## Query Description: [Updates the `reset_user_data` and `handle_new_user` functions to explicitly set their search path. 
  This change has no impact on existing data or application functionality but significantly improves security posture. 
  It is a safe and recommended update.]
  
  ## Metadata:
  - Schema-Category: ["Security", "Safe"]
  - Impact-Level: ["Low"]
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Function: `public.reset_user_data()`
  - Function: `public.handle_new_user()`
  
  ## Security Implications:
  - RLS Status: [N/A]
  - Policy Changes: [No]
  - Auth Requirements: [None for the function itself, but execution is protected by RLS on tables.]
  
  ## Performance Impact:
  - Indexes: [N/A]
  - Triggers: [N/A]
  - Estimated Impact: [None]
*/
ALTER FUNCTION public.reset_user_data() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
