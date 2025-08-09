-- Ensure triggers for is_reported ↔ is_public (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_sync_is_reported_posts' AND n.nspname = 'public') THEN
    CREATE TRIGGER trg_sync_is_reported_posts
    BEFORE INSERT OR UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_is_reported_posts();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_sync_is_reported_recipes' AND n.nspname = 'public') THEN
    CREATE TRIGGER trg_sync_is_reported_recipes
    BEFORE INSERT OR UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_is_reported_recipes();
  END IF;
END $$;

-- Normalize existing soft-deleted data
UPDATE public.posts SET is_public = false WHERE is_reported = true AND is_public = true;
UPDATE public.recipes SET is_public = false WHERE is_reported = true AND is_public = true;

-- 1) Clean duplicates for (reporter_id, post_id) keeping the most recent report
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY reporter_id, post_id ORDER BY created_at DESC, id) AS rn
  FROM public.reports
  WHERE post_id IS NOT NULL
)
DELETE FROM public.reports r
USING ranked
WHERE r.id = ranked.id
  AND ranked.rn > 1;

-- 2) Create unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS ux_reports_single_post_per_reporter
  ON public.reports (reporter_id, post_id)
  WHERE post_id IS NOT NULL;