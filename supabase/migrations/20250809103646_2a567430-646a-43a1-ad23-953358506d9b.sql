-- Security hardening migration: indexes for fast and safe admin session validation
-- 1) Create indexes to speed up admin session lookups and expiry checks
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON public.admin_sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions (expires_at);

-- 2) (Optional safeguard) Ensure revoked defaults are set properly (already defaulted to false)
-- No-op if already set; included for clarity
ALTER TABLE public.admin_sessions ALTER COLUMN revoked SET DEFAULT false;

-- 3) Tighten function search_path if missing (only for functions we control in public schema)
-- Note: If these functions already set search_path, this will be a no-op replace.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
