-- M4: Onboarding areas, reports for news, analytics events, Gujarati backfill

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS area_interests TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

ALTER TABLE reports
  ALTER COLUMN listing_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS news_item_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';

ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_target;
ALTER TABLE reports ADD CONSTRAINT reports_target CHECK (
  (listing_id IS NOT NULL AND news_item_id IS NULL) OR
  (listing_id IS NULL AND news_item_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Authenticated users can report" ON reports;
CREATE POLICY "Authenticated users can report"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  screen TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created
  ON analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name
  ON analytics_events(event_name, created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert analytics" ON analytics_events;
CREATE POLICY "Users insert analytics"
  ON analytics_events FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins read analytics" ON analytics_events;
CREATE POLICY "Admins read analytics"
  ON analytics_events FOR SELECT TO authenticated
  USING (is_admin());

-- Gujarati titles for demo news missing translation
UPDATE news_items
SET
  title_gu = COALESCE(title_gu, '[ડેમો] ' || LEFT(title, 120)),
  summary_gu = COALESCE(summary_gu, LEFT(summary, 400))
WHERE is_demo = true
  AND (title_gu IS NULL OR summary_gu IS NULL);
