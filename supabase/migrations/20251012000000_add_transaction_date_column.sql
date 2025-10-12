/*
# Add transaction_date column to transactions table
This migration adds the transaction_date column to the transactions table if it doesn't already exist.

## Query Description:
This operation checks if the transaction_date column exists in the transactions table, and adds it if missing. This ensures compatibility with existing databases that may not have this column.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `public.transactions`
- Column: `transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW()`

## Security Implications:
- RLS Status: No change
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None added
- Triggers: None
- Estimated Impact: Low
*/

-- Add transaction_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'transactions'
        AND column_name = 'transaction_date'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;