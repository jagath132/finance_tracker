/*
# [Function] Create reset_user_data function
This function allows a user to delete all their personal data (transactions and categories) in a single, atomic operation.

## Query Description:
This operation creates a PostgreSQL function named `reset_user_data`. When called, it will permanently delete all records from the `transactions` and `categories` tables that belong to the currently authenticated user. This is a destructive and irreversible action.

## Metadata:
- Schema-Category: "Dangerous"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Function: `public.reset_user_data()`
- Tables Affected: `public.transactions`, `public.categories`

## Security Implications:
- RLS Status: The function is defined with `security definer` to bypass RLS for deletion, but it strictly uses `auth.uid()` to ensure users can only delete their own data.
- Policy Changes: No
- Auth Requirements: Must be called by an authenticated user.

## Performance Impact:
- Indexes: Uses existing indexes on `user_id`.
- Triggers: None
- Estimated Impact: High load during execution, proportional to the amount of data being deleted.
*/
create or replace function public.reset_user_data()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.transactions where user_id = auth.uid();
  delete from public.categories where user_id = auth.uid();
end;
$$;
