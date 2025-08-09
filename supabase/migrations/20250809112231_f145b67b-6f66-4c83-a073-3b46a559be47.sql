-- Triggers to sync is_reported ↔ is_public for posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_sync_is_reported_posts'
      AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER trg_sync_is_reported_posts
    BEFORE INSERT OR UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_is_reported_posts();
  END IF;
END
$$;

-- Triggers to sync is_reported ↔ is_public for recipes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_sync_is_reported_recipes'
      AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER trg_sync_is_reported_recipes
    BEFORE INSERT OR UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_is_reported_recipes();
  END IF;
END
$$;

-- Fix inconsistent existing data (reported but still public)
UPDATE public.posts
SET is_public = false
WHERE is_reported = true AND is_public = true;

UPDATE public.recipes
SET is_public = false
WHERE is_reported = true AND is_public = true;

-- Prevent duplicate reports by same user on the same post
CREATE UNIQUE INDEX IF NOT EXISTS ux_reports_single_post_per_reporter
  ON public.reports (reporter_id, post_id)
  WHERE post_id IS NOT NULL;