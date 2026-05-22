-- Re-seed M2 demo rows after users exist (safe to re-run)
DO $$
DECLARE
  admin_uid UUID;
  buyer_uid UUID;
  listing_rec RECORD;
  n INT := 0;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@realpoint.local' LIMIT 1;
  SELECT id INTO buyer_uid FROM auth.users WHERE email = 'buyer@realpoint.local' LIMIT 1;
  IF admin_uid IS NULL OR buyer_uid IS NULL THEN
    RAISE NOTICE 'Skip: create users with pnpm seed:users first';
    RETURN;
  END IF;

  DELETE FROM listing_inquiries
  WHERE user_id = buyer_uid
    AND message LIKE '%visit this property on Saturday%';

  FOR listing_rec IN
    SELECT id FROM listings
    WHERE user_id = admin_uid AND status = 'published'
    ORDER BY created_at DESC
    LIMIT 3
  LOOP
    n := n + 1;
    INSERT INTO listing_inquiries (listing_id, user_id, message, contact_phone)
    SELECT
      listing_rec.id,
      buyer_uid,
      CASE n
        WHEN 1 THEN 'I would like to visit this property on Saturday. Is morning OK?'
        WHEN 2 THEN 'Please share NA status and latest 7/12 copy if available.'
        ELSE 'What is the best price for quick closure?'
      END,
      '+919800000001'
    WHERE NOT EXISTS (
      SELECT 1 FROM listing_inquiries li
      WHERE li.listing_id = listing_rec.id AND li.user_id = buyer_uid
    );
  END LOOP;
END $$;
